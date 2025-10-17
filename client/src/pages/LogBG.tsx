import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mic, TrendingUp, TrendingDown } from "lucide-react";
import { BGReadingCard } from "@/components/BGReadingCard";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function LogBG() {
  const { t } = useLanguage();
  const [bgValue, setBgValue] = useState("");
  const [mealContext, setMealContext] = useState("");

  // Todo: remove mock data
  const mockRecentReadings = [
    { id: "1", value: 98, status: "in-range" as const, timestamp: "Today, 8:30 AM", mealContext: "Before breakfast" },
    { id: "2", value: 145, status: "high" as const, timestamp: "Today, 12:45 PM", mealContext: "After lunch" },
    { id: "3", value: 112, status: "in-range" as const, timestamp: "Yesterday, 7:15 PM" },
    { id: "4", value: 185, status: "high" as const, timestamp: "Yesterday, 2:30 PM" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Log BG:", { bgValue, mealContext });
    setBgValue("");
    setMealContext("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Log BG Reading</h1>
        <p className="text-muted-foreground">
          BG entries are user-reported. Recommendations are educational and not medical guidance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">New Reading</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bg-value">Blood Glucose (mg/dL)</Label>
              <div className="flex gap-2">
                <Input
                  id="bg-value"
                  type="number"
                  placeholder="Enter value..."
                  value={bgValue}
                  onChange={(e) => setBgValue(e.target.value)}
                  className="font-mono text-lg"
                  data-testid="input-bg-value"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon"
                  data-testid="button-voice-input"
                >
                  <Mic className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="meal-context">Meal Context</Label>
              <Select value={mealContext} onValueChange={setMealContext}>
                <SelectTrigger id="meal-context" data-testid="select-meal-context">
                  <SelectValue placeholder="Select timing..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="before-breakfast">Before Breakfast</SelectItem>
                  <SelectItem value="after-breakfast">After Breakfast</SelectItem>
                  <SelectItem value="before-lunch">Before Lunch</SelectItem>
                  <SelectItem value="after-lunch">After Lunch</SelectItem>
                  <SelectItem value="before-dinner">Before Dinner</SelectItem>
                  <SelectItem value="after-dinner">After Dinner</SelectItem>
                  <SelectItem value="bedtime">Bedtime</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" data-testid="button-submit-bg">
              {t("logReading")}
            </Button>
          </form>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <Card className="p-3 bg-success/10 border-success/20">
              <div className="text-xs text-muted-foreground mb-1">{t("inRange")}</div>
              <div className="font-mono font-semibold text-success">70-180</div>
            </Card>
            <Card className="p-3 bg-warning/10 border-warning/20">
              <div className="text-xs text-muted-foreground mb-1">{t("high")}</div>
              <div className="font-mono font-semibold text-warning">&gt;180</div>
            </Card>
            <Card className="p-3 bg-destructive/10 border-destructive/20">
              <div className="text-xs text-muted-foreground mb-1">{t("urgent")}</div>
              <div className="font-mono font-semibold text-destructive">&gt;250</div>
            </Card>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Readings</h2>
          <div className="space-y-3">
            {mockRecentReadings.map((reading) => (
              <BGReadingCard key={reading.id} {...reading} />
            ))}
          </div>

          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">7-Day Average</div>
                <div className="text-2xl font-bold font-mono mt-1">118 mg/dL</div>
              </div>
              <div className="flex items-center gap-2 text-success">
                <TrendingDown className="h-5 w-5" />
                <span className="font-semibold">5% improvement</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
