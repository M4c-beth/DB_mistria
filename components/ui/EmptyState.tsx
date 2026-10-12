import { ShoppingBasket } from 'lucide-react';

export function EmptyState({ title, children }: { title: string; children?: React.ReactNode }): React.JSX.Element {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-amber-200 bg-amber-50/60 px-6 py-12 text-center">
      <ShoppingBasket aria-hidden className="size-12 text-harvest-gold" strokeWidth={1.5} />
      <p className="font-heading text-lg font-bold text-stone-800">{title}</p>
      {children && <div className="max-w-sm text-sm text-stone-600">{children}</div>}
    </div>
  );
}
