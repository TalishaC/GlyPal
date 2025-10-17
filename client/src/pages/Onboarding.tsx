import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Activity, ChevronLeft, ChevronRight } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const COMMON_ALLERGENS = [
  "Dairy", "Eggs", "Fish", "Shellfish", "Tree Nuts", 
  "Peanuts", "Wheat", "Soy", "Sesame"
];

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    dateOfBirth: "",
    gender: "",
    weightKg: "",
    heightCm: "",
    activityLevel: "",
    goal: "",
    allergens: [] as string[],
    carbsPercent: "35",
    proteinPercent: "30",
    fatPercent: "35",
  });

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleAllergen = (allergen: string) => {
    setFormData(prev => ({
      ...prev,
      allergens: prev.allergens.includes(allergen)
        ? prev.allergens.filter(a => a !== allergen)
        : [...prev.allergens, allergen]
    }));
  };

  const handleNext = () => {
    // Validation for each step
    if (step === 1 && (!formData.name || !formData.dateOfBirth)) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill in all fields",
      });
      return;
    }
    if (step === 2 && (!formData.gender || !formData.weightKg || !formData.heightCm)) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill in all fields",
      });
      return;
    }
    if (step === 3 && (!formData.activityLevel || !formData.goal)) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please select an activity level and goal",
      });
      return;
    }

    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!user) return;

    setIsLoading(true);

    try {
      const res = await apiRequest("PATCH", `/api/users/${user.id}`, {
        ...formData,
        onboardingCompleted: true,
      });
      const updatedUser = await res.json();

      setUser(updatedUser);

      toast({
        title: "Welcome to GlyPal!",
        description: "Your profile is all set up",
      });

      setLocation("/");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to save profile",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="flex items-center gap-2 text-primary justify-center">
          <Activity className="w-8 h-8" />
          <h1 className="text-2xl font-bold">GlyPal</h1>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  {step === 1 && "Tell us about yourself"}
                  {step === 2 && "Health Profile"}
                  {step === 3 && "Activity & Goals"}
                  {step === 4 && "Allergens & Dietary Restrictions"}
                  {step === 5 && "Nutrition Preferences"}
                </CardTitle>
                <CardDescription>Step {step} of 5</CardDescription>
              </div>
              <div className="text-sm text-muted-foreground">
                {Math.round((step / 5) * 100)}%
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="John Doe"
                    data-testid="input-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => updateField("dateOfBirth", e.target.value)}
                    data-testid="input-dob"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select value={formData.gender} onValueChange={(value) => updateField("gender", value)}>
                    <SelectTrigger data-testid="select-gender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      value={formData.weightKg}
                      onChange={(e) => updateField("weightKg", e.target.value)}
                      placeholder="70"
                      data-testid="input-weight"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      step="0.1"
                      value={formData.heightCm}
                      onChange={(e) => updateField("heightCm", e.target.value)}
                      placeholder="170"
                      data-testid="input-height"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Activity Level</Label>
                  <Select value={formData.activityLevel} onValueChange={(value) => updateField("activityLevel", value)}>
                    <SelectTrigger data-testid="select-activity">
                      <SelectValue placeholder="Select activity level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedentary">Sedentary (little or no exercise)</SelectItem>
                      <SelectItem value="light">Light (1-3 days/week)</SelectItem>
                      <SelectItem value="moderate">Moderate (3-5 days/week)</SelectItem>
                      <SelectItem value="active">Active (6-7 days/week)</SelectItem>
                      <SelectItem value="very-active">Very Active (intense daily exercise)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Goal</Label>
                  <Select value={formData.goal} onValueChange={(value) => updateField("goal", value)}>
                    <SelectTrigger data-testid="select-goal">
                      <SelectValue placeholder="Select your goal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lose">Lose weight</SelectItem>
                      <SelectItem value="maintain">Maintain weight</SelectItem>
                      <SelectItem value="gain">Gain weight</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <div>
                  <Label className="mb-3 block">Select any allergens or dietary restrictions</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {COMMON_ALLERGENS.map((allergen) => (
                      <div key={allergen} className="flex items-center space-x-2">
                        <Checkbox
                          id={allergen}
                          checked={formData.allergens.includes(allergen)}
                          onCheckedChange={() => toggleAllergen(allergen)}
                          data-testid={`checkbox-${allergen.toLowerCase()}`}
                        />
                        <label
                          htmlFor={allergen}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {allergen}
                        </label>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    GlyPal will help you avoid recipes containing these ingredients
                  </p>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Customize your macro distribution. Defaults are optimized for T2D management (35% carbs, 30% protein, 35% fat).
                </p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="carbs">Carbohydrates</Label>
                    <span className="text-sm font-medium">{formData.carbsPercent}%</span>
                  </div>
                  <Input
                    id="carbs"
                    type="range"
                    min="20"
                    max="55"
                    value={formData.carbsPercent}
                    onChange={(e) => updateField("carbsPercent", e.target.value)}
                    data-testid="slider-carbs"
                  />

                  <div className="flex items-center justify-between">
                    <Label htmlFor="protein">Protein</Label>
                    <span className="text-sm font-medium">{formData.proteinPercent}%</span>
                  </div>
                  <Input
                    id="protein"
                    type="range"
                    min="15"
                    max="40"
                    value={formData.proteinPercent}
                    onChange={(e) => updateField("proteinPercent", e.target.value)}
                    data-testid="slider-protein"
                  />

                  <div className="flex items-center justify-between">
                    <Label htmlFor="fat">Fat</Label>
                    <span className="text-sm font-medium">{formData.fatPercent}%</span>
                  </div>
                  <Input
                    id="fat"
                    type="range"
                    min="20"
                    max="50"
                    value={formData.fatPercent}
                    onChange={(e) => updateField("fatPercent", e.target.value)}
                    data-testid="slider-fat"
                  />

                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total</span>
                      <span className={`text-sm font-medium ${
                        parseInt(formData.carbsPercent) + parseInt(formData.proteinPercent) + parseInt(formData.fatPercent) === 100
                          ? "text-green-600" : "text-destructive"
                      }`}>
                        {parseInt(formData.carbsPercent) + parseInt(formData.proteinPercent) + parseInt(formData.fatPercent)}%
                      </span>
                    </div>
                    {parseInt(formData.carbsPercent) + parseInt(formData.proteinPercent) + parseInt(formData.fatPercent) !== 100 && (
                      <p className="text-xs text-destructive mt-1">
                        Macros must total 100%
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4">
              {step > 1 ? (
                <Button variant="outline" onClick={handleBack} data-testid="button-back">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              ) : (
                <div />
              )}

              {step < 5 ? (
                <Button onClick={handleNext} data-testid="button-next">
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit} 
                  disabled={
                    isLoading ||
                    parseInt(formData.carbsPercent) + parseInt(formData.proteinPercent) + parseInt(formData.fatPercent) !== 100
                  }
                  data-testid="button-complete"
                >
                  {isLoading ? "Saving..." : "Complete Setup"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
