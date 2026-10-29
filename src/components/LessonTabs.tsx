import { BookOpen, FlaskConical, Code2, ListChecks } from 'lucide-react';

export const lessonTabs = [
  { id: 'understand', label: 'Understand', icon: BookOpen },
  { id: 'derive', label: 'Derivation', icon: FlaskConical },
  { id: 'code', label: 'Python', icon: Code2 },
  { id: 'practice', label: 'Practice', icon: ListChecks },
] as const;
export type LessonTab = (typeof lessonTabs)[number]['id'];

export function LessonTabs({
  selected,
  onChange,
}: {
  selected: LessonTab;
  onChange: (tab: LessonTab) => void;
}) {
  return (
    <div className="lesson-tabs" id="lesson-sections" role="tablist" aria-label="Lesson sections">
      {lessonTabs.map((tab, index) => (
        <button
          key={tab.id}
          id={'tab-' + tab.id}
          role="tab"
          aria-selected={selected === tab.id}
          tabIndex={selected === tab.id ? 0 : -1}
          aria-controls="lesson-panel"
          onClick={() => onChange(tab.id)}
          onKeyDown={(event) => {
            const next =
              event.key === 'ArrowRight'
                ? (index + 1) % 4
                : event.key === 'ArrowLeft'
                  ? (index + 3) % 4
                  : event.key === 'Home'
                    ? 0
                    : event.key === 'End'
                      ? 3
                      : null;
            if (next !== null) {
              event.preventDefault();
              onChange(lessonTabs[next].id);
              document.getElementById('tab-' + lessonTabs[next].id)?.focus();
            }
          }}
        >
          <tab.icon size={15} />
          {tab.label}
        </button>
      ))}
    </div>
  );
}
