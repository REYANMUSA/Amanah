import React, { useState, useEffect } from 'react';
import { GraduationCap, Plus, Trash2, Edit3, X, Check } from 'lucide-react';
import { Course } from '../../types/database';
import { dataService } from '../../lib/storage/dataService';
import { triggerHapticFeedback, playCalmChime } from '../../lib/notifications/notificationService';

interface CoursesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CoursesModal: React.FC<CoursesModalProps> = ({ isOpen, onClose }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [courseName, setCourseName] = useState('');
  const [owner, setOwner] = useState('Me');
  const [description, setDescription] = useState('');
  const [daysPerWeek, setDaysPerWeek] = useState(4);
  const [expectedDays, setExpectedDays] = useState(60);
  const [notes, setNotes] = useState('');
  const [initialProgress, setInitialProgress] = useState(0);

  // Delete confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const loadCourses = () => {
    setCourses(dataService.getCourses());
  };

  useEffect(() => {
    if (isOpen) {
      loadCourses();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseName.trim()) return;

    await dataService.createCourse({
      name: courseName.trim(),
      owner,
      description: description.trim(),
      progress: initialProgress,
      days_per_week: daysPerWeek,
      expected_days: expectedDays,
      notes: notes.trim(),
      active: true,
    });

    loadCourses();
    setShowAddModal(false);
    setCourseName('');
    setDescription('');
    setNotes('');
    setInitialProgress(0);
    playCalmChime();
  };

  const handleProgressChange = async (id: string, current: number, delta: number) => {
    triggerHapticFeedback();
    const nextVal = Math.min(100, Math.max(0, current + delta));
    await dataService.updateCourse(id, { progress: nextVal });
    loadCourses();
  };

  const handleDelete = async (id: string) => {
    await dataService.deleteCourse(id);
    setDeleteConfirmId(null);
    loadCourses();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl bg-[#FBFBF9] border border-[#E3DDD1] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EAE6DD]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#2E473B] text-[#F7F3E9] flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-[#1F2421]">Courses & Studies</h2>
              <span className="text-[10px] text-[#7A6B53]">Personal skill development</span>
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
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#1F2421] uppercase tracking-wider">
              Enrolled Courses ({courses.length})
            </span>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1 text-xs font-medium text-[#2E473B] hover:text-[#1F2421]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Course</span>
            </button>
          </div>

          {courses.length === 0 ? (
            <div className="p-6 text-center rounded-2xl border border-dashed border-[#DCD6C8] text-xs text-[#7A857D]">
              No courses registered yet. Add a study topic (e.g. Arabic, Quranic Grammar, Tech skills).
            </div>
          ) : (
            courses.map((course) => (
              <div
                key={course.id}
                className="p-4 rounded-2xl bg-white border border-[#EAE6DD] shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-[#1F2421]">
                      {course.name}
                    </h3>
                    <p className="text-[10px] text-[#7A6B53] mt-0.5">
                      Owner: {course.owner} · {course.days_per_week} days/week · Expected: {course.expected_days} days
                    </p>
                  </div>

                  {/* Delete button with confirmation step */}
                  {deleteConfirmId === course.id ? (
                    <div className="flex items-center gap-1.5 bg-[#FAECE7] px-2 py-1 rounded-lg">
                      <span className="text-[10px] text-[#B93815] font-medium">Delete?</span>
                      <button
                        onClick={() => handleDelete(course.id)}
                        className="text-[10px] font-bold text-[#B93815] hover:underline"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="text-[10px] text-[#505D54] hover:underline ml-1"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(course.id)}
                      className="p-1 text-[#9CA69F] hover:text-[#B93815] transition-colors"
                      title="Delete course"
                      aria-label="Delete course"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {course.description && (
                  <p className="text-xs text-[#505D54] leading-relaxed">
                    {course.description}
                  </p>
                )}

                {/* Progress bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#6B756E]">Progress</span>
                    <span className="font-mono font-bold text-[#1F2421]">{course.progress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#EFECE6] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#2E473B] transition-all duration-300"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>

                  <div className="flex justify-end gap-1.5 pt-1">
                    <button
                      onClick={() => handleProgressChange(course.id, course.progress, -5)}
                      className="px-2 py-0.5 rounded-md border border-[#D5CEC2] text-[10px] text-[#505D54]"
                    >
                      -5%
                    </button>
                    <button
                      onClick={() => handleProgressChange(course.id, course.progress, 5)}
                      className="px-2 py-0.5 rounded-md border border-[#D5CEC2] text-[10px] text-[#505D54]"
                    >
                      +5%
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Course Submodal */}
        {showAddModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <form onSubmit={handleCreateCourse} className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-[#E3DDD1] space-y-3">
              <h4 className="text-sm font-serif font-bold text-[#1F2421]">New Course</h4>

              <div>
                <label className="block text-[11px] font-medium text-[#505D54] mb-1">Course Name</label>
                <input
                  type="text"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="e.g. Classical Arabic Vocabulary"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[#D5CEC2] text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-[#505D54] mb-1">Owner</label>
                  <select
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#D5CEC2] text-xs bg-white"
                  >
                    <option value="Me">Me</option>
                    <option value="Partner">Partner</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#505D54] mb-1">Days / Week</label>
                  <input
                    type="number"
                    min="1"
                    max="7"
                    value={daysPerWeek}
                    onChange={(e) => setDaysPerWeek(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 rounded-xl border border-[#D5CEC2] text-xs"
                  />
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
                  className="flex-1 py-2 rounded-xl bg-[#2E473B] text-white text-xs font-medium"
                >
                  Create Course
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
