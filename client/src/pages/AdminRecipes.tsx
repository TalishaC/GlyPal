import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Loader2, CheckCircle2, ExternalLink, Shield, Users, Lock, Pencil, Trash2 } from "lucide-react";
import { scrapeRecipeFromUrl } from "@/lib/recipes";

interface Recipe {
  id: string;
  userId?: string | null;
  title: string;
  image: string;
  time: number;
  servings: number;
  carbs: string;
  protein: string;
  fiber: string;
  satFat: string;
  isT2DOptimized: boolean;
  difficulty: string;
}

export default function AdminRecipes() {
  const { user } = useAuth();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);

  // Redirect if not admin
  if (!user?.isAdmin) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Admin Access Required
            </CardTitle>
            <CardDescription>
              You don't have permission to access this page. Please contact an administrator.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const { data: allRecipes = [], isLoading: recipesLoading, refetch } = useQuery<Recipe[]>({
    queryKey: ['/api/recipes'],
    queryFn: async () => {
      const res = await fetch('/api/recipes');
      if (!res.ok) throw new Error("Failed to fetch recipes");
      return res.json();
    },
  });

  const publicRecipes = allRecipes.filter(r => !r.userId);
  const privateRecipes = allRecipes.filter(r => r.userId);

  const handleImportPublic = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      setError("Please enter a recipe URL");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess(false);

      // Import as public recipe (no userId)
      await scrapeRecipeFromUrl(url.trim(), undefined);

      setSuccess(true);
      setUrl("");

      setTimeout(() => {
        refetch();
        setShowAddDialog(false);
        setSuccess(false);
      }, 1500);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import recipe");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (recipeId: string) => {
    if (!confirm("Are you sure you want to delete this recipe?")) return;

    try {
      const res = await fetch(`/api/recipes/${recipeId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error("Failed to delete recipe");

      refetch();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete recipe");
    }
  };

  const RecipeTable = ({ recipes, type }: { recipes: Recipe[], type: 'public' | 'private' }) => (
    <div className="rounded-md border">
      <table className="w-full">
        <thead className="bg-muted">
          <tr className="text-left text-sm">
            <th className="p-3 font-medium">Recipe</th>
            <th className="p-3 font-medium">Time</th>
            <th className="p-3 font-medium">Servings</th>
            <th className="p-3 font-medium">Nutrition</th>
            <th className="p-3 font-medium">T2D</th>
            {type === 'private' && <th className="p-3 font-medium">Owner</th>}
            <th className="p-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {recipes.length === 0 ? (
            <tr>
              <td colSpan={type === 'private' ? 7 : 6} className="p-8 text-center text-muted-foreground">
                No {type} recipes found
              </td>
            </tr>
          ) : (
            recipes.map((recipe) => (
              <tr key={recipe.id} className="border-t hover:bg-muted/50">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={recipe.image}
                      alt={recipe.title}
                      className="w-12 h-12 rounded object-cover"
                    />
                    <div>
                      <p className="font-medium text-sm">{recipe.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">{recipe.difficulty}</p>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-sm">{recipe.time} min</td>
                <td className="p-3 text-sm">{recipe.servings}</td>
                <td className="p-3 text-xs">
                  <div className="space-y-1">
                    <div>C: {recipe.carbs}g</div>
                    <div>P: {recipe.protein}g</div>
                    <div>F: {recipe.fiber}g</div>
                  </div>
                </td>
                <td className="p-3">
                  {recipe.isT2DOptimized ? (
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Yes
                    </Badge>
                  ) : (
                    <Badge variant="secondary">No</Badge>
                  )}
                </td>
                {type === 'private' && (
                  <td className="p-3 text-xs text-muted-foreground">
                    User: {recipe.userId?.substring(0, 8)}...
                  </td>
                )}
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingRecipe(recipe)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(recipe.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Recipe Management
          </h1>
          <p className="text-muted-foreground">Manage public and private recipes</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Public Recipe
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Public Recipes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{publicRecipes.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Available to all users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Private Recipes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{privateRecipes.length}</p>
            <p className="text-xs text-muted-foreground mt-1">User-specific recipes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              T2D Optimized
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {allRecipes.filter(r => r.isT2DOptimized).length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round((allRecipes.filter(r => r.isT2DOptimized).length / Math.max(allRecipes.length, 1)) * 100)}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="public" className="space-y-4">
        <TabsList>
          <TabsTrigger value="public">
            <Users className="h-4 w-4 mr-2" />
            Public Recipes ({publicRecipes.length})
          </TabsTrigger>
          <TabsTrigger value="private">
            <Lock className="h-4 w-4 mr-2" />
            Private Recipes ({privateRecipes.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="public">
          {recipesLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <RecipeTable recipes={publicRecipes} type="public" />
          )}
        </TabsContent>

        <TabsContent value="private">
          {recipesLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <RecipeTable recipes={privateRecipes} type="private" />
          )}
        </TabsContent>
      </Tabs>

      {/* Add Public Recipe Dialog */}
      <Dialog open={showAddDialog} onOpenChange={(open) => {
        if (!loading) {
          setShowAddDialog(open);
          if (!open) {
            setUrl("");
            setError("");
            setSuccess(false);
          }
        }
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Public Recipe</DialogTitle>
            <DialogDescription>
              Import a recipe from a URL. This recipe will be available to all users.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleImportPublic}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="admin-recipe-url">Recipe URL</Label>
                <Input
                  id="admin-recipe-url"
                  type="url"
                  placeholder="https://www.allrecipes.com/recipe/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={loading || success}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertDescription className="text-green-600 dark:text-green-400">
                    Public recipe imported successfully!
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex items-start gap-2 p-3 bg-muted rounded-md">
                <Users className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-muted-foreground">
                  <strong>Public Recipe:</strong> This recipe will be visible to all users in the app.
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddDialog(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || success || !url.trim()}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Importing..." : "Import Public Recipe"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
