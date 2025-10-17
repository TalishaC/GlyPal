interface Ring {
  label: string;
  value: number;
  target: number;
  color: string;
}

interface ConcentricRingsProps {
  rings: Ring[];
  size?: number;
}

export function ConcentricRings({ rings, size = 160 }: ConcentricRingsProps) {
  const strokeWidth = 12;
  const gap = 4;
  
  return (
    <div className="flex flex-col items-center gap-2" data-testid="ring-macros">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          {rings.map((ring, index) => {
            const radius = (size / 2) - strokeWidth / 2 - index * (strokeWidth + gap);
            const circumference = 2 * Math.PI * radius;
            const percentage = Math.min((ring.value / ring.target) * 100, 100);
            const strokeDashoffset = circumference - (percentage / 100) * circumference;
            
            return (
              <g key={ring.label}>
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth={strokeWidth}
                />
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={ring.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              </g>
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-sm font-medium text-center">Macros</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs w-full max-w-[200px]">
        {rings.map((ring) => (
          <div key={ring.label} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0" 
              style={{ backgroundColor: ring.color }}
            />
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{ring.label}</div>
              <div className="text-muted-foreground font-mono">
                {ring.value}/{ring.target}g
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
