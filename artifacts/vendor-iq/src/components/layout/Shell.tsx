import * as React from "react"
import { Link, useLocation } from "wouter"
import { 
  BarChart3, 
  Users, 
  ShieldAlert, 
  TrendingUp, 
  AlertTriangle, 
  FileText, 
  Network, 
  Newspaper, 
  Search, 
  Activity, 
  TestTube, 
  SlidersHorizontal, 
  PiggyBank, 
  Bell, 
  Bot,
  LogOut,
  Settings,
  Loader2,
  User,
  Building2,
  Mail,
  Shield,
  BellRing,
  Newspaper as NewsIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useGetCurrentUser, useGetSearchSuggestions, getGetSearchSuggestionsQueryKey } from "@workspace/api-client-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"

const mainNav = [
  { title: "Command Center", href: "/", icon: BarChart3 },
  { title: "Value Dashboard", href: "/savings", icon: PiggyBank },
  { title: "Semantic Search", href: "/search", icon: Search },
]

const intelligenceNav = [
  { title: "Supplier Registry", href: "/suppliers", icon: Users },
  { title: "Risk Intelligence", href: "/risk", icon: ShieldAlert },
  { title: "Price Forecast", href: "/forecast", icon: TrendingUp },
  { title: "Fraud Detection", href: "/fraud", icon: AlertTriangle },
  { title: "Contract Intel", href: "/contracts", icon: FileText },
  { title: "Market News", href: "/news", icon: Newspaper },
]

const advancedNav = [
  { title: "Knowledge Graph", href: "/graph", icon: Network },
  { title: "What-If Simulator", href: "/simulate", icon: SlidersHorizontal },
  { title: "Model Health", href: "/monitoring", icon: Activity },
  { title: "Experiment Tracker", href: "/experiments", icon: TestTube },
  { title: "AI Agent Hub", href: "/agents", icon: Bot },
]

