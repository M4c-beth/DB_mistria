import { Bug, CalendarDays, FileDown, Fish, House, Sprout, Users, type LucideIcon } from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Pathname prefix that marks this item active. */
  match: string;
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Home', icon: House, match: '/' },
  { href: '/villagers/', label: 'Villagers', icon: Users, match: '/villagers' },
  { href: '/fish/', label: 'Fish', icon: Fish, match: '/fish' },
  { href: '/bugs/', label: 'Bugs', icon: Bug, match: '/bugs' },
  { href: '/crops/', label: 'Crops', icon: Sprout, match: '/crops' },
  { href: '/seasons/spring/', label: 'Seasons', icon: CalendarDays, match: '/seasons' },
  { href: '/guide/', label: 'My Guide', icon: FileDown, match: '/guide' },
];

export function isActive(item: NavItem, pathname: string): boolean {
  return item.match === '/' ? pathname === '/' : pathname.startsWith(item.match);
}
