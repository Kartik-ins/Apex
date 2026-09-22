"""LangGraph workflow orchestrating real AI agents via OpenRouter."""

import json
import logging
import os
import re
from typing import Any, TypedDict

from dotenv import load_dotenv
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from langgraph.graph import END, START, StateGraph

from app.schemas import (
    CheckinRequest,
    CoachResponse,
    ExerciseItem,
    HabitAnalysis,
    MealMacros,
    MealPlanRecipe,
    WorkoutRecommendation,
)

load_dotenv()

logger = logging.getLogger("apex.graph")


class CoachState(TypedDict):
    """Internal state passed across LangGraph nodes."""

    checkin: CheckinRequest
    api_key: str
    model: str
    habit_analysis: HabitAnalysis | None
    meal_plan: MealPlanRecipe | None
    executive_summary: str | None


def sanitize_text(text: str | None) -> str:
    """Normalize unicode smart punctuation and dashes to safe representations."""
    if not text:
        return ""
    return (
        text.replace("\u2014", " - ")
        .replace("\u2013", " - ")
        .replace("\u2018", "'")
        .replace("\u2019", "'")
        .replace("\u201c", '"')
        .replace("\u201d", '"')
        .strip()
    )


def resolve_openrouter_credentials(checkin: CheckinRequest) -> tuple[str, str]:
    """Extract and validate OpenRouter API key and model, ensuring strict ASCII compliance."""
    client_key = (checkin.openrouter_api_key or "").strip()
    env_key = os.getenv("OPENROUTER_API_KEY", "").strip()

    # Use client key if provided and valid, otherwise fallback to server environment key
    raw_key = (
        client_key
        if (client_key.startswith("sk-or-") and len(client_key) > 20)
        else env_key
    )

    # Strictly strip non-ASCII characters to prevent httpx header UnicodeEncodeError
    key = "".join(c for c in raw_key if 32 <= ord(c) <= 126).strip()

    if not key or key == "your_openrouter_api_key_here":
        raise ValueError(
            "OpenRouter API key is missing. Please provide your OpenRouter key "
            "in the dashboard header or set OPENROUTER_API_KEY in backend/.env"
        )

    raw_model = (
        (checkin.openrouter_model or "").strip()
        or os.getenv("OPENROUTER_MODEL", "").strip()
        or "openrouter/free"
    )
    model = "".join(c for c in raw_model if 32 <= ord(c) <= 126).strip()

    return key, model


def create_llm_client(api_key: str, model: str) -> ChatOpenAI:
    """Create configured ChatOpenAI client targeting OpenRouter."""
    return ChatOpenAI(
        model=model,
        api_key=api_key,
        openai_api_key=api_key,
        base_url="https://openrouter.ai/api/v1",
        openai_api_base="https://openrouter.ai/api/v1",
        temperature=0.3,
        max_retries=3,
        default_headers={
            "Authorization": f"Bearer {api_key}",
            "HTTP-Referer": "https://github.com/apex/apex-coach",
            "X-Title": "Apex AI Fitness Coach",
        },
    )


def extract_json(raw_text: str) -> dict[str, Any]:
    """Robustly extract and parse JSON payload from LLM response text."""
    cleaned = raw_text.strip()

    # Strip reasoning tags (e.g. <think>...</think>) from reasoning models
    cleaned = re.sub(r"<think>.*?</think>", "", cleaned, flags=re.DOTALL).strip()
    if "<think>" in cleaned and "</think>" not in cleaned:
        cleaned = re.sub(r"<think>.*", "", cleaned, flags=re.DOTALL).strip()
    elif "</think>" in cleaned:
        cleaned = cleaned.split("</think>")[-1].strip()

    # Remove any safety classification prefixes like "User Safety: safe"
    cleaned = re.sub(r"^User Safety:\s*\w+\s*", "", cleaned, flags=re.IGNORECASE).strip()

    # Look for json markdown block with outermost braces
    match = re.search(r"```(?:json)?\s*(\{[\s\S]*\})\s*```", cleaned)
    if match:
        candidate = match.group(1).strip()
    else:
        # Match outermost curly braces from first { to last }
        start = cleaned.find("{")
        end = cleaned.rfind("}")
        if start != -1 and end != -1 and end > start:
            candidate = cleaned[start : end + 1].strip()
        else:
            candidate = cleaned

    if not candidate:
        raise ValueError(
            f"Empty JSON candidate extracted from LLM response: '{raw_text[:120]}'"
        )

    try:
        return json.loads(candidate)
    except json.JSONDecodeError:
        # Try cleaning trailing commas before closing braces/brackets
        candidate_fixed = re.sub(r",\s*([\]}])", r"\1", candidate)
        return json.loads(candidate_fixed)



