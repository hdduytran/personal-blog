export function MainLayout({
  children,
  right,
}: {
  children: React.ReactNode
  right?: React.ReactNode
}) {
  return (
    <div className="mx-auto w-full max-w-[1480px] px-4 py-8 lg:grid lg:grid-cols-[minmax(0,1fr)_var(--sidebar-right-w)] lg:gap-10">
      <div className="min-w-0">{children}</div>
      {right && (
        <aside className="hidden lg:block">
          <div className="sticky top-8 space-y-6">{right}</div>
        </aside>
      )}
    </div>
  )
}
