import { PrescriptionCard } from "@/components/PrescriptionCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Prescriptions() {
  const { t } = useLanguage();

  // Todo: remove mock data
  const mockPrescriptions = [
    { id: "1", drug: "Metformin", dose: "500mg", scheduleTime: "8:00 AM" },
    { id: "2", drug: "Glipizide", dose: "5mg", scheduleTime: "12:00 PM", isTaken: true },
    { id: "3", drug: "Metformin", dose: "500mg", scheduleTime: "6:00 PM" },
    { id: "4", drug: "Atorvastatin", dose: "20mg", scheduleTime: "9:00 PM", isTaken: true },
  ];

  const mockAdherence = {
    today: 2,
    total: 4,
    thisWeek: 24,
    weekTotal: 28,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t("prescriptions")}</h1>
          <p className="text-muted-foreground">Track your daily medications</p>
        </div>
        <Button data-testid="button-add-prescription">
          <Plus className="h-4 w-4 mr-2" />
          Add Prescription
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Today's Progress</div>
              <div className="text-xl font-bold font-mono">
                {mockAdherence.today}/{mockAdherence.total}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-success" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Weekly Adherence</div>
              <div className="text-xl font-bold font-mono">
                {Math.round((mockAdherence.thisWeek / mockAdherence.weekTotal) * 100)}%
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-chart-4/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-chart-4" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Current Streak</div>
              <div className="text-xl font-bold font-mono">7 days</div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Today's Medications</h2>
        <div className="space-y-3">
          {mockPrescriptions.map((prescription) => (
            <PrescriptionCard 
              key={prescription.id} 
              {...prescription}
              onMarkTaken={() => console.log(`Marked ${prescription.drug} as taken`)}
            />
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Medication Timeline</h2>
        <div className="space-y-3">
          {mockPrescriptions.map((prescription, idx) => (
            <div key={prescription.id} className="flex items-center gap-4">
              <div className="w-20 text-sm text-muted-foreground font-mono">
                {prescription.scheduleTime}
              </div>
              <div className={`h-3 w-3 rounded-full ${prescription.isTaken ? 'bg-success' : 'bg-muted'}`} />
              <div className="flex-1">
                <div className="font-medium">{prescription.drug}</div>
                <div className="text-sm text-muted-foreground">{prescription.dose}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
