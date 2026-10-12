'use client';

import { useId, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import type { Schedule } from '@/lib/data/schemas';
import { cn } from '@/lib/utils';
import { SpoilerText } from '@/components/spoiler/SpoilerText';

/** One tab per wiki schedule section (seasons, rainy days, Friday nights). */
export function ScheduleTabs({ schedule }: { schedule: Schedule }): React.JSX.Element {
  const id = useId();
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const sections = schedule.sections;
  const current = sections[active] ?? sections[0];

  const onKeyDown = (e: React.KeyboardEvent): void => {
    const delta = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (active + delta + sections.length) % sections.length;
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <div>
      <div role="tablist" aria-label="Schedule" className="mb-4 flex flex-wrap gap-2" onKeyDown={onKeyDown}>
        {sections.map((s, i) => (
          <button
            key={s.title}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            role="tab"
            type="button"
            id={`${id}-tab-${i}`}
            aria-selected={i === active}
            aria-controls={`${id}-panel`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            className={cn(
              'pill',
              i === active
                ? 'border-mistria-green/40 bg-mistria-green/15 text-mistria-green-ink'
                : 'border-stone-300 bg-white/60 text-stone-600 hover:bg-amber-100',
            )}
          >
            {s.title}
          </button>
        ))}
      </div>

      {current && (
        <div role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-tab-${active}`} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {current.days.map((d, i) => (
            <div key={`${d.day}-${d.condition ?? ''}-${i}`} className="card overflow-hidden">
              <div className="border-b-2 border-wood-brown bg-stone-100 px-3 py-2">
                <h3 className="text-base">{d.day}</h3>
                {d.condition && <p className="text-xs text-stone-600">{d.condition}</p>}
              </div>
              <table className="w-full text-sm">
                <thead className="sr-only">
                  <tr>
                    <th scope="col">Leaves at</th>
                    <th scope="col">Goes to</th>
                  </tr>
                </thead>
                <tbody>
                  {d.stops.map((s, j) => (
                    <tr key={j} className="border-b border-stone-200 align-top last:border-0 odd:bg-stone-50">
                      <td className="whitespace-nowrap px-3 py-1.5 font-mono text-xs tabular-nums text-wood-brown-ink">{s.time}</td>
                      <td className="px-3 py-1.5">
                        <span className="inline-flex items-start gap-1">
                          <MapPin aria-hidden className="mt-0.5 size-3.5 shrink-0 text-stone-400" />
                          <SpoilerText text={s.place} />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
