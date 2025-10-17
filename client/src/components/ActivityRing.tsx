interface ActivityRingProps {
  label: string;
  value: number;
  target: number;
  color: string;
  size?: number;
}

export function ActivityRing({ 
  label, 
  value, 
  target, 
  color,
  size = 160 
}: ActivityRingProps) {
  const percentage = Math.min((value / target) * 100, 100);
  const circumference = 2 * Math.PI * (size / 2 - 8);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2" data-testid={`ring-${label.toLowerCase()}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 8}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="16"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 8}
            fill="none"
            stroke={color}
            strokeWidth="16"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-2xl font-semibold font-mono" data-testid={`text-${label.toLowerCase()}-value`}>
            {Math.round(percentage)}%
          </div>
          <div className="text-sm text-muted-foreground">
            {value}/{target}
          </div>
        </div>
      </div>
      <div className="text-sm font-medium text-center" data-testid={`text-${label.toLowerCase()}-label`}>{label}</div>
    </div>
  );
}
