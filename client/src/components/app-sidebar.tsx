import { 
  LayoutDashboard, 
  CalendarDays, 
  BookOpen, 
  Activity, 
  Pill,
  ShoppingCart,
  Settings,
  Home
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation } from "wouter";

const menuItems = [
  {
    title: "dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "planner",
    url: "/planner",
    icon: CalendarDays,
  },
  {
    title: "recipes",
    url: "/recipes",
    icon: BookOpen,
  },
  {
    title: "logBG",
    url: "/log-bg",
    icon: Activity,
  },
  {
    title: "prescriptions",
    url: "/prescriptions",
    icon: Pill,
  },
  {
    title: "shopping",
    url: "/shopping",
    icon: ShoppingCart,
  },
];

export function AppSidebar() {
  const { t } = useLanguage();
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Home className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg">GlyPal</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location === item.url}
                    data-testid={`link-${item.title.toLowerCase()}`}
                  >
                    <a href={item.url}>
                      <item.icon />
                      <span>{t(item.title)}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild data-testid="link-settings">
                  <a href="/settings">
                    <Settings />
                    <span>{t("settings")}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
