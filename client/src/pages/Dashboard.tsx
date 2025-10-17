import { ActivityRing } from "@/components/ActivityRing";
import { BGReadingCard } from "@/components/BGReadingCard";
import { PrescriptionCard } from "@/components/PrescriptionCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Dashboard() {
  const { t } = useLanguage();

  // Todo: remove mock data
  const mockBGReadings = [
    { id: "1", value: 98, status: "in-range" as const, timestamp: "Today, 8:30 AM", mealContext: "Before breakfast" },
    { id: "2", value: 145, status: "high" as const, timestamp: "Today, 12:45 PM", mealContext: "After lunch" },
    { id: "3", value: 112, status: "in-range" as const, timestamp: "Today, 6:15 PM" },
  ];

  const mockPrescriptions = [
    { id: "1", drug: "Metformin", dose: "500mg", scheduleTime: "8:00 AM" },
    { id: "2", drug: "Glipizide", dose: "5mg", scheduleTime: "6:00 PM", isTaken: true },
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
          value={1650} 
          target={2000} 
          color="hsl(var(--chart-1))" 
        />
        <ActivityRing 
          label={t("bgTimeInRange")} 
          value={75} 
          target={100} 
          color="hsl(var(--chart-2))" 
        />
        <ActivityRing 
          label={t("macros")} 
          value={85} 
          target={100} 
          color="hsl(var(--chart-4))" 
        />
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
            {mockBGReadings.map((reading) => (
              <BGReadingCard key={reading.id} {...reading} />
            ))}
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
            {mockPrescriptions.map((prescription) => (
              <PrescriptionCard key={prescription.id} {...prescription} />
            ))}
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
            <div className="text-2xl font-bold font-mono mt-1">118 mg/dL</div>
            <div className="text-xs text-success mt-1">↓ 5% from last week</div>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="text-sm text-muted-foreground">Time in Range</div>
            <div className="text-2xl font-bold font-mono mt-1">78%</div>
            <div className="text-xs text-success mt-1">↑ 8% from last week</div>
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
