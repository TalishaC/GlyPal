import { AlertCircle, CheckCircle, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";

type BGStatus = "in-range" | "high" | "low" | "urgent";

interface BGReadingCardProps {
  id: string;
  value: number;
  status: BGStatus;
  timestamp: string;
  mealContext?: string;
}

const statusConfig = {
  "in-range": {
    color: "success",
    borderColor: "border-l-success",
    icon: CheckCircle,
    label: "In Range",
  },
  high: {
    color: "warning",
    borderColor: "border-l-warning",
    icon: TrendingUp,
    label: "High",
  },
  low: {
    color: "info",
    borderColor: "border-l-info",
    icon: AlertCircle,
    label: "Low",
  },
  urgent: {
    color: "destructive",
    borderColor: "border-l-destructive",
    icon: AlertCircle,
    label: "Urgent",
  },
};

export function BGReadingCard({
  id,
  value,
  status,
  timestamp,
  mealContext,
}: BGReadingCardProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Card 
      className={`border-l-4 ${config.borderColor} hover-elevate`}
      data-testid={`card-bg-reading-${id}`}
    >
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon className={`h-5 w-5 text-${config.color}`} />
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-mono font-semibold" data-testid={`text-bg-value-${id}`}>
                {value}
              </span>
              <span className="text-sm text-muted-foreground">mg/dL</span>
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {timestamp}
              {mealContext && ` • ${mealContext}`}
            </div>
          </div>
        </div>
        <Badge variant="outline" className={`text-${config.color} border-${config.color}`}>
          {config.label}
        </Badge>
      </div>
    </Card>
  );
}

function Badge({ 
  children, 
  variant, 
  className 
}: { 
  children: React.ReactNode; 
  variant: string; 
  className?: string;
}) {
  return (
    <span className={`px-2 py-1 rounded-md text-xs font-medium ${className}`}>
      {children}
    </span>
  );
}