# -------------------------------------------------------------------------
# Node 1: Habit Analyst (Real OpenRouter LLM Call)
# -------------------------------------------------------------------------
async def habit_analyst_node(state: CoachState) -> dict[str, Any]:
    """Execute LLM agent analyzing biometrics, readiness, and prescribing workout."""
    checkin = state["checkin"]
    llm = create_llm_client(state["api_key"], state["model"])

    system_prompt = (
        "You are Apex Performance Coach. Analyze the user's daily check-in (sleep, stress, energy, and time). "
        "Calculate an accurate Recovery Score (0-100) and fatigue status (Optimal Readiness | Good Recovery | Rest Recommended). "
        "Prescribe a clean, practical, time-efficient workout routine with standard exercise names, sets, reps, and practical form cues. "
        "Use clean, professional language. Do NOT use pretentious medical jargon, pseudo-scientific buzzwords, or filler. "
        "Return ONLY a valid JSON object matching this schema:\n"
        "{\n"
        '  "recovery_score": <int between 0 and 100>,\n'
        '  "fatigue_status": "Optimal Readiness" | "Good Recovery" | "Rest Recommended",\n'
        '  "readiness_summary": "<2-3 sentence clear diagnostic summary>",\n'
        '  "actionable_insights": ["<actionable insight 1>", "<actionable insight 2>"],\n'
        '  "workout": {\n'
        '    "type": "<e.g. Upper Body Strength | Lower Body Power | Conditioning & Core | Mobility & Recovery>",\n'
        '    "intensity": "Low" | "Moderate" | "High",\n'
        '    "duration_minutes": <int <= time_available_minutes>,\n'
        '    "target_focus": "<e.g. Posterior Chain & Core Strength>",\n'
        '    "exercises": [\n'
        '      {"name": "<exercise name>", "sets": "<e.g. 3>", "reps": "<e.g. 8-10>", "cue": "<practical coaching cue>"}\n'
        "    ]\n"
        "  }\n"
        "}"
    )

    sanitized_notes = sanitize_text(checkin.notes) or "None provided"
    user_prompt = (
        f"Client Biometric Diagnostic:\n"
        f"- Sleep: {checkin.sleep_hours} hours\n"
        f"- Stress Level: {checkin.stress_level} / 10\n"
        f"- Morning Energy: {checkin.energy_level} / 10\n"
        f"- Available Time Window: {checkin.time_available_minutes} minutes\n"
        f"- Context Notes: {sanitized_notes}"
    )

    try:
        response = await llm.ainvoke(
            [SystemMessage(content=system_prompt), HumanMessage(content=user_prompt)]
        )
        content = response.content
        if not isinstance(content, str):
            content = str(content)

        parsed = extract_json(content)

        workout_data = parsed["workout"]
        exercises = [
            ExerciseItem(
                name=ex["name"],
                sets=str(ex["sets"]),
                reps=str(ex["reps"]),
                cue=ex["cue"],
            )
            for ex in workout_data["exercises"]
        ]

        habit_analysis = HabitAnalysis(
            recovery_score=max(0, min(100, int(parsed["recovery_score"]))),
            fatigue_status=str(parsed["fatigue_status"]),
            readiness_summary=str(parsed["readiness_summary"]),
            actionable_insights=[str(i) for i in parsed["actionable_insights"]],
            workout=WorkoutRecommendation(
                type=str(workout_data["type"]),
                intensity=str(workout_data["intensity"]),
                duration_minutes=int(workout_data["duration_minutes"]),
                target_focus=str(workout_data["target_focus"]),
                exercises=exercises,
            ),
        )

        return {"habit_analysis": habit_analysis}

    except Exception as exc:
        logger.error("Habit analyst agent failed: %s", exc, exc_info=True)
        raise RuntimeError(
            f"OpenRouter Habit Analyst Agent error ({state['model']}): {exc!s}"
        ) from exc


