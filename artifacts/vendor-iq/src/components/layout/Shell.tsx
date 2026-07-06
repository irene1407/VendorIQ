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
  Settings
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useGetCurrentUser } from "@workspace/api-client-react"

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

export function Shell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation()
  const { data: currentUser } = useGetCurrentUser()

  return (
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
        
        <div className="p-4 border-t border-border/10">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="relative shrink-0">
              <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium text-sm">
                {currentUser?.avatarInitials ?? "··"}
              </div>
              <span
                className={cn(
                  "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-sidebar",
                  currentUser?.online ? "bg-emerald-400" : "bg-muted-foreground"
                )}
                title={currentUser?.online ? "Online" : "Offline"}
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium truncate">
                {currentUser?.name ?? "Loading…"}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                {currentUser?.role ?? ""}
              </span>
              <span className="text-[11px] text-muted-foreground/70 truncate">
                {currentUser?.company ?? ""}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 pl-64 flex flex-col min-h-screen">
        <header className="h-16 border-b border-border/10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 flex items-center justify-between px-8">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-96 hidden md:flex items-center">
              <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search suppliers, contracts, alerts (Ctrl+K)..."
                className="h-9 w-full rounded-md border border-border/20 bg-card/50 pl-9 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground"
              />
              <kbd className="pointer-events-none absolute right-2 top-2 hidden h-5 select-none items-center gap-1 rounded border border-border/20 bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex text-muted-foreground">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/alerts">
              <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-card">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive border border-background"></span>
              </button>
            </Link>
            <button className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-card">
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
  )
}
