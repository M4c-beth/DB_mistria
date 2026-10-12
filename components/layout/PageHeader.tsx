export function PageHeader({ title, children }: { title: string; children?: React.ReactNode }): React.JSX.Element {
  return (
    <div className="mb-6">
      <h1 className="text-3xl md:text-4xl">{title}</h1>
      {children && <p className="mt-2 max-w-2xl text-stone-600">{children}</p>}
    </div>
  );
}
