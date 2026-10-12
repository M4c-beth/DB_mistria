'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GuideCount } from '@/components/guide/GuideCount';
import { SpoilerToggle } from '@/components/spoiler/SpoilerToggle';
import { NAV_ITEMS, isActive } from './navItems';

/** Bottom tab bar for small screens with the main tabs plus a "More" sheet for the rest. */
export function MobileNav(): React.JSX.Element {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const tabs = NAV_ITEMS.filter((i) => i.mobileTab);
  const more = NAV_ITEMS.filter((i) => !i.mobileTab);
  const moreActive = more.some((i) => isActive(i, pathname));

  // Close the sheet after navigating.
  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 md:hidden" role="dialog" aria-modal="true" aria-label="More pages">
          <button type="button" aria-label="Close menu" className="absolute inset-0 bg-stone-800/30" onClick={() => setOpen(false)} />
          <nav
            aria-label="More"
            className="absolute inset-x-0 bottom-14 rounded-t-xl border-t border-amber-200 bg-amber-50 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-lg"
          >
            <ul className="grid grid-cols-2 gap-2">
              {more.map((item) => {
                const Icon = item.icon;
                const active = isActive(item, pathname);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'flex h-12 items-center gap-3 rounded-md px-3 text-sm font-semibold',
                        active ? 'bg-mistria-green/15 text-mistria-green-ink' : 'text-stone-800 hover:bg-amber-100',
                      )}
                    >
                      <Icon aria-hidden className="size-5" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="mt-2 border-t border-amber-200 pt-2">
              <SpoilerToggle />
            </div>
          </nav>
        </div>
      )}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-amber-200 bg-amber-50/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        {tabs.map((item) => {
          const active = isActive(item, pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative flex h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold',
                active ? 'text-mistria-green-ink' : 'text-stone-600',
              )}
            >
              <Icon aria-hidden className="size-5" />
              {item.label === 'My Guide' ? 'Guide' : item.label}
              {item.match === '/guide' && (
                <span className="absolute right-2 top-1">
                  <GuideCount />
                </span>
              )}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className={cn(
            'flex h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold',
            open || moreActive ? 'text-mistria-green-ink' : 'text-stone-600',
          )}
        >
          {open ? <X aria-hidden className="size-5" /> : <Menu aria-hidden className="size-5" />}
          More
        </button>
      </nav>
    </>
  );
}
