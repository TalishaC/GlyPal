import { ActivityRing } from "../ActivityRing";

export default function ActivityRingExample() {
  return (
    <div className="p-8 flex gap-8 flex-wrap">
      <ActivityRing 
        label="Calories" 
        value={1650} 
        target={2000} 
        color="hsl(var(--chart-1))" 
      />
      <ActivityRing 
        label="BG Time-in-Range" 
        value={75} 
        target={100} 
        color="hsl(var(--chart-2))" 
      />
      <ActivityRing 
        label="Protein" 
        value={85} 
        target={120} 
        color="hsl(var(--chart-4))" 
      />
    </div>
  );
}
