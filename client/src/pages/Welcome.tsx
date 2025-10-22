import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Activity, Heart, Calendar, ShoppingCart } from "lucide-react";

export default function Welcome() {
  console.log("Welcome page rendering!");
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 text-primary">
            <Activity className="w-12 h-12" />
            <h1 className="text-5xl font-bold">GlyPal</h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Your trusted companion for diabetes wellness and meal planning
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-6 space-y-3">
            <Heart className="w-8 h-8 text-primary" />
            <h3 className="text-lg font-semibold">Track Your Health</h3>
            <p className="text-sm text-muted-foreground">
              Log blood glucose readings and monitor your time-in-range with easy-to-understand visualizations
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <Calendar className="w-8 h-8 text-primary" />
            <h3 className="text-lg font-semibold">Plan Your Meals</h3>
            <p className="text-sm text-muted-foreground">
              Discover T2D-optimized recipes and create weekly meal plans that fit your nutrition goals
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <Activity className="w-8 h-8 text-primary" />
            <h3 className="text-lg font-semibold">Stay on Track</h3>
            <p className="text-sm text-muted-foreground">
              Set prescription reminders and track adherence to support your wellness routine
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <ShoppingCart className="w-8 h-8 text-primary" />
            <h3 className="text-lg font-semibold">Shop Smart</h3>
            <p className="text-sm text-muted-foreground">
              Generate shopping lists from your meal plans with budget-aware ingredient selection
            </p>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signup">
            <Button size="lg" className="w-full sm:w-auto" data-testid="button-signup">
              Get Started
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="w-full sm:w-auto" data-testid="button-login">
              Sign In
            </Button>
          </Link>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          This app provides educational information only and is not a substitute for professional medical advice.
        </p>
      </div>
    </div>
  );
}
