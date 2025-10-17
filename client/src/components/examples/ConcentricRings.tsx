import { ConcentricRings } from "../ConcentricRings";

export default function ConcentricRingsExample() {
  const macroRings = [
    { label: "Carbs", value: 180, target: 225, color: "hsl(0 70% 50%)" }, // Red
    { label: "Protein", value: 95, target: 120, color: "hsl(25 85% 55%)" }, // Orange
    { label: "Fat", value: 52, target: 65, color: "hsl(45 90% 55%)" }, // Yellow
    { label: "Fiber", value: 28, target: 35, color: "hsl(145 60% 45%)" }, // Green
  ];

  return (
    <div className="p-8">
      <ConcentricRings rings={macroRings} />
    </div>
  );
}
