import { BGReadingCard } from "../BGReadingCard";

export default function BGReadingCardExample() {
  return (
    <div className="p-8 space-y-4 max-w-md">
      <BGReadingCard
        id="1"
        value={98}
        status="in-range"
        timestamp="Today, 8:30 AM"
        mealContext="Before breakfast"
      />
      <BGReadingCard
        id="2"
        value={185}
        status="high"
        timestamp="Today, 2:15 PM"
        mealContext="After lunch"
      />
      <BGReadingCard
        id="3"
        value={265}
        status="urgent"
        timestamp="Today, 7:45 PM"
      />
    </div>
  );
}
