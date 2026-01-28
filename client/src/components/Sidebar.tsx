import { Link, useLocation } from "wouter";
import { LayoutDashboard, Briefcase, FileText, Settings, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Jobs", href: "/jobs", icon: Briefcase },
  { name: "New Analysis", href: "/analyze", icon: FileText },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="flex flex-col w-64 bg-card border-r border-border h-screen fixed left-0 top-0 z-30">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <FileText className="w-5 h-5 text-primary-foreground" />
        </div>
        <h1 className="text-xl font-bold tracking-tight">TalentScan AI</h1>
      </div>

      <div className="flex-1 px-4 space-y-2 mt-4">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer group",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                {item.name}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted cursor-pointer transition-colors">
          <UserCircle className="w-8 h-8 text-muted-foreground" />
          <div className="flex flex-col">
            <span className="text-sm font-medium">Hiring Manager</span>
            <span className="text-xs text-muted-foreground">Admin Access</span>
          </div>
        </div>
      </div>
    </div>
  );
}
