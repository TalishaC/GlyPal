import { PrescriptionCard } from "../PrescriptionCard";

export default function PrescriptionCardExample() {
  return (
    <div className="p-8 space-y-4 max-w-md">
      <PrescriptionCard
        id="1"
        drug="Metformin"
        dose="500mg"
        scheduleTime="8:00 AM"
        onMarkTaken={() => console.log("Marked as taken")}
      />
      <PrescriptionCard
        id="2"
        drug="Glipizide"
        dose="5mg"
        scheduleTime="6:00 PM"
        isTaken={true}
      />
    </div>
  );
}
