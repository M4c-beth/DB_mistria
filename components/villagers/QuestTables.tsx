import type { Quests } from '@/lib/data/schemas';
import { cn } from '@/lib/utils';

/** Quest tables shown with the wiki's own columns; the first column (quest name) is emphasised. */
export function QuestTables({ quests }: { quests: Quests }): React.JSX.Element {
  return (
    <div className="space-y-6">
      {quests.tables.map((t, ti) => (
        <section key={`${t.title}-${ti}`} aria-label={t.title}>
          <h3 className="mb-2 text-lg">
            {t.title} <span className="text-sm font-normal tabular-nums text-stone-600">({t.rows.length})</span>
          </h3>
          <div className="table-scroll">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr>
                  {t.headers.map((h, i) => (
                    <th
                      key={`${h}-${i}`}
                      scope="col"
                      className="whitespace-nowrap border-b-2 border-wood-brown bg-stone-100 px-3 py-2 font-heading font-bold"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {t.rows.map((row, ri) => (
                  <tr key={ri} className="border-b border-stone-200 align-top odd:bg-stone-50 even:bg-white/40">
                    {t.headers.map((h, ci) => {
                      const isName = h === 'Name';
                      return (
                        <td
                          key={ci}
                          className={cn(
                            'whitespace-pre-line px-3 py-2',
                            isName && 'min-w-[9rem] font-semibold',
                            h === 'Description' && 'min-w-[16rem] text-stone-600',
                          )}
                        >
                          {row[ci] || <span className="text-stone-400">—</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}
