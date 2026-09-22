"""Pydantic schemas for Apex Fitness & Nutrition Coach."""

from datetime import UTC, datetime

from pydantic import BaseModel, Field


class MacroGoals(BaseModel):
    """Target daily macronutrient goals."""

    protein_g: int = Field(
        default=160, ge=30, le=400, description="Target protein in grams"
    )
    carbs_g: int = Field(
        default=180, ge=0, le=800, description="Target carbohydrates in grams"
    )
    fat_g: int = Field(default=65, ge=10, le=250, description="Target fat in grams")
    calories_kcal: int = Field(
        default=2000, ge=800, le=6000, description="Target total calories"
    )


class CheckinRequest(BaseModel):
    """User daily check-in input parameters."""

    sleep_hours: float = Field(
        default=7.0, ge=2.0, le=14.0, description="Hours of sleep last night"
    )
    stress_level: int = Field(
        default=5, ge=1, le=10, description="Self-reported stress level (1-10)"
    )
    energy_level: int = Field(
        default=6, ge=1, le=10, description="Self-reported morning energy (1-10)"
    )
    time_available_minutes: int = Field(
        default=30, ge=10, le=120, description="Time available for workout"
    )
    pantry_items: list[str] = Field(
        default_factory=lambda: [
            "eggs",
            "spinach",
            "greek yogurt",
            "chicken breast",
            "oats",
            "olive oil",
        ],
        description="Available pantry ingredients",
    )
    macro_goals: MacroGoals = Field(default_factory=MacroGoals)
    dietary_preference: str = Field(
        default="high-protein", description="Dietary preference"
    )
    notes: str | None = Field(
        default=None,
        max_length=500,
        description="Optional user notes or schedule constraints",
    )
    openrouter_api_key: str | None = Field(
        default=None,
        description="Optional OpenRouter API key passed directly from client",
    )
    openrouter_model: str | None = Field(
        default=None,
        description="Optional OpenRouter model override",
    )


class ExerciseItem(BaseModel):
    """Specific prescribed exercise movement."""

    name: str
    sets: str
    reps: str
    cue: str


class WorkoutRecommendation(BaseModel):
    """Fatigue-adjusted workout protocol."""

    type: str
    intensity: str
    duration_minutes: int
    target_focus: str
    exercises: list[ExerciseItem]


class HabitAnalysis(BaseModel):
    """Systemic recovery and habit evaluation."""

    recovery_score: int = Field(
        ge=0, le=100, description="Readiness score from 0 to 100"
    )
    fatigue_status: str
    readiness_summary: str
    actionable_insights: list[str]
    workout: WorkoutRecommendation


class MealMacros(BaseModel):
    """Macronutrient breakdown for the prescribed meal."""

    protein_g: int
    carbs_g: int
    fat_g: int
    calories_kcal: int


class MealPlanRecipe(BaseModel):
    """Quick high-protein recipe tailored to available pantry items."""

    recipe_name: str
    prep_time_minutes: int
    cook_time_minutes: int
    macros: MealMacros
    ingredients_used: list[str]
    missing_ingredients: list[str] = Field(default_factory=list)
    instructions: list[str]
    chef_tip: str


class CoachResponse(BaseModel):
    """Final unified executive coaching debrief."""

    executive_summary: str
    habit_analysis: HabitAnalysis
    meal_plan: MealPlanRecipe
    generated_at: str = Field(default_factory=lambda: datetime.now(UTC).isoformat())
    model_used: str = "openrouter/free"
