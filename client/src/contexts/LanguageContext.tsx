import { createContext, useContext, useState } from "react";

type Language = "en" | "es";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    dashboard: "Dashboard",
    planner: "Planner",
    recipes: "Recipes",
    logBG: "Log BG",
    prescriptions: "Prescriptions",
    shopping: "Shopping",
    settings: "Settings",
    calories: "Calories",
    bgTimeInRange: "BG Time-in-Range",
    macros: "Macros",
    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
    snack: "Snack",
    carbs: "Carbs",
    protein: "Protein",
    fiber: "Fiber",
    satFat: "Sat Fat",
    inRange: "In Range",
    high: "High",
    low: "Low",
    urgent: "Urgent",
    addMeal: "Add Meal",
    logReading: "Log Reading",
    taken: "Taken",
    minutes: "min",
    servings: "servings",
  },
  es: {
    dashboard: "Panel",
    planner: "Planificador",
    recipes: "Recetas",
    logBG: "Registrar Glucosa",
    prescriptions: "Prescripciones",
    shopping: "Compras",
    settings: "Configuración",
    calories: "Calorías",
    bgTimeInRange: "Glucosa en Rango",
    macros: "Macros",
    breakfast: "Desayuno",
    lunch: "Almuerzo",
    dinner: "Cena",
    snack: "Merienda",
    carbs: "Carbohidratos",
    protein: "Proteína",
    fiber: "Fibra",
    satFat: "Grasa Sat",
    inRange: "En Rango",
    high: "Alta",
    low: "Baja",
    urgent: "Urgente",
    addMeal: "Agregar Comida",
    logReading: "Registrar Lectura",
    taken: "Tomado",
    minutes: "min",
    servings: "porciones",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