# -------------------------------------------------------------------------
# Node 2: Meal Planner (Real OpenRouter LLM Call)
# -------------------------------------------------------------------------
async def meal_planner_node(state: CoachState) -> dict[str, Any]:
    """Execute LLM agent creating a tailored high-protein recipe from available pantry."""
    checkin = state["checkin"]
    habit_analysis = state.get("habit_analysis")
    llm = create_llm_client(state["api_key"], state["model"])

    target_meal_protein = int(checkin.macro_goals.protein_g * 0.35)
    target_meal_cals = int(checkin.macro_goals.calories_kcal * 0.33)

    system_prompt = (
        "You are Apex Performance Nutritionist. Design a clean, healthy, high-protein meal recipe "
        "using available pantry ingredients. The meal must be realistic, fast, and cooked within "
        "the client's time constraint. Calculate accurate macronutrients. "
        "Strictly adhere to the client's dietary preference (e.g. Omnivore, Eggetarian, High-Protein Vegetarian, Lacto-Vegetarian, Vegan, Satvik). "
        "For Omnivore or Non-Vegetarian diets, utilize lean poultry (e.g. chicken breast), eggs, or fish alongside fresh ingredients. "
        "For Vegetarian Indian preferences, craft wholesome, high-protein preparations (e.g. Paneer Bhurji, Soya Chunks Stir-Fry, Palak Paneer Bowl, Moong Dal Chilla) "
        "using clean cooking techniques and practical timings. "
        "Return ONLY a valid JSON object matching this schema:\n"
        "{\n"
        '  "recipe_name": "<clean, appetizing recipe title>",\n'
        '  "prep_time_minutes": <int>,\n'
        '  "cook_time_minutes": <int>,\n'
        '  "macros": {\n'
        '    "protein_g": <int>,\n'
        '    "carbs_g": <int>,\n'
        '    "fat_g": <int>,\n'
        '    "calories_kcal": <int>\n'
        "  },\n"
        '  "ingredients_used": ["<quantity + ingredient from pantry>"],\n'
        '  "missing_ingredients": ["<optional staples needed, or empty>"],\n'
        '  "instructions": ["<step 1>", "<step 2>", "<step 3>"],\n'
        '  "chef_tip": "<practical culinary tip for efficiency or flavor>"\n'
        "}"
    )

    pantry_cleaned = [sanitize_text(p) for p in checkin.pantry_items]
    notes_cleaned = sanitize_text(checkin.notes) or "None"
    user_prompt = (
        f"Client Pantry Inventory: {', '.join(pantry_cleaned)}\n"
        f"Client Target Single-Meal Protein: ~{target_meal_protein}g (Daily Target: {checkin.macro_goals.protein_g}g)\n"
        f"Client Target Single-Meal Calories: ~{target_meal_cals} kcal\n"
        f"Dietary Preference: {sanitize_text(checkin.dietary_preference)}\n"
        f"Time Budget: Under {checkin.time_available_minutes} minutes total prep + cook\n"
        f"Client Fatigue State: {habit_analysis.fatigue_status if habit_analysis else 'Moderate'}\n"
        f"Notes: {notes_cleaned}"
    )

    try:
        response = await llm.ainvoke(
            [SystemMessage(content=system_prompt), HumanMessage(content=user_prompt)]
        )
        content = response.content
        if not isinstance(content, str):
            content = str(content)

        parsed = extract_json(content)
        macros_data = parsed["macros"]

        meal_plan = MealPlanRecipe(
            recipe_name=str(parsed["recipe_name"]),
            prep_time_minutes=int(parsed["prep_time_minutes"]),
            cook_time_minutes=int(parsed["cook_time_minutes"]),
            macros=MealMacros(
                protein_g=int(macros_data["protein_g"]),
                carbs_g=int(macros_data["carbs_g"]),
                fat_g=int(macros_data["fat_g"]),
                calories_kcal=int(macros_data["calories_kcal"]),
            ),
            ingredients_used=[str(i) for i in parsed["ingredients_used"]],
            missing_ingredients=[str(i) for i in parsed.get("missing_ingredients", [])],
            instructions=[str(s) for s in parsed["instructions"]],
            chef_tip=str(parsed["chef_tip"]),
        )

        return {"meal_plan": meal_plan}

    except Exception as exc:
        logger.error("Meal planner agent failed: %s", exc, exc_info=True)
        raise RuntimeError(
            f"OpenRouter Meal Planner Agent error ({state['model']}): {exc!s}"
        ) from exc


