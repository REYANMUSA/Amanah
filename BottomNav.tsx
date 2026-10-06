import React from 'react';
import { Home, LineChart, BookOpen, HeartHandshake } from 'lucide-react';

export type NavTab = 'home' | 'progress' | 'deen' | 'us';

interface BottomNavProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
}) => {
  const tabs = [
    { id: 'home' as NavTab, label: 'Home', icon: Home },
    { id: 'progress' as NavTab, label: 'Progress', icon: LineChart },
    { id: 'deen' as NavTab, label: 'Deen', icon: BookOpen },
    { id: 'us' as NavTab, label: 'Us', icon: HeartHandshake },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#FBFBF9]/95 backdrop-blur-md border-t border-[#EAE6DD] pb-safe">
      <div className="max-w-md mx-auto grid grid-cols-4 h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className="flex flex-col items-center justify-center min-h-[44px] w-full transition-colors relative py-1 focus:outline-none"
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive
                      ? 'text-[#2E473B] scale-105 stroke-[2.4]'
                      : 'text-[#87928A] hover:text-[#505D54] stroke-[1.8]'
                  }`}
                />
              </div>
              <span
                className={`text-[11px] font-medium tracking-tight mt-1 transition-colors ${
                  isActive ? 'text-[#2E473B] font-semibold' : 'text-[#87928A]'
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-[#2E473B]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
