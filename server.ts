import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { apiRouter } from './src/server/api.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const distPath = path.resolve(__dirname, 'dist');

  app.use(express.json());
  app.use('/api', apiRouter);

  // Explicit routes for PWA manifest and service worker
  app.get(['/manifest.webmanifest', '/manifest.json'], (req, res) => {
    res.setHeader('Content-Type', 'application/manifest+json');
    const p = path.join(distPath, 'manifest.webmanifest');
    if (fs.existsSync(p)) return res.sendFile(p);
    const pub = path.resolve(__dirname, 'public/manifest.webmanifest');
    if (fs.existsSync(pub)) return res.sendFile(pub);
    res.status(404).send('Manifest not found');
  });

  app.get('/sw.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
    res.setHeader('Service-Worker-Allowed', '/');
    const pub = path.resolve(__dirname, 'public/sw.js');
    if (fs.existsSync(pub)) return res.sendFile(pub);
    const p = path.join(distPath, 'sw.js');
    if (fs.existsSync(p)) return res.sendFile(p);
    res.status(404).send('SW not found');
  });

  // Check if dist exists, if not build
  if (!fs.existsSync(distPath)) {
    try {
      const { execSync } = await import('child_process');
      execSync('npm run build', { stdio: 'inherit' });
    } catch (e) {
      console.warn('Could not run build synchronously:', e);
    }
  }

  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath, {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.webmanifest')) {
          res.setHeader('Content-Type', 'application/manifest+json');
        }
      }
    }));

    app.get('*', (req, res) => {
      // If it looks like a static asset that failed to load, return 404
      if (path.extname(req.path) && !req.path.endsWith('.html')) {
        return res.status(404).send('Not Found');
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    // If dist does not exist yet in dev mode, mount Vite dev server
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
