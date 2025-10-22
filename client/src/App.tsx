import React, { useEffect } from "react";
import { useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import Dashboard from "@/pages/Dashboard";
import MealPlanner from "@/pages/MealPlanner";
import Recipes from "@/pages/Recipes";
import LogBG from "@/pages/LogBG";
import Prescriptions from "@/pages/Prescriptions";
import Shopping from "@/pages/Shopping";
import Welcome from "@/pages/Welcome";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Onboarding from "@/pages/Onboarding";
import NotFound from "@/pages/not-found";

function AuthenticatedApp() {
  const [location] = useLocation();
  
  // Manual routing - works in production unlike Switch/Route
  let PageComponent = Dashboard;
  if (location === "/planner") PageComponent = MealPlanner;
  else if (location === "/recipes") PageComponent = Recipes;
  else if (location === "/log-bg") PageComponent = LogBG;
  else if (location === "/prescriptions") PageComponent = Prescriptions;
  else if (location === "/shopping") PageComponent = Shopping;
  else if (location !== "/") PageComponent = NotFound;
  
  return (
    <SidebarProvider style={{ "--sidebar-width": "16rem" } as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center justify-between p-4 border-b bg-background sticky top-0 z-10">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 overflow-auto p-8">
            <div className="max-w-7xl mx-auto">
              <PageComponent />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function Router() {
  const { user, isLoading } = useAuth();
  const [location, setLocation] = useLocation();
  
  console.log("Router rendering", { user, isLoading });

  // Handle redirects in useEffect to avoid state updates during render
  useEffect(() => {
    if (!isLoading && !user && location !== "/welcome" && location !== "/login" && location !== "/signup") {
      setLocation("/welcome");
    } else if (!isLoading && user && !user.onboardingCompleted && location !== "/onboarding") {
      setLocation("/onboarding");
    }
  }, [user, isLoading, location, setLocation]);

  if (isLoading) {
    console.log("Router: Showing loading state");
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Not logged in - show auth flow
  if (!user) {
    // Manual routing - works in production
    if (location === "/login") return <Login />;
    if (location === "/signup") return <Signup />;
    return <Welcome />;
  }

  // Logged in but onboarding incomplete
  if (!user.onboardingCompleted) {
    return <Onboarding />;
  }

  // Logged in and onboarding complete - show main app
  return <AuthenticatedApp />;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md text-center space-y-4">
            <h1 className="text-2xl font-bold text-destructive">Application Error</h1>
            <p className="text-muted-foreground">
              {this.state.error?.message || "Something went wrong"}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <TooltipProvider>
                <Router />
                <Toaster />
              </TooltipProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
