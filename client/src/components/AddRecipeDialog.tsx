import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ExternalLink, CheckCircle2 } from "lucide-react";
import { scrapeRecipeFromUrl } from "@/lib/recipes";
import { useAuth } from "@/contexts/AuthContext";

interface AddRecipeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddRecipeDialog({ open, onOpenChange, onSuccess }: AddRecipeDialogProps) {
  const { user } = useAuth();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      setError("Please enter a recipe URL");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess(false);

      await scrapeRecipeFromUrl(url.trim(), user?.id);

      setSuccess(true);
      setUrl("");

      // Call success callback after a short delay
      setTimeout(() => {
        onSuccess?.();
        onOpenChange(false);
        setSuccess(false);
      }, 1500);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import recipe");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setUrl("");
      setError("");
      setSuccess(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import Recipe from URL</DialogTitle>
          <DialogDescription>
            Paste a recipe URL from any popular recipe website. We'll automatically extract the recipe details and save it to your collection.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="recipe-url">Recipe URL</Label>
              <Input
                id="recipe-url"
                type="url"
                placeholder="https://www.allrecipes.com/recipe/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={loading || success}
                data-testid="input-recipe-url"
              />
              <p className="text-xs text-muted-foreground">
                Supports: AllRecipes, Food Network, NYT Cooking, and most recipe blogs
              </p>
            </div>

            {error && (
              <Alert variant="destructive" data-testid="alert-error">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-500 bg-green-50 dark:bg-green-950" data-testid="alert-success">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-green-600 dark:text-green-400">
                  Recipe imported successfully! This recipe is private to your account.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex items-start gap-2 p-3 bg-muted rounded-md">
              <ExternalLink className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
              <div className="text-xs text-muted-foreground">
                <strong>Privacy Note:</strong> This recipe will be saved privately to your account. Only you can see and edit it.
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || success || !url.trim()}
              data-testid="button-import-recipe"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Importing..." : "Import Recipe"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
