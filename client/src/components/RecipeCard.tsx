import { Clock, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RecipeCardProps {
  id: string;
  title: string;
  image: string;
  time: number;
  servings: number;
  carbs: number;
  protein: number;
  fiber: number;
  difficulty?: "Easy" | "Medium" | "Hard";
  isT2DOptimized?: boolean;
  onClick?: () => void;
}

export function RecipeCard({
  id,
  title,
  image,
  time,
  servings,
  carbs,
  protein,
  fiber,
  difficulty = "Easy",
  isT2DOptimized = false,
  onClick,
}: RecipeCardProps) {
  return (
    <Card 
      className="overflow-hidden hover-elevate active-elevate-2 cursor-pointer group"
      onClick={onClick}
      data-testid={`card-recipe-${id}`}
    >
      <div className="relative aspect-video overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-2 left-2 right-2 flex gap-2 flex-wrap">
          {isT2DOptimized && (
            <Badge variant="secondary" className="bg-success/90 text-white border-0">
              T2D Optimized
            </Badge>
          )}
          <Badge variant="secondary" className="bg-background/90">
            {difficulty}
          </Badge>
        </div>
      </div>
      <div className="p-4 space-y-3">
        <h3 className="font-semibold text-lg line-clamp-2" data-testid={`text-recipe-title-${id}`}>
          {title}
        </h3>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{time} min</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{servings}</span>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap text-xs">
          <Badge variant="outline" className="font-mono">
            {carbs}g carbs
          </Badge>
          <Badge variant="outline" className="font-mono">
            {protein}g protein
          </Badge>
          <Badge variant="outline" className="font-mono">
            {fiber}g fiber
          </Badge>
        </div>
      </div>
    </Card>
  );
}
