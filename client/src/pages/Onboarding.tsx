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

const COMMON_INTOLERANCES = [
  "Lactose", "Gluten", "Fructose", "Histamine", "FODMAPs"
];

const POPULAR_CUISINES = [
  "American", "Italian", "Mexican", "Asian", "Mediterranean", 
  "Indian", "Japanese", "Thai", "French", "Middle Eastern"
];

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    locale: "en-US",
    birth_year: new Date().getFullYear() - 40,
    units: "imperial",
    sex_at_birth: "Prefer not to say",
    height_ft: 5,
    height_in: 8,
    height_cm: 173,
    weight_lb: 160,
    weight_kg: 72.5,
    activity_level: "sedentary",
    goal: "maintain",
    goal_intensity_pct: 15,
    dietary_pattern: "No preference",
    allergies: [] as string[],
    intolerances: [] as string[],
    cross_contam_may_contain: false,
    cross_contam_shared_equipment: false,
    cross_contam_shared_facility: false,
    cuisines: [] as string[],
    time_per_meal: "≤30 min",
    cooking_skill: "Beginner",
    budget_tier: "Moderate",
    carb_exchange_g: 15,
    bg_low: 70,
    bg_high: 180,
    bg_urgent: 250,
  });

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleItem = (field: "allergies" | "intolerances" | "cuisines", item: string) => {
    setFormData(prev => {
      const currentArray = prev[field];
      const newArray = currentArray.includes(item)
        ? currentArray.filter(a => a !== item)
        : [...currentArray, item];
      return { ...prev, [field]: newArray };
    });
  };

  const handleUnitsChange = (newUnits: string) => {
    if (newUnits === formData.units) return;

    setFormData(prev => {
      if (newUnits === "metric") {
        const totalInches = (prev.height_ft * 12) + prev.height_in;
        const cm = Math.round(totalInches * 2.54);
        const kg = Math.round(prev.weight_lb * 0.453592 * 10) / 10;
        return { ...prev, units: newUnits, height_cm: cm, weight_kg: kg };
      } else {
        const totalInches = Math.round(prev.height_cm / 2.54);
        const ft = Math.floor(totalInches / 12);
        const inches = totalInches % 12;
        const lb = Math.round(prev.weight_kg / 0.453592);
        return { ...prev, units: newUnits, height_ft: ft, height_in: inches, weight_lb: lb };
      }
    });
  };

  const handleNext = () => {
    if (step === 1 && formData.birth_year < 1900) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please enter a valid birth year",
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
      await apiRequest("POST", "/api/me/onboarding", {
        userId: user.id,
        locale: formData.locale,
        birth_year: formData.birth_year,
        units: formData.units,
        sex_at_birth: formData.sex_at_birth,
        height: {
          ft: formData.units === "imperial" ? formData.height_ft : undefined,
          in: formData.units === "imperial" ? formData.height_in : undefined,
          cm: formData.units === "metric" ? formData.height_cm : undefined,
        },
        weight_lb: formData.units === "imperial" ? formData.weight_lb : undefined,
        weight_kg: formData.units === "metric" ? formData.weight_kg : undefined,
        activity_level: formData.activity_level,
        goal: formData.goal,
        goal_intensity_pct: formData.goal === "maintain" ? undefined : formData.goal_intensity_pct / 100,
        dietary_pattern: formData.dietary_pattern,
        allergies: formData.allergies,
        intolerances: formData.intolerances,
        cross_contam: {
          may_contain: formData.cross_contam_may_contain,
          shared_equipment: formData.cross_contam_shared_equipment,
          shared_facility: formData.cross_contam_shared_facility,
        },
        cuisines: formData.cuisines,
        time_per_meal: formData.time_per_meal,
        cooking_skill: formData.cooking_skill,
        budget_tier: formData.budget_tier,
        carb_exchange_g: formData.carb_exchange_g,
        bg_thresholds: {
          low: formData.bg_low,
          high: formData.bg_high,
          urgent: formData.bg_urgent,
        },
      });

      const updatedUser = { ...user, onboardingCompleted: true };
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
        description: error.message || "An error occurred",
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
                  {step === 1 && "Basic Information"}
                  {step === 2 && "Health Profile"}
                  {step === 3 && "Activity & Goals"}
                  {step === 4 && "Dietary Restrictions"}
                  {step === 5 && "Food Preferences"}
                  {step === 6 && "Cooking & Budget"}
                  {step === 7 && "Blood Glucose Settings"}
                </CardTitle>
                <CardDescription>Step {step} of 7</CardDescription>
              </div>
              <div className="text-sm text-muted-foreground">
                {Math.round((step / 7) * 100)}%
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="birth-year">Birth Year</Label>
                  <Input
                    id="birth-year"
                    type="number"
                    min="1900"
                    max={new Date().getFullYear()}
                    value={formData.birth_year}
                    onChange={(e) => updateField("birth_year", parseInt(e.target.value))}
                    placeholder="1980"
                    data-testid="input-birth-year"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Unit System</Label>
                  <Select value={formData.units} onValueChange={handleUnitsChange}>
                    <SelectTrigger data-testid="select-units">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="imperial">Imperial (lb, ft/in)</SelectItem>
                      <SelectItem value="metric">Metric (kg, cm)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select value={formData.locale} onValueChange={(v) => updateField("locale", v)}>
                    <SelectTrigger data-testid="select-locale">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en-US">English</SelectItem>
                      <SelectItem value="es-US">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Sex Assigned at Birth</Label>
                  <Select value={formData.sex_at_birth} onValueChange={(v) => updateField("sex_at_birth", v)}>
                    <SelectTrigger data-testid="select-sex">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Used for BMR calculation only</p>
                </div>

                {formData.units === "imperial" ? (
                  <>
                    <div className="space-y-2">
                      <Label>Height</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Input
                            type="number"
                            min="3"
                            max="8"
                            value={formData.height_ft}
                            onChange={(e) => updateField("height_ft", parseInt(e.target.value))}
                            placeholder="Feet"
                            data-testid="input-height-ft"
                          />
                        </div>
                        <div>
                          <Input
                            type="number"
                            min="0"
                            max="11"
                            value={formData.height_in}
                            onChange={(e) => updateField("height_in", parseInt(e.target.value))}
                            placeholder="Inches"
                            data-testid="input-height-in"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="weight-lb">Weight (lb)</Label>
                      <Input
                        id="weight-lb"
                        type="number"
                        step="0.1"
                        value={formData.weight_lb}
                        onChange={(e) => updateField("weight_lb", parseFloat(e.target.value))}
                        placeholder="160"
                        data-testid="input-weight-lb"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="height-cm">Height (cm)</Label>
                      <Input
                        id="height-cm"
                        type="number"
                        value={formData.height_cm}
                        onChange={(e) => updateField("height_cm", parseInt(e.target.value))}
                        placeholder="173"
                        data-testid="input-height-cm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="weight-kg">Weight (kg)</Label>
                      <Input
                        id="weight-kg"
                        type="number"
                        step="0.1"
                        value={formData.weight_kg}
                        onChange={(e) => updateField("weight_kg", parseFloat(e.target.value))}
                        placeholder="72.5"
                        data-testid="input-weight-kg"
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Activity Level</Label>
                  <Select value={formData.activity_level} onValueChange={(v) => updateField("activity_level", v)}>
                    <SelectTrigger data-testid="select-activity">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedentary">Sedentary (little or no exercise)</SelectItem>
                      <SelectItem value="lightly_active">Lightly Active (1-3 days/week)</SelectItem>
                      <SelectItem value="moderately_active">Moderately Active (3-5 days/week)</SelectItem>
                      <SelectItem value="very_active">Very Active (6-7 days/week)</SelectItem>
                      <SelectItem value="extra_active">Extra Active (intense daily exercise)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Weight Goal</Label>
                  <Select value={formData.goal} onValueChange={(v) => updateField("goal", v)}>
                    <SelectTrigger data-testid="select-goal">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lose">Lose weight</SelectItem>
                      <SelectItem value="maintain">Maintain weight</SelectItem>
                      <SelectItem value="gain">Gain weight</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.goal !== "maintain" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="intensity">Goal Intensity</Label>
                      <span className="text-sm font-medium">{formData.goal_intensity_pct}%</span>
                    </div>
                    <Input
                      id="intensity"
                      type="range"
                      min="5"
                      max="25"
                      step="5"
                      value={formData.goal_intensity_pct}
                      onChange={(e) => updateField("goal_intensity_pct", parseInt(e.target.value))}
                      data-testid="slider-intensity"
                    />
                    <p className="text-xs text-muted-foreground">
                      {formData.goal === "lose" ? "Calorie deficit" : "Calorie surplus"}
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Dietary Pattern</Label>
                  <Select value={formData.dietary_pattern} onValueChange={(v) => updateField("dietary_pattern", v)}>
                    <SelectTrigger data-testid="select-dietary-pattern">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="No preference">No preference</SelectItem>
                      <SelectItem value="Mediterranean">Mediterranean</SelectItem>
                      <SelectItem value="Low-carb">Low-carb</SelectItem>
                      <SelectItem value="Vegetarian">Vegetarian</SelectItem>
                      <SelectItem value="Vegan">Vegan</SelectItem>
                      <SelectItem value="Pescatarian">Pescatarian</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <Label className="mb-3 block">Allergies</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {COMMON_ALLERGENS.map((allergen) => (
                      <div key={allergen} className="flex items-center space-x-2">
                        <Checkbox
                          id={`allergen-${allergen}`}
                          checked={formData.allergies.includes(allergen)}
                          onCheckedChange={() => toggleItem("allergies", allergen)}
                          data-testid={`checkbox-allergen-${allergen.toLowerCase()}`}
                        />
                        <label
                          htmlFor={`allergen-${allergen}`}
                          className="text-sm font-medium leading-none cursor-pointer"
                        >
                          {allergen}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="mb-3 block">Intolerances</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {COMMON_INTOLERANCES.map((intolerance) => (
                      <div key={intolerance} className="flex items-center space-x-2">
                        <Checkbox
                          id={`intolerance-${intolerance}`}
                          checked={formData.intolerances.includes(intolerance)}
                          onCheckedChange={() => toggleItem("intolerances", intolerance)}
                          data-testid={`checkbox-intolerance-${intolerance.toLowerCase()}`}
                        />
                        <label
                          htmlFor={`intolerance-${intolerance}`}
                          className="text-sm font-medium leading-none cursor-pointer"
                        >
                          {intolerance}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <Label className="mb-3 block">Cross-Contamination Tolerance</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="may-contain"
                        checked={formData.cross_contam_may_contain}
                        onCheckedChange={(checked) => updateField("cross_contam_may_contain", checked)}
                        data-testid="checkbox-may-contain"
                      />
                      <label htmlFor="may-contain" className="text-sm cursor-pointer">
                        Hide recipes with "may contain" warnings
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="shared-equipment"
                        checked={formData.cross_contam_shared_equipment}
                        onCheckedChange={(checked) => updateField("cross_contam_shared_equipment", checked)}
                        data-testid="checkbox-shared-equipment"
                      />
                      <label htmlFor="shared-equipment" className="text-sm cursor-pointer">
                        Hide recipes made on shared equipment
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="shared-facility"
                        checked={formData.cross_contam_shared_facility}
                        onCheckedChange={(checked) => updateField("cross_contam_shared_facility", checked)}
                        data-testid="checkbox-shared-facility"
                      />
                      <label htmlFor="shared-facility" className="text-sm cursor-pointer">
                        Hide recipes from shared facilities
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4">
                <div>
                  <Label className="mb-3 block">Favorite Cuisines</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {POPULAR_CUISINES.map((cuisine) => (
                      <div key={cuisine} className="flex items-center space-x-2">
                        <Checkbox
                          id={`cuisine-${cuisine}`}
                          checked={formData.cuisines.includes(cuisine)}
                          onCheckedChange={() => toggleItem("cuisines", cuisine)}
                          data-testid={`checkbox-cuisine-${cuisine.toLowerCase()}`}
                        />
                        <label
                          htmlFor={`cuisine-${cuisine}`}
                          className="text-sm font-medium leading-none cursor-pointer"
                        >
                          {cuisine}
                        </label>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    Select your preferred cuisines for personalized recipe recommendations
                  </p>
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Time per Meal</Label>
                  <Select value={formData.time_per_meal} onValueChange={(v) => updateField("time_per_meal", v)}>
                    <SelectTrigger data-testid="select-time-per-meal">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="≤15 min">15 minutes or less</SelectItem>
                      <SelectItem value="≤30 min">30 minutes or less</SelectItem>
                      <SelectItem value="≤45 min">45 minutes or less</SelectItem>
                      <SelectItem value="≤60 min">1 hour or less</SelectItem>
                      <SelectItem value=">60 min">More than 1 hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Cooking Skill</Label>
                  <Select value={formData.cooking_skill} onValueChange={(v) => updateField("cooking_skill", v)}>
                    <SelectTrigger data-testid="select-cooking-skill">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Budget Tier</Label>
                  <Select value={formData.budget_tier} onValueChange={(v) => updateField("budget_tier", v)}>
                    <SelectTrigger data-testid="select-budget">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Budget">Budget ($2.50/meal)</SelectItem>
                      <SelectItem value="Moderate">Moderate ($5/meal)</SelectItem>
                      <SelectItem value="Foodie">Foodie ($10/meal)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="carb-exchange">Carb Exchange (grams)</Label>
                  <Input
                    id="carb-exchange"
                    type="number"
                    min="10"
                    max="30"
                    value={formData.carb_exchange_g}
                    onChange={(e) => updateField("carb_exchange_g", parseInt(e.target.value))}
                    data-testid="input-carb-exchange"
                  />
                  <p className="text-xs text-muted-foreground">
                    Standard is 15g per carb exchange
                  </p>
                </div>
              </div>
            )}

            {step === 7 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Set your blood glucose target ranges. These are used for tracking and visualization only.
                </p>

                <div className="space-y-2">
                  <Label htmlFor="bg-low">Low Threshold (mg/dL)</Label>
                  <Input
                    id="bg-low"
                    type="number"
                    min="40"
                    max="100"
                    value={formData.bg_low}
                    onChange={(e) => updateField("bg_low", parseInt(e.target.value))}
                    data-testid="input-bg-low"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bg-high">High Threshold (mg/dL)</Label>
                  <Input
                    id="bg-high"
                    type="number"
                    min="100"
                    max="250"
                    value={formData.bg_high}
                    onChange={(e) => updateField("bg_high", parseInt(e.target.value))}
                    data-testid="input-bg-high"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bg-urgent">Urgent Threshold (mg/dL)</Label>
                  <Input
                    id="bg-urgent"
                    type="number"
                    min="200"
                    max="400"
                    value={formData.bg_urgent}
                    onChange={(e) => updateField("bg_urgent", parseInt(e.target.value))}
                    data-testid="input-bg-urgent"
                  />
                </div>

                <div className="bg-muted/50 p-4 rounded-md">
                  <p className="text-xs text-muted-foreground">
                    Default ranges: Low &lt;70, High &gt;180, Urgent &gt;250 mg/dL
                  </p>
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

              {step < 7 ? (
                <Button onClick={handleNext} data-testid="button-next">
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
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
