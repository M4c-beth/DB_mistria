'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GuideCount } from '@/components/guide/GuideCount';
import { SpoilerToggle } from '@/components/spoiler/SpoilerToggle';
import { NAV_ITEMS, isActive } from './navItems';

const STORAGE_KEY = 'mistria-sidebar-collapsed';

export function Sidebar(): React.JSX.Element {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem(STORAGE_KEY) === '1');
    } catch {
      /* storage unavailable */
    }
  }, []);

  const toggle = (): void => {
    setCollapsed((c) => {
      try {
        window.localStorage.setItem(STORAGE_KEY, c ? '0' : '1');
      } catch {
        /* storage unavailable */
      }
      return !c;
    });
  };

  return (
    <aside
      className={cn(
        'sticky top-0 hidden h-screen shrink-0 flex-col border-r border-amber-200 bg-amber-50 transition-[width] duration-200 md:flex',
        collapsed ? 'w-[4.5rem]' : 'w-60',
      )}
    >
      <div className="flex h-16 items-center gap-2 border-b border-amber-200 px-4">
        <Link href="/" className="flex min-w-0 items-center gap-2 rounded-md">
          <span aria-hidden className="text-2xl">🌾</span>
          {!collapsed && (
            <span className="truncate font-heading text-lg font-extrabold text-wood-brown-ink">Mistria Almanac</span>
          )}
        </Link>
      </div>
      <nav aria-label="Main" className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item, pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex h-10 items-center gap-3 rounded-md px-3 text-sm font-semibold transition-colors',
                active ? 'bg-mistria-green/15 text-mistria-green-ink' : 'text-stone-600 hover:bg-amber-100 hover:text-stone-800',
              )}
            >
              <Icon aria-hidden className="size-5 shrink-0" />
              {!collapsed && <span className="flex-1">{item.label}</span>}
              {!collapsed && item.match === '/guide' && <GuideCount />}
            </Link>
          );
        })}
      </nav>
      <div className="mx-3 border-t border-amber-200 pt-3">
        <SpoilerToggle compact={collapsed} />
      </div>
      <button
        type="button"
        onClick={toggle}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="m-3 flex h-10 items-center gap-3 rounded-md px-3 text-sm text-stone-600 hover:bg-amber-100"
      >
        {collapsed ? <PanelLeftOpen aria-hidden className="size-5" /> : <PanelLeftClose aria-hidden className="size-5" />}
        {!collapsed && 'Collapse'}
      </button>
    </aside>
  );
}
