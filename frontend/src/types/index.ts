export interface MacroGoals {
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  calories_kcal: number;
}

export interface CheckinRequest {
  sleep_hours: number;
  stress_level: number;
  energy_level: number;
  time_available_minutes: number;
  pantry_items: string[];
  macro_goals: MacroGoals;
  dietary_preference: string;
  notes?: string | null;
  openrouter_api_key?: string | null;
  openrouter_model?: string | null;
}

export interface ExerciseItem {
  name: string;
  sets: string;
  reps: string;
  cue: string;
}

export interface WorkoutRecommendation {
  type: string;
  intensity: 'Low' | 'Moderate' | 'High' | string;
  duration_minutes: number;
  target_focus: string;
  exercises: ExerciseItem[];
}

export interface HabitAnalysis {
  recovery_score: number;
  fatigue_status: string;
  readiness_summary: string;
  actionable_insights: string[];
  workout: WorkoutRecommendation;
}

export interface MealMacros {
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  calories_kcal: number;
}

export interface MealPlanRecipe {
  recipe_name: string;
  prep_time_minutes: number;
  cook_time_minutes: number;
  macros: MealMacros;
  ingredients_used: string[];
  missing_ingredients: string[];
  instructions: string[];
  chef_tip: string;
}

export interface CoachResponse {
  executive_summary: string;
  habit_analysis: HabitAnalysis;
  meal_plan: MealPlanRecipe;
  generated_at: string;
  model_used: string;
}

export interface HealthStatus {
  status: string;
  service: string;
  environment: string;
  openrouter_configured: boolean;
  model: string;
}

export type PantryStaples = Record<string, string[]>;
