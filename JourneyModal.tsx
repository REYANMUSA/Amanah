import React, { useState, useEffect } from 'react';
import { CalendarDays, Plus, Trash2, X, Image as ImageIcon, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { Memory, MemoryEventType } from '../../types/database';
import { dataService, getTodayKey } from '../../lib/storage/dataService';
import { playCalmChime, triggerHapticFeedback } from '../../lib/notifications/notificationService';

interface JourneyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EVENT_TYPES: MemoryEventType[] = [
  'Important date',
  'Day met',
  'Day talked',
  'Day chose not to talk',
  'Past',
  'Present',
  'Future',
  'Birthday',
  'Celebration',
];

export const JourneyModal: React.FC<JourneyModalProps> = ({ isOpen, onClose }) => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [postSuccessMessage, setPostSuccessMessage] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState(getTodayKey());
  const [eventType, setEventType] = useState<MemoryEventType>('Important date');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const loadMemories = () => {
    const list = dataService.getMemories();
    // Sort chronologically
    list.sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());
    setMemories(list);
  };

  useEffect(() => {
    if (isOpen) {
      loadMemories();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSaving) return; // Prevent double execution
    setIsSaving(true);
    triggerHapticFeedback();

    try {
      await dataService.createMemory({
        title: title.trim(),
        description: description.trim(),
        event_date: eventDate,
        event_type: eventType,
        image_url: photoPreview || undefined,
      });

      loadMemories();
      setShowAddModal(false);
      setTitle('');
      setDescription('');
      setPhotoPreview(null);
      playCalmChime();
      setPostSuccessMessage('Milestone recorded to your timeline.');
      setTimeout(() => setPostSuccessMessage(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this milestone memory?')) {
      await dataService.deleteMemory(id);
      loadMemories();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl bg-[#FBFBF9] border border-[#E3DDD1] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EAE6DD]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#988158] text-[#F7F3E9] flex items-center justify-center">
              <CalendarDays className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-[#1F2421]">Our Journey</h2>
              <span className="text-[10px] text-[#7A6B53]">Past, present, and future milestones</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#6B756E] hover:text-[#1F2421]"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {postSuccessMessage && (
            <div className="p-3 rounded-xl bg-[#EBF3ED] border border-[#C1DEC9] text-xs text-[#1C512C] font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#2E473B] shrink-0" />
              <span>{postSuccessMessage}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#1F2421] uppercase tracking-wider">
              Journey Timeline ({memories.length})
            </span>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1 text-xs font-medium text-[#2E473B] hover:text-[#1F2421]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Milestone</span>
            </button>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E3DDD1]">
            {memories.map((m) => (
              <div key={m.id} className="relative group">
                {/* Timeline circle node */}
                <div className="absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full bg-[#988158] border-2 border-white shadow-xs" />

                <div className="p-4 rounded-2xl bg-white border border-[#EAE6DD] shadow-xs space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-semibold text-[#7A6B53] uppercase tracking-wider">
                        {m.event_type} · {new Date(m.event_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                      <h3 className="text-sm font-semibold text-[#1F2421] mt-0.5">
                        {m.title}
                      </h3>
                    </div>
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="p-1 text-[#9CA69F] hover:text-[#B93815] transition-colors"
                      title="Delete milestone"
                      aria-label="Delete milestone"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {m.description && (
                    <p className="text-xs text-[#505D54] leading-relaxed">
                      {m.description}
                    </p>
                  )}

                  {m.image_url && (
                    <div className="rounded-xl overflow-hidden mt-2 max-h-48 border border-[#EAE6DD]">
                      <img
                        src={m.image_url}
                        alt={m.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Resilient fallback container if broken
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add Milestone Submodal */}
        {showAddModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <form onSubmit={handleCreateMemory} className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-[#E3DDD1] space-y-3">
              <h4 className="text-sm font-serif font-bold text-[#1F2421]">New Milestone Event</h4>

              <div>
                <label className="block text-[11px] font-medium text-[#505D54] mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Day family formally agreed"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[#D5CEC2] text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-[#505D54] mb-1">Date</label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-[#D5CEC2] text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#505D54] mb-1">Type</label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as MemoryEventType)}
                    className="w-full px-3 py-2 rounded-xl border border-[#D5CEC2] text-xs bg-white"
                  >
                    {EVENT_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#505D54] mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-[#D5CEC2] text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#505D54] mb-1">
                  Photo (Camera or Gallery)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="w-full text-xs text-[#6B756E]"
                />
                {photoPreview && (
                  <div className="mt-2 w-16 h-16 rounded-lg overflow-hidden border border-[#D5CEC2]">
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 rounded-xl border border-[#DCD6C8] text-xs text-[#505D54]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2 rounded-xl bg-[#2E473B] text-white text-xs font-medium hover:bg-[#23382D] disabled:opacity-50 flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xs"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#E2D4B7]" />
                      <span>Posting...</span>
                    </>
                  ) : (
                    <span>Save Milestone</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
