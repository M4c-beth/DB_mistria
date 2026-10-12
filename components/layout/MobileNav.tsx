'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { GuideCount } from '@/components/guide/GuideCount';
import { NAV_ITEMS, isActive } from './navItems';

/** Bottom tab bar for small screens; Home is reachable via the header logo. */
export function MobileNav(): React.JSX.Element {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-6 border-t border-amber-200 bg-amber-50/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      {NAV_ITEMS.filter((i) => i.match !== '/').map((item) => {
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
    </nav>
  );
}
