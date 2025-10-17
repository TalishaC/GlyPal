import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, DollarSign } from "lucide-react";
import { useState } from "react";

interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  category: string;
  checked: boolean;
}

export default function Shopping() {
  // Todo: remove mock data
  const [items, setItems] = useState<ShoppingItem[]>([
    { id: "1", name: "Chicken breast", quantity: "2 lbs", category: "Proteins", checked: false },
    { id: "2", name: "Quinoa", quantity: "1 cup", category: "Grains", checked: false },
    { id: "3", name: "Avocado", quantity: "2", category: "Produce", checked: true },
    { id: "4", name: "Cherry tomatoes", quantity: "1 pint", category: "Produce", checked: false },
    { id: "5", name: "Salmon fillet", quantity: "1 lb", category: "Proteins", checked: false },
    { id: "6", name: "Broccoli", quantity: "1 head", category: "Produce", checked: false },
    { id: "7", name: "Bell peppers", quantity: "3", category: "Produce", checked: false },
    { id: "8", name: "Brown rice", quantity: "2 cups", category: "Grains", checked: false },
    { id: "9", name: "Chickpeas", quantity: "1 can", category: "Legumes", checked: true },
  ]);

  const toggleItem = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const categories = Array.from(new Set(items.map(item => item.category)));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Shopping List</h1>
          <p className="text-muted-foreground">Weekly grocery list from your meal plan</p>
        </div>
        <Button data-testid="button-chicory-cart">
          <ShoppingCart className="h-4 w-4 mr-2" />
          Build Cart
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total Items</div>
              <div className="text-xl font-bold font-mono">{items.length}</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-success" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Checked Off</div>
              <div className="text-xl font-bold font-mono">
                {items.filter(i => i.checked).length}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-chart-4/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-chart-4" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Est. Weekly Cost</div>
              <div className="text-xl font-bold font-mono">$45</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex gap-2">
        <Badge variant="outline">Budget Mode: $2.50/meal</Badge>
      </div>

      {categories.map((category) => (
        <Card key={category} className="p-6">
          <h2 className="text-lg font-semibold mb-4">{category}</h2>
          <div className="space-y-3">
            {items
              .filter((item) => item.category === category)
              .map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover-elevate"
                  data-testid={`item-shopping-${item.id}`}
                >
                  <Checkbox
                    checked={item.checked}
                    onCheckedChange={() => toggleItem(item.id)}
                    data-testid={`checkbox-item-${item.id}`}
                  />
                  <div className={`flex-1 ${item.checked ? "line-through opacity-60" : ""}`}>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">{item.quantity}</div>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