# -------------------------------------------------------------------------
# Node 3: Briefing Synthesizer (Real OpenRouter LLM Call)
# -------------------------------------------------------------------------
async def briefing_synthesizer_node(state: CoachState) -> dict[str, Any]:
    """Execute LLM agent synthesizing final executive directive."""
    habit_analysis = state["habit_analysis"]
    meal_plan = state["meal_plan"]
    llm = create_llm_client(state["api_key"], state["model"])

    system_prompt = (
        "You are Apex Performance Coach. Write a clear, motivating, professional "
        "2-3 sentence daily briefing directing the client for today based on their "
        "recovery status, workout prescription, and fueling recipe. "
        "Do NOT output markdown headers, quotes, or buzzwords, just the direct coaching text."
    )

    user_prompt = (
        f"Recovery Score: {habit_analysis.recovery_score}/100 ({habit_analysis.fatigue_status})\n"
        f"Workout Directive: {habit_analysis.workout.type} ({habit_analysis.workout.duration_minutes}m, {habit_analysis.workout.intensity} Intensity)\n"
        f"Fueling Directive: {meal_plan.recipe_name} ({meal_plan.macros.protein_g}g Protein, {meal_plan.macros.calories_kcal} kcal)"
    )

    try:
        response = await llm.ainvoke(
            [SystemMessage(content=system_prompt), HumanMessage(content=user_prompt)]
        )
        content = response.content
        summary = content.strip() if isinstance(content, str) else str(content).strip()
        summary = re.sub(r"<think>.*?</think>", "", summary, flags=re.DOTALL).strip()
        if "<think>" in summary and "</think>" not in summary:
            summary = re.sub(r"<think>.*", "", summary, flags=re.DOTALL).strip()
        elif "</think>" in summary:
            summary = summary.split("</think>")[-1].strip()

        summary = re.sub(r"^User Safety:\s*\w+\s*", "", summary, flags=re.IGNORECASE).strip()

        # If model returned an empty string or trivial safety token, synthesize clean executive directive
        if len(summary) < 20:
            summary = (
                f"Today's protocol targets {habit_analysis.workout.type.lower()} with a focus on "
                f"{habit_analysis.workout.target_focus.lower()} for {habit_analysis.workout.duration_minutes} minutes. "
                f"Fuel your recovery with {meal_plan.recipe_name} to hit your {meal_plan.macros.protein_g}g protein target."
            )
        return {"executive_summary": summary}

    except Exception as exc:
        logger.error("Briefing synthesizer agent failed: %s", exc, exc_info=True)
        raise RuntimeError(
            f"OpenRouter Briefing Agent error ({state['model']}): {exc!s}"
        ) from exc


# -------------------------------------------------------------------------
# LangGraph Workflow Construction
# -------------------------------------------------------------------------
def create_coach_workflow():
    """Build and compile the LangGraph StateGraph."""
    graph = StateGraph(CoachState)

    graph.add_node("habit_analyst", habit_analyst_node)
    graph.add_node("meal_planner", meal_planner_node)
    graph.add_node("briefing_synthesizer", briefing_synthesizer_node)

    graph.add_edge(START, "habit_analyst")
    graph.add_edge("habit_analyst", "meal_planner")
    graph.add_edge("meal_planner", "briefing_synthesizer")
    graph.add_edge("briefing_synthesizer", END)

    return graph.compile()


coach_workflow = create_coach_workflow()


async def run_coach_workflow(checkin: CheckinRequest) -> CoachResponse:
    """Entrypoint invoked by FastAPI to run real OpenRouter agents."""
    api_key, model = resolve_openrouter_credentials(checkin)

    initial_state: CoachState = {
        "checkin": checkin,
        "api_key": api_key,
        "model": model,
        "habit_analysis": None,
        "meal_plan": None,
        "executive_summary": None,
    }

    final_state = await coach_workflow.ainvoke(initial_state)

    if not final_state.get("habit_analysis") or not final_state.get("meal_plan"):
        raise ValueError("LangGraph agent failed to produce habit or meal plan.")

    return CoachResponse(
        executive_summary=final_state.get(
            "executive_summary", "Executive briefing generated."
        ),
        habit_analysis=final_state["habit_analysis"],
        meal_plan=final_state["meal_plan"],
        model_used=model,
    )