function GlobalSearch() {
  const [, navigate] = useLocation()
  const [query, setQuery] = React.useState("")
  const [open, setOpen] = React.useState(false)
  const [focused, setFocused] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const debouncedQuery = useDebounce(query, 200)

  const { data: suggestions, isFetching } = useGetSearchSuggestions(
    { q: debouncedQuery },
    { query: { enabled: debouncedQuery.length >= 2, queryKey: getGetSearchSuggestionsQueryKey({ q: debouncedQuery }) } }
  )

  const showDropdown = focused && (query.length >= 2) && (isFetching || (suggestions && suggestions.length > 0))

  const handleSubmit = (value: string) => {
    if (!value.trim()) return
    setOpen(false)
    setFocused(false)
    inputRef.current?.blur()
    navigate(`/search?q=${encodeURIComponent(value.trim())}`)
  }

  // ⌘K / Ctrl+K to focus
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        inputRef.current?.focus()
        inputRef.current?.select()
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  // Close dropdown on outside click
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <div ref={containerRef} className="relative w-96 hidden md:flex items-center">
      <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true) }}
        onFocus={() => setFocused(true)}
        onKeyDown={e => {
          if (e.key === "Enter") handleSubmit(query)
          if (e.key === "Escape") { setFocused(false); inputRef.current?.blur() }
        }}
        placeholder="Search suppliers, contracts, alerts (Ctrl+K)..."
        className="h-9 w-full rounded-md border border-border/20 bg-card/50 pl-9 pr-12 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground"
      />
      {isFetching && query.length >= 2
        ? <Loader2 className="absolute right-10 h-3.5 w-3.5 text-muted-foreground animate-spin" />
        : null
      }
      <kbd className="pointer-events-none absolute right-2 top-2 hidden h-5 select-none items-center gap-1 rounded border border-border/20 bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex text-muted-foreground">
        <span className="text-xs">⌘</span>K
      </kbd>

      {showDropdown && (
        <div className="absolute top-full mt-1.5 left-0 w-full z-50 rounded-md border border-border/20 bg-popover shadow-xl overflow-hidden">
          {isFetching && (!suggestions || suggestions.length === 0) ? (
            <div className="px-4 py-3 text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Searching…
            </div>
          ) : (
            <ul>
              {suggestions?.map((s, i) => (
                <li key={i}>
                  <button
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-left hover:bg-accent hover:text-accent-foreground transition-colors"
                    onMouseDown={e => { e.preventDefault(); setQuery(s); handleSubmit(s) }}
                  >
                    <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate">{s}</span>
                  </button>
                </li>
              ))}
              {query.trim() && (
                <li className="border-t border-border/10">
                  <button
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-left text-primary hover:bg-primary/10 transition-colors"
                    onMouseDown={e => { e.preventDefault(); handleSubmit(query) }}
                  >
                    <Search className="h-3.5 w-3.5 shrink-0" />
                    <span>Search for "<strong>{query}</strong>"</span>
                  </button>
                </li>
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = React.useState(value)
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

export function Shell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation()
  const { data: currentUser } = useGetCurrentUser()
  const [settingsOpen, setSettingsOpen] = React.useState(false)
  const [logoutOpen, setLogoutOpen] = React.useState(false)

  // Notification preferences state
  const [notifs, setNotifs] = React.useState({
    criticalAlerts: true,
    priceSpikes: true,
    contractExpiry: true,
    fraudAlerts: true,
    weeklyDigest: false,
  })

  const handleLogout = () => {
    setLogoutOpen(false)
    toast.success("Signed out successfully", {
      description: "See you next time, " + (currentUser?.name?.split(" ")[0] ?? "there") + ".",
      duration: 3000,
    })
  }

  return (
    <>
    {/* Settings Sheet */}
    <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
      <SheetContent side="right" className="w-[400px] bg-background border-border/20 overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-lg font-display font-bold">Settings</SheetTitle>
          <SheetDescription className="text-muted-foreground text-sm">
            Manage your profile and notification preferences.
          </SheetDescription>
        </SheetHeader>

        {/* Profile section */}
        <div className="space-y-6">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Profile</h3>
            <div className="rounded-xl bg-card/50 border border-border/10 p-4 space-y-3">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary/80 to-primary/30 flex items-center justify-center font-bold text-lg text-white ring-2 ring-primary/30">
                  {currentUser?.avatarInitials ?? "··"}
                </div>
                <div>
                  <div className="font-semibold text-base">{currentUser?.name}</div>
                  <div className="text-sm text-muted-foreground">{currentUser?.role}</div>
                </div>
              </div>
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span>sarah.jenkins@vendoriq.com</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4 shrink-0" />
                  <span>{currentUser?.company}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4 shrink-0" />
                  <span>Admin · Full access</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notification preferences */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Notifications</h3>
            <div className="rounded-xl bg-card/50 border border-border/10 divide-y divide-border/10">
              {[
                { key: "criticalAlerts" as const, icon: <ShieldAlert className="h-4 w-4 text-destructive" />, label: "Critical Alerts", desc: "Fraud and high-risk supplier flags" },
                { key: "priceSpikes" as const, icon: <TrendingUp className="h-4 w-4 text-amber-400" />, label: "Price Spikes", desc: "Commodity price deviation alerts" },
                { key: "contractExpiry" as const, icon: <FileText className="h-4 w-4 text-blue-400" />, label: "Contract Expiry", desc: "Contracts expiring within 90 days" },
                { key: "fraudAlerts" as const, icon: <AlertTriangle className="h-4 w-4 text-amber-400" />, label: "Fraud Alerts", desc: "Invoice and vendor anomalies" },
                { key: "weeklyDigest" as const, icon: <NewsIcon className="h-4 w-4 text-primary" />, label: "Weekly Digest", desc: "Summary email every Monday" },
              ].map(({ key, icon, label, desc }) => (
                <div key={key} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    {icon}
                    <div>
                      <div className="text-sm font-medium">{label}</div>
                      <div className="text-xs text-muted-foreground">{desc}</div>
                    </div>
                  </div>
                  <Switch
                    checked={notifs[key]}
                    onCheckedChange={(v) => {
                      setNotifs(prev => ({ ...prev, [key]: v }))
                      toast.success(`${label} notifications ${v ? "enabled" : "disabled"}`)
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Danger zone */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Session</h3>
            <div className="rounded-xl bg-card/50 border border-border/10 p-4">
              <button
                onClick={() => { setSettingsOpen(false); setLogoutOpen(true) }}
                className="w-full flex items-center gap-3 text-sm text-destructive hover:bg-destructive/10 px-3 py-2 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign out of VendorIQ
              </button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>

    {/* Logout confirmation */}
    <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
      <AlertDialogContent className="bg-background border-border/20">
        <AlertDialogHeader>
          <AlertDialogTitle>Sign out?</AlertDialogTitle>
          <AlertDialogDescription>
            You'll be signed out of VendorIQ. Any unsaved changes will be lost.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-border/20">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleLogout}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Sign out
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-border/10 bg-sidebar flex flex-col">
        <div className="flex h-16 items-center px-6 border-b border-border/10">
          <div className="flex items-center gap-2 text-primary">
            <Bot className="h-6 w-6" />
            <span className="font-display font-bold text-xl tracking-tight text-white">Vendor<span className="text-primary">IQ</span></span>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto py-6 px-3">
          <div className="space-y-6">
            <div>
              <div className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Overview</div>
              <nav className="space-y-1">
                {mainNav.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <div className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors cursor-pointer",
                      location === item.href 
                        ? "bg-primary/20 text-primary" 
                        : "text-muted-foreground hover:bg-card hover:text-foreground"
                    )}>
                      <item.icon className="h-4 w-4" />
                      {item.title}
                    </div>
                  </Link>
                ))}
              </nav>
            </div>
            
            <div>
              <div className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Intelligence</div>
              <nav className="space-y-1">
                {intelligenceNav.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <div className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors cursor-pointer",
                      location === item.href 
                        ? "bg-primary/20 text-primary" 
                        : "text-muted-foreground hover:bg-card hover:text-foreground"
                    )}>
                      <item.icon className="h-4 w-4" />
                      {item.title}
                    </div>
                  </Link>
                ))}
              </nav>
            </div>

            <div>
              <div className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">ML Ops & Advanced</div>
              <nav className="space-y-1">
                {advancedNav.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <div className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors cursor-pointer",
                      location === item.href 
                        ? "bg-primary/20 text-primary" 
                        : "text-muted-foreground hover:bg-card hover:text-foreground"
                    )}>
                      <item.icon className="h-4 w-4" />
                      {item.title}
                    </div>
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
        
        {/* CPO Profile */}
        <div className="p-3 border-t border-border/10">
          <div className="relative rounded-xl overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

            <div className="relative p-3 space-y-3">
              {/* Avatar + name row */}
              <div className="flex items-center gap-3">
                {/* Avatar with glowing ring */}
                <div className="relative shrink-0">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/80 to-primary/30 flex items-center justify-center font-bold text-base text-white shadow-lg ring-2 ring-primary/40 ring-offset-1 ring-offset-sidebar">
                    {currentUser?.avatarInitials ?? "··"}
                  </div>
                  {/* Online pulse */}
                  {currentUser?.online && (
                    <>
                      <span className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full bg-emerald-400 border-2 border-sidebar z-10" />
                      <span className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full bg-emerald-400 animate-ping opacity-60" />
                    </>
                  )}
                  {!currentUser?.online && (
                    <span className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full bg-muted-foreground border-2 border-sidebar" />
                  )}
                </div>

                {/* Name + title */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-foreground truncate leading-tight">
                    {currentUser?.name ?? "Loading…"}
                  </div>
                  <div className="mt-0.5 inline-flex items-center gap-1 bg-primary/20 border border-primary/30 rounded-full px-2 py-0.5">
                    <div className="h-1 w-1 rounded-full bg-primary" />
                    <span className="text-[9px] font-bold tracking-widest text-primary uppercase truncate">
                      {currentUser?.role?.split(" ").map(w => w[0]).join("") ?? "CPO"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Role + company */}
              <div className="space-y-0.5 pl-0.5">
                <div className="text-xs font-medium text-foreground/80 truncate">
                  {currentUser?.role ?? ""}
                </div>
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground/70 truncate">
                  <svg className="h-2.5 w-2.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                  <span className="truncate">{currentUser?.company ?? ""}</span>
                </div>
              </div>

              {/* Status + actions */}
              <div className="flex items-center justify-between pt-1 border-t border-border/10">
                <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[10px] font-medium text-emerald-400">
                    {currentUser?.online ? "Active now" : "Offline"}
                  </span>
                </div>
                <div className="flex items-center gap-0.5">
                  <button onClick={() => setSettingsOpen(true)} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors" title="Settings">
                    <Settings className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => setLogoutOpen(true)} className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" title="Sign out">
                    <LogOut className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 pl-64 flex flex-col min-h-screen">
        <header className="h-16 border-b border-border/10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 flex items-center justify-between px-8">
          <div className="flex items-center gap-4 flex-1">
            <GlobalSearch />
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/alerts">
              <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-card">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive border border-background"></span>
              </button>
            </Link>
            <button onClick={() => setSettingsOpen(true)} className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-card">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </header>
        
        <div className="flex-1 p-8 overflow-auto">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </div>
      </main>
    </div>
    </>
  )
}
