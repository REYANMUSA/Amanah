import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle, Sparkles, CalendarDays, ChevronRight } from 'lucide-react';
import { Relationship } from '../../types/database';
import { triggerHapticFeedback, playCalmChime } from '../../lib/notifications/notificationService';

interface SpiritualCheckInCardProps {
  relationship: Relationship;
  onUpdateRelationship: (updated: Relationship) => void;
}

const CHECKIN_TOPICS = [
  'Deen Alignment & Sacred Boundaries',
  'Patience & Husn al-Khuluq (Character)',
  'Financial Values & Simplicity in Mahr',
  'Family Ties & Parental Blessings (Silat ar-Rahim)',
  'Daily Consistency in Qur\'an & Tahajjud',
  'Future Home & Shared Halal Vision',
];

export const SpiritualCheckInCard: React.FC<SpiritualCheckInCardProps> = ({
  relationship,
  onUpdateRelationship,
}) => {
  const isLinked = relationship.status === 'accepted';
  const [topicIndex, setTopicIndex] = useState(0);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [checkInTime, setCheckInTime] = useState('20:00');
  const [checkInDay, setCheckInDay] = useState('Friday');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const currentTopic = CHECKIN_TOPICS[topicIndex % CHECKIN_TOPICS.length];

  const handleNextTopic = () => {
    triggerHapticFeedback();
    setTopicIndex((prev) => (prev + 1) % CHECKIN_TOPICS.length);
  };

  const handleDownloadCalendarEvent = () => {
    triggerHapticFeedback();
    playCalmChime();
    
    // Generate standard .ics Calendar event file
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Amanah Halal Union//Spiritual Checkin//EN',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      `SUMMARY:Amanah · Weekly Spiritual Reflection with ${relationship.partner_name || 'Prospective Partner'}`,
      `DESCRIPTION:Topic: ${currentTopic}\\nFocus: Alignment on deen, values, and respectful restraint.`,
      `DTSTART:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`,
      `DTEND:${new Date(Date.now() + 30 * 60 * 1000).toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`,
      'RRULE:FREQ=WEEKLY;BYDAY=FR',
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'amanah-weekly-checkin.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="p-4 rounded-2xl bg-white border border-[#EAE6DD] shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#FAF0E6] border border-[#EADBBD] flex items-center justify-center text-[#7F5353] shrink-0">
            <CalendarDays className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-serif font-bold text-[#1F2421]">
              Weekly Spiritual Check-in
            </h3>
            <p className="text-[11px] text-[#7A6B53]">
              {isLinked ? `Scheduled with ${relationship.partner_name || 'Partner'}` : 'Periodic reflection for respectful alignment'}
            </p>
          </div>
        </div>
        <button
          onClick={handleNextTopic}
          className="text-[10px] text-[#2E473B] font-semibold hover:underline flex items-center gap-0.5"
        >
          <span>Next Prompt</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* Suggested Topic Box */}
      <div className="p-3 rounded-xl bg-[#FAF8F3] border border-[#ECE6D9] space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-semibold uppercase tracking-wider text-[#7A6B53]">
            This Week's Reflection Focus
          </span>
          <span className="text-[10px] text-[#2E473B] flex items-center gap-1 font-medium">
            <Sparkles className="w-3 h-3" />
            <span>Prompt #{topicIndex + 1}</span>
          </span>
        </div>
        <p className="text-xs font-medium text-[#1F2421]">
          «{currentTopic}»
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#F0ECE1]">
        <div className="flex items-center gap-1 text-[11px] text-[#6B756E]">
          <Clock className="w-3.5 h-3.5 text-[#A58957]" />
          <span>Every Friday evening</span>
        </div>

        <button
          onClick={handleDownloadCalendarEvent}
          className="px-3 py-1.5 rounded-xl bg-[#2E473B] text-white text-[11px] font-medium hover:bg-[#23372E] active:scale-95 transition-all shadow-xs flex items-center gap-1.5"
        >
          {savedSuccess ? (
            <>
              <CheckCircle className="w-3.5 h-3.5 text-[#C1DEC9]" />
              <span>Added to Calendar</span>
            </>
          ) : (
            <>
              <Calendar className="w-3.5 h-3.5" />
              <span>Add to Calendar</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
