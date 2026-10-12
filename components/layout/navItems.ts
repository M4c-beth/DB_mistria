import { Bug, CalendarDays, CookingPot, FileDown, Fish, House, Leaf, Sprout, Users, type LucideIcon } from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Pathname prefix that marks this item active. */
  match: string;
  /** Shown directly in the mobile tab bar (the rest go under "More"). */
  mobileTab?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Home', icon: House, match: '/' },
  { href: '/villagers/', label: 'Villagers', icon: Users, match: '/villagers', mobileTab: true },
  { href: '/seasons/spring/', label: 'Seasons', icon: CalendarDays, match: '/seasons', mobileTab: true },
  { href: '/fish/', label: 'Fish', icon: Fish, match: '/fish' },
  { href: '/bugs/', label: 'Bugs', icon: Bug, match: '/bugs' },
  { href: '/crops/', label: 'Crops', icon: Sprout, match: '/crops' },
  { href: '/forage/', label: 'Forageables', icon: Leaf, match: '/forage' },
  { href: '/recipes/', label: 'Recipes', icon: CookingPot, match: '/recipes', mobileTab: true },
  { href: '/guide/', label: 'My Guide', icon: FileDown, match: '/guide', mobileTab: true },
];

export function isActive(item: NavItem, pathname: string): boolean {
  return item.match === '/' ? pathname === '/' : pathname.startsWith(item.match);
}
