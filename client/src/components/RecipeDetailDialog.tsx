import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, CheckCircle2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RecipeDetailDialogProps {
  recipe: {
    id: string;
    title: string;
    image: string;
    time: number;
    servings: number;
    carbs: number | string;
    protein: number | string;
    fiber: number | string;
    satFat?: number | string;
    isT2DOptimized?: boolean;
    difficulty?: string;
    ingredients?: string[];
    instructions?: string[];
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RecipeDetailDialog({ recipe, open, onOpenChange }: RecipeDetailDialogProps) {
  if (!recipe) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">{recipe.title}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {/* Image */}
            <div className="relative aspect-video rounded-lg overflow-hidden">
              <img
                src={recipe.image}
                alt={recipe.title}
                className="object-cover w-full h-full"
              />
            </div>

            {/* Meta info */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{recipe.time} min</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{recipe.servings} servings</span>
              </div>
              {recipe.difficulty && (
                <Badge variant="secondary">{recipe.difficulty}</Badge>
              )}
              {recipe.isT2DOptimized && (
                <Badge className="bg-green-500">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  T2D Optimized
                </Badge>
              )}
            </div>

            {/* Nutrition */}
            <div>
              <h3 className="font-semibold mb-3">Nutrition (per serving)</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">Carbs</p>
                  <p className="text-lg font-semibold">{recipe.carbs}g</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">Protein</p>
                  <p className="text-lg font-semibold">{recipe.protein}g</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">Fiber</p>
                  <p className="text-lg font-semibold">{recipe.fiber}g</p>
                </div>
                {recipe.satFat && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">Sat Fat</p>
                    <p className="text-lg font-semibold">{recipe.satFat}g</p>
                  </div>
                )}
              </div>
            </div>

            {/* Ingredients */}
            {recipe.ingredients && recipe.ingredients.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Ingredients</h3>
                <ul className="space-y-2">
                  {recipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary mt-1.5">•</span>
                      <span className="flex-1">{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Instructions */}
            {recipe.instructions && recipe.instructions.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Instructions</h3>
                <ol className="space-y-3">
                  {recipe.instructions.map((instruction, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </span>
                      <span className="flex-1 pt-0.5">{instruction}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
