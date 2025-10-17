import { Pill, Clock, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface PrescriptionCardProps {
  id: string;
  drug: string;
  dose: string;
  scheduleTime: string;
  isTaken?: boolean;
  onMarkTaken?: () => void;
}

export function PrescriptionCard({
  id,
  drug,
  dose,
  scheduleTime,
  isTaken: initialTaken = false,
  onMarkTaken,
}: PrescriptionCardProps) {
  const [isTaken, setIsTaken] = useState(initialTaken);

  const handleMarkTaken = () => {
    setIsTaken(true);
    onMarkTaken?.();
    console.log(`Marked ${drug} as taken`);
  };

  return (
    <Card 
      className={`hover-elevate ${isTaken ? "opacity-60" : ""}`}
      data-testid={`card-prescription-${id}`}
    >
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Pill className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold" data-testid={`text-prescription-drug-${id}`}>{drug}</h4>
            <p className="text-sm text-muted-foreground">{dose}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <Clock className="h-3 w-3" />
              <span>{scheduleTime}</span>
            </div>
          </div>
        </div>
        <Button
          variant={isTaken ? "secondary" : "default"}
          size="sm"
          onClick={handleMarkTaken}
          disabled={isTaken}
          data-testid={`button-mark-taken-${id}`}
        >
          {isTaken ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Taken
            </>
          ) : (
            "Mark Taken"
          )}
        </Button>
      </div>
    </Card>
  );
}
