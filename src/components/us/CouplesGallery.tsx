import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Plus, 
  Trash2, 
  Calendar, 
  Heart, 
  Sparkles, 
  X, 
  Maximize2, 
  Image as ImageIcon,
  Check,
  Lock
} from 'lucide-react';
import { Memory, MemoryEventType } from '../../types/database';
import { dataService, getTodayKey } from '../../lib/storage/dataService';
import { triggerHapticFeedback, playCalmChime } from '../../lib/notifications/notificationService';
import confetti from 'canvas-confetti';

interface CouplesGalleryProps {
  memories: Memory[];
  onUpdateMemories: (updated: Memory[]) => void;
  isLinked?: boolean;
  partnerName?: string;
}

const PRESET_PHOTOS = [
  {
    name: 'Halal Union & Rings',
    url: '/src/assets/images/halal_union_rings_1791122453172.jpg',
  },
  {
    name: 'Quiet Morning Tea',
    url: '/src/assets/images/peaceful_tea_moment_1791122467497.jpg',
  },
  {
    name: 'Peaceful Path',
    url: '/src/assets/images/journey_peaceful_path_1791120045293.jpg',
  },
  {
    name: 'Morning Calm & Light',
    url: '/src/assets/images/amanah_morning_calm_1791120033770.jpg',
  },
];

const EVENT_TYPES: MemoryEventType[] = [
  'Important date',
  'Day met',
  'Day talked',
  'Day chose not to talk',
  'Birthday',
  'Celebration',
];

