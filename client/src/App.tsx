import React from "react";
import { Switch, Route, Redirect } from "wouter";
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
              <Switch>
                <Route path="/" component={Dashboard} />
                <Route path="/planner" component={MealPlanner} />
                <Route path="/recipes" component={Recipes} />
                <Route path="/log-bg" component={LogBG} />
                <Route path="/prescriptions" component={Prescriptions} />
                <Route path="/shopping" component={Shopping} />
                <Route component={NotFound} />
              </Switch>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function Router() {
  const { user, isLoading } = useAuth();
  
  console.log("Router rendering", { user, isLoading });

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
    console.log("Router: No user, showing auth flow");
    const authRoutes = (
      <Switch>
        <Route path="/welcome">
          {() => {
            console.log("Route /welcome matched!");
            return <Welcome />;
          }}
        </Route>
        <Route path="/login">
          {() => {
            console.log("Route /login matched!");
            return <Login />;
          }}
        </Route>
        <Route path="/signup">
          {() => {
            console.log("Route /signup matched!");
            return <Signup />;
          }}
        </Route>
        <Route path="/:rest*">
          {() => {
            console.log("Router: Catch-all route matched, redirecting to /welcome");
            return <Redirect to="/welcome" />;
          }}
        </Route>
      </Switch>
    );
    console.log("Router: Returning auth routes", authRoutes);
    return authRoutes;
  }

  // Logged in but onboarding incomplete
  if (!user.onboardingCompleted) {
    return (
      <Switch>
        <Route path="/onboarding" component={Onboarding} />
        <Route path="/:rest*">
          {() => <Redirect to="/onboarding" />}
        </Route>
      </Switch>
    );
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
