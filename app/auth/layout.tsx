export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--surface-2)] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-accent-fg text-[15px] font-bold">P</div>
          <span className="text-[20px] font-semibold tracking-tight">Pulse CRM</span>
        </div>
        {children}
      </div>
    </div>
  )
}
