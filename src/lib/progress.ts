import { LESSON_IDS } from '../math/parameters';
import type { LessonId } from '../math/parameters';

// Keep the original key so existing completion records survive layout changes.
const progressKey = 'ml-derived-progress-v1';
export function loadProgress(): LessonId[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(progressKey) || '[]');
    return Array.isArray(value)
      ? [...new Set<LessonId>(value.filter((id): id is LessonId => LESSON_IDS.includes(id)))]
      : [];
  } catch {
    return [];
  }
}
export function saveProgress(completed: LessonId[]) {
  localStorage.setItem(progressKey, JSON.stringify(completed));
}