export const CouplesGallery: React.FC<CouplesGalleryProps> = ({
  memories,
  onUpdateMemories,
  isLinked = false,
  partnerName,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState(getTodayKey());
  const [eventType, setEventType] = useState<MemoryEventType>('Important date');
  const [imageUrl, setImageUrl] = useState<string>(PRESET_PHOTOS[0].url);
  const [customImageLoading, setCustomImageLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Resize and convert uploaded file to lightweight base64 DataURL
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCustomImageLoading(true);
    triggerHapticFeedback();

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 900;
        const scale = Math.min(1, MAX_WIDTH / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressed = canvas.toDataURL('image/jpeg', 0.82);
          setImageUrl(compressed);
        }
        setCustomImageLoading(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleAddMoment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    triggerHapticFeedback();
    const newMem = await dataService.createMemory({
      title: title.trim(),
      description: description.trim(),
      event_date: eventDate,
      event_type: eventType,
      image_url: imageUrl || PRESET_PHOTOS[0].url,
    });

    const updated = [newMem, ...memories];
    onUpdateMemories(updated);

    // Reset form
    setTitle('');
    setDescription('');
    setEventDate(getTodayKey());
    setImageUrl(PRESET_PHOTOS[0].url);
    setShowAddModal(false);
    playCalmChime();

    try {
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#7F5353', '#E2D4B7', '#2E473B'],
      });
    } catch {}
  };

  const handleDeleteMoment = async (id: string) => {
    if (confirm('Delete this moment from your private gallery?')) {
      triggerHapticFeedback();
      await dataService.deleteMemory(id);
      const updated = memories.filter((m) => m.id !== id);
      onUpdateMemories(updated);
      setSelectedMemory(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Gallery Header */}
      <div className="p-4 rounded-3xl bg-white border border-[#EAE6DD] shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-[#FAF0E6] border border-[#EADBBD] flex items-center justify-center text-[#7F5353] shadow-xs shrink-0">
            <Heart className="w-4 h-4 fill-[#7F5353]/30" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-serif font-bold text-[#1F2421]">
                Couples Gallery · ذكرياتنا
              </span>
              <span className="flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full bg-[#FAF5EA] text-[#8B6E38] font-medium border border-[#EADBBD]">
                <Lock className="w-2.5 h-2.5" />
                <span>{isLinked ? `Shared with ${partnerName || 'Partner'}` : 'Private to you'}</span>
              </span>
            </div>
            <p className="text-[11px] text-[#7A6B53]">
              {isLinked ? `Cherish shared moments and milestones with ${partnerName || 'your partner'}.` : 'Cherish shared milestones and peaceful memories together.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            triggerHapticFeedback();
            setShowAddModal(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2E473B] text-white text-xs font-medium hover:bg-[#23372E] active:scale-95 transition-all shadow-xs shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Moment</span>
        </button>
      </div>

      {/* Grid of Shared Moments */}
      {memories.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
          {memories.map((m) => (
            <div
              key={m.id}
              onClick={() => {
                triggerHapticFeedback();
                setSelectedMemory(m);
              }}
              className="group relative rounded-2xl overflow-hidden bg-white border border-[#EAE6DD] shadow-xs cursor-pointer hover:shadow-md transition-all flex flex-col"
            >
              {/* Image Aspect ratio box */}
              <div className="aspect-4/3 w-full bg-[#EFECE6] relative overflow-hidden">
                {m.image_url ? (
                  <img
                    src={m.image_url}
                    alt={m.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#9CA69F]">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                )}
                {/* Overlay event badge */}
                <div className="absolute top-2 left-2">
                  <span className="px-2 py-0.5 rounded-lg bg-black/50 backdrop-blur-xs text-[9px] font-semibold text-white tracking-wider uppercase">
                    {m.event_type}
                  </span>
                </div>
              </div>

              {/* Card Meta */}
              <div className="p-3 flex-1 flex flex-col justify-between space-y-1">
                <h4 className="text-xs font-semibold text-[#1F2421] line-clamp-1 group-hover:text-[#2E473B] transition-colors">
                  {m.title}
                </h4>
                {m.description && (
                  <p className="text-[11px] text-[#6B756E] line-clamp-2 leading-relaxed">
                    {m.description}
                  </p>
                )}
                <div className="flex items-center gap-1 text-[10px] text-[#7A6B53] pt-1">
                  <Calendar className="w-3 h-3 text-[#A58957]" />
                  <span>
                    {new Date(m.event_date).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 rounded-3xl bg-white border border-dashed border-[#D5CEC2] text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#FAF0E6] text-[#7F5353] flex items-center justify-center mx-auto">
            <Heart className="w-6 h-6 fill-[#7F5353]/20" />
          </div>
          <h3 className="text-sm font-serif font-bold text-[#1F2421]">
            No Moments Saved Yet
          </h3>
          <p className="text-xs text-[#6B756E] max-w-xs mx-auto leading-relaxed">
            Begin storing your memories, nikah milestones, or peaceful everyday reflections here together.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-[#2E473B] text-white text-xs font-medium hover:bg-[#23372E]"
          >
            Add Your First Moment
          </button>
        </div>
      )}

      {/* LIGHTBOX MODAL */}
      {selectedMemory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-white overflow-hidden shadow-2xl border border-[#E3DDD1] max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 flex items-center justify-between border-b border-[#EAE6DD]">
              <div>
                <span className="text-[10px] font-semibold text-[#8B6E38] uppercase tracking-wider">
                  {selectedMemory.event_type}
                </span>
                <h3 className="text-sm font-serif font-bold text-[#1F2421]">
                  {selectedMemory.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedMemory(null)}
                className="p-1.5 rounded-full hover:bg-[#F4F1EA] text-[#6B756E]"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Image */}
            <div className="overflow-y-auto flex-1 p-4 space-y-4">
              {selectedMemory.image_url && (
                <div className="rounded-2xl overflow-hidden max-h-80 w-full bg-[#1A1E1B] flex items-center justify-center">
                  <img
                    src={selectedMemory.image_url}
                    alt={selectedMemory.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain max-h-80"
                  />
                </div>
              )}

              {/* Date & Note */}
              <div className="flex items-center gap-1.5 text-xs text-[#7A6B53]">
                <Calendar className="w-3.5 h-3.5 text-[#A58957]" />
                <span className="font-medium">
                  {new Date(selectedMemory.event_date).toLocaleDateString(undefined, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>

              {selectedMemory.description && (
                <div className="p-3.5 rounded-2xl bg-[#FAF8F3] border border-[#ECE5D8] text-xs text-[#3E4942] leading-relaxed">
                  «{selectedMemory.description}»
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#EAE6DD] flex items-center justify-between bg-[#FBFBF9]">
              <button
                onClick={() => handleDeleteMoment(selectedMemory.id)}
                className="flex items-center gap-1 text-xs text-[#B93815] hover:underline"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Moment</span>
              </button>

              <button
                onClick={() => setSelectedMemory(null)}
                className="px-4 py-1.5 rounded-xl bg-[#2E473B] text-white text-xs font-medium"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD MOMENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <form
            onSubmit={handleAddMoment}
            className="w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl border border-[#E3DDD1] max-h-[92vh] overflow-y-auto space-y-3.5"
          >
            <div className="flex items-center justify-between border-b border-[#EAE6DD] pb-3">
              <div>
                <span className="text-[10px] font-semibold text-[#8B6E38] uppercase tracking-wider block">
                  Private Sanctuary
                </span>
                <h3 className="text-base font-serif font-bold text-[#1F2421]">
                  Add a Shared Moment
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-full hover:bg-[#F4F1EA] text-[#6B756E]"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Image Preview & Upload */}
            <div className="space-y-2">
              <label className="block text-[11px] font-semibold text-[#445047]">
                Moment Photo
              </label>

              <div className="relative aspect-16/9 rounded-2xl overflow-hidden bg-[#F6F4ED] border border-[#E5DFD3] flex items-center justify-center">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center text-xs text-[#7E8B82]">
                    <Camera className="w-6 h-6 mx-auto mb-1 text-[#9CA69F]" />
                    <span>No photo selected</span>
                  </div>
                )}

                {/* Upload Button Overlay */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-2 right-2 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-xs text-white text-xs font-medium hover:bg-black/80 transition-colors shadow-xs"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{customImageLoading ? 'Loading...' : 'Upload Photo'}</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              {/* Or select from quiet aesthetic presets */}
              <div>
                <span className="text-[10px] text-[#7A857D] font-medium block mb-1">
                  Or select a calm milestone preset:
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {PRESET_PHOTOS.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => setImageUrl(p.url)}
                      className={`relative aspect-4/3 rounded-lg overflow-hidden border transition-all ${
                        imageUrl === p.url
                          ? 'border-[#2E473B] ring-2 ring-[#2E473B]/30'
                          : 'border-[#EAE6DD] opacity-70 hover:opacity-100'
                      }`}
                      title={p.name}
                    >
                      <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                      {imageUrl === p.url && (
                        <div className="absolute inset-0 bg-[#2E473B]/20 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-white drop-shadow-xs" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-[11px] font-medium text-[#505D54] mb-1">
                Moment Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Fajr prayer together at the mosque"
                required
                className="w-full px-3 py-2 rounded-xl border border-[#D5CEC2] text-xs focus:outline-none focus:ring-1 focus:ring-[#2E473B]"
              />
            </div>

            {/* Date and Category */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-[#505D54] mb-1">
                  Event Date
                </label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-[#D5CEC2] text-xs bg-white text-[#1F2421]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#505D54] mb-1">
                  Category Tag
                </label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value as MemoryEventType)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-[#D5CEC2] text-xs bg-white text-[#1F2421]"
                >
                  {EVENT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Note / Description */}
            <div>
              <label className="block text-[11px] font-medium text-[#505D54] mb-1">
                Heartfelt Note / Memory
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="What made this moment special or grateful to Allah?"
                className="w-full px-3 py-2 rounded-xl border border-[#D5CEC2] text-xs focus:outline-none focus:ring-1 focus:ring-[#2E473B]"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-2 border-t border-[#EAE6DD]">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2 rounded-xl border border-[#DCD6C8] text-xs text-[#505D54]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-[#2E473B] text-white text-xs font-semibold hover:bg-[#23372E] shadow-xs"
              >
                Save Moment
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
