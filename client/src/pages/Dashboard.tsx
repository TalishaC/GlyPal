import { ActivityRing } from "@/components/ActivityRing";
import { ConcentricRings } from "@/components/ConcentricRings";
import { BGReadingCard } from "@/components/BGReadingCard";
import { PrescriptionCard } from "@/components/PrescriptionCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import type { BGReading, Prescription } from "@shared/schema";

export default function Dashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();

  // Fetch user profile with settings
  const { data: userProfile } = useQuery({
    queryKey: ["/api/me", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const res = await fetch(`/api/me?userId=${user.id}`);
      if (!res.ok) throw new Error("Failed to fetch user profile");
      return res.json();
    },
    enabled: !!user?.id,
  });

  // Fetch BG readings
  const { data: bgReadings = [], isLoading: loadingBGReadings } = useQuery<BGReading[]>({
    queryKey: ["/api/bg-readings", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await fetch(`/api/bg-readings?userId=${user.id}&limit=3`);
      if (!res.ok) throw new Error("Failed to fetch BG readings");
      return res.json();
    },
    enabled: !!user?.id,
  });

  // Fetch BG stats
  const { data: bgStats } = useQuery({
    queryKey: ["/api/bg-readings/stats", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const res = await fetch(`/api/bg-readings/stats?userId=${user.id}&days=7`);
      if (!res.ok) throw new Error("Failed to fetch BG stats");
      return res.json();
    },
    enabled: !!user?.id,
  });

  // Fetch prescriptions
  const { data: prescriptions = [], isLoading: loadingPrescriptions } = useQuery<Prescription[]>({
    queryKey: ["/api/prescriptions", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await fetch(`/api/prescriptions?userId=${user.id}`);
      if (!res.ok) throw new Error("Failed to fetch prescriptions");
      return res.json();
    },
    enabled: !!user?.id,
  });

  // Extract settings for thresholds and targets
  const bgLow = userProfile?.settings?.bgLow || 70;
  const bgHigh = userProfile?.settings?.bgHigh || 180;
  const bgUrgent = userProfile?.settings?.bgUrgent || 250;
  const calorieTarget = userProfile?.settings?.calorieTargetKcal || 2000;
  const macroSplit = userProfile?.settings?.macroSplitJson || { carb_pct: 0.35, protein_pct: 0.30, fat_pct: 0.35 };

  // Helper to determine BG status using user's thresholds
  const getBGStatus = (value: number): "in-range" | "high" | "low" | "urgent" => {
    if (value >= bgUrgent) return "urgent";
    if (value > bgHigh) return "high";
    if (value < bgLow) return "low";
    return "in-range";
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const timeStr = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    return isToday ? `Today, ${timeStr}` : `${date.toLocaleDateString()}, ${timeStr}`;
  };

  // Calculate macro targets based on calorie target and macro split
  const carbsTarget = Math.round((calorieTarget * macroSplit.carb_pct) / 4); // 4 cal/g
  const proteinTarget = Math.round((calorieTarget * macroSplit.protein_pct) / 4); // 4 cal/g
  const fatTarget = Math.round((calorieTarget * macroSplit.fat_pct) / 9); // 9 cal/g
  const fiberTarget = 35; // Standard fiber goal

  const macroRings = [
    { label: "Carbs", value: 0, target: carbsTarget, color: "hsl(0 70% 50%)" }, // Red
    { label: "Protein", value: 0, target: proteinTarget, color: "hsl(25 85% 55%)" }, // Orange
    { label: "Fat", value: 0, target: fatTarget, color: "hsl(45 90% 55%)" }, // Yellow
    { label: "Fiber", value: 0, target: fiberTarget, color: "hsl(145 60% 45%)" }, // Green
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Track your daily health metrics and progress</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ActivityRing 
          label={t("calories")} 
          value={0} 
          target={calorieTarget} 
          color="hsl(var(--chart-1))" 
        />
        <ActivityRing 
          label={t("bgTimeInRange")} 
          value={bgStats?.timeInRange ?? 0} 
          target={100} 
          color="hsl(var(--chart-2))" 
        />
        <ConcentricRings rings={macroRings} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">BG Readings</h2>
              <p className="text-sm text-muted-foreground">Recent blood glucose logs</p>
            </div>
            <Button size="sm" data-testid="button-add-bg-reading">
              <Plus className="h-4 w-4 mr-2" />
              {t("logReading")}
            </Button>
          </div>
          <div className="space-y-3">
            {loadingBGReadings ? (
              <div className="text-center text-muted-foreground py-4">Loading...</div>
            ) : bgReadings.length === 0 ? (
              <div className="text-center text-muted-foreground py-4">No BG readings yet</div>
            ) : (
              bgReadings.map((reading: BGReading) => (
                <BGReadingCard 
                  key={reading.id} 
                  id={reading.id}
                  value={reading.value}
                  status={getBGStatus(reading.value)}
                  timestamp={formatTimestamp(reading.timestamp.toString())}
                  mealContext={reading.mealContext || undefined}
                />
              ))
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">{t("prescriptions")}</h2>
              <p className="text-sm text-muted-foreground">Today's medications</p>
            </div>
          </div>
          <div className="space-y-3">
            {loadingPrescriptions ? (
              <div className="text-center text-muted-foreground py-4">Loading...</div>
            ) : prescriptions.length === 0 ? (
              <div className="text-center text-muted-foreground py-4">No prescriptions</div>
            ) : (
              prescriptions.map((prescription: Prescription) => (
                <PrescriptionCard 
                  key={prescription.id} 
                  id={prescription.id}
                  drug={prescription.drug}
                  dose={prescription.dose}
                  scheduleTime={prescription.scheduleTime}
                />
              ))
            )}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">Weekly Summary</h2>
            <p className="text-sm text-muted-foreground">Your progress this week</p>
          </div>
          <Button variant="outline" size="sm">
            <TrendingUp className="h-4 w-4 mr-2" />
            View Report
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="text-sm text-muted-foreground">Avg BG</div>
            <div className="text-2xl font-bold font-mono mt-1">
              {bgStats?.average || 0} mg/dL
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {bgStats?.totalReadings || 0} readings this week
            </div>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="text-sm text-muted-foreground">Time in Range</div>
            <div className="text-2xl font-bold font-mono mt-1">
              {bgStats?.timeInRange || 0}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">7-day average</div>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="text-sm text-muted-foreground">Meal Adherence</div>
            <div className="text-2xl font-bold font-mono mt-1">92%</div>
            <div className="text-xs text-muted-foreground mt-1">6 of 7 days</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
