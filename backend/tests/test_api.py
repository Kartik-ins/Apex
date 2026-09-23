"""Automated test suite for Apex API endpoints and LangGraph workflow."""

from unittest.mock import AsyncMock, patch

from fastapi.testclient import TestClient
from langchain_core.messages import AIMessage

from app.main import app

client = TestClient(app)


def test_root_endpoint():
    """Verify root endpoint returns 200 with service info."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "health" in data


def test_cors_headers():
    """Verify CORS preflight and headers allow apexfront.netlify.app."""
    response = client.options(
        "/api/health",
        headers={
            "Origin": "https://apexfront.netlify.app",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "https://apexfront.netlify.app"
    assert response.headers["access-control-allow-credentials"] == "true"


def test_health_endpoint():
    """Verify health check returns expected status and configuration."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "Apex AI Coach"
    assert "model" in data


def test_pantry_staples_endpoint():
    """Verify pantry staples endpoint returns categorized staple ingredients."""
    response = client.get("/api/pantry-staples")
    assert response.status_code == 200
    data = response.json()
    assert "Proteins & Dairy" in data
    assert "Carbohydrates & Grains" in data
    assert "Produce & Greens" in data
    assert "Fats, Nuts & Essentials" in data
    assert "chicken breast" in data["Proteins & Dairy"]
    assert "eggs" in data["Proteins & Dairy"]
    assert "paneer" in data["Proteins & Dairy"]
    assert "soya chunks" in data["Proteins & Dairy"]


def test_checkin_missing_api_key():
    """Verify appropriate error returned when OpenRouter API key is missing."""
    with patch.dict("os.environ", {"OPENROUTER_API_KEY": ""}):
        payload = {
            "sleep_hours": 7.0,
            "stress_level": 5,
            "energy_level": 6,
            "time_available_minutes": 30,
            "pantry_items": ["paneer", "palak (spinach)"],
        }
        response = client.post("/api/checkin", json=payload)
        assert response.status_code in [400, 500]
        assert "OpenRouter API key is missing" in response.json()["detail"]


@patch("langchain_openai.chat_models.base.BaseChatOpenAI.ainvoke")
def test_checkin_endpoint_full_pipeline(mock_ainvoke: AsyncMock):
    """Test full check-in pipeline execution through LangGraph agent workflow."""
    habit_json = (
        "{\n"
        '  "recovery_score": 82,\n'
        '  "fatigue_status": "Optimal Readiness",\n'
        '  "readiness_summary": "High autonomic balance. Ready for mechanical load.",\n'
        '  "actionable_insights": ["Execute heavy compound lifts today.", "Maintain intra-workout electrolytes."],\n'
        '  "workout": {\n'
        '    "type": "Neural Potentiation",\n'
        '    "intensity": "High",\n'
        '    "duration_minutes": 25,\n'
        '    "target_focus": "Posterior Chain Power",\n'
        '    "exercises": [\n'
        '      {"name": "Trap Bar Deadlift", "sets": "4", "reps": "5", "cue": "Violent hip extension"}\n'
        "    ]\n"
        "  }\n"
        "}"
    )

    meal_json = (
        "{\n"
        '  "recipe_name": "Spiced Paneer & Palak Bhurji",\n'
        '  "prep_time_minutes": 5,\n'
        '  "cook_time_minutes": 10,\n'
        '  "macros": {"protein_g": 48, "carbs_g": 14, "fat_g": 22, "calories_kcal": 446},\n'
        '  "ingredients_used": ["paneer", "palak (spinach)", "ghee"],\n'
        '  "missing_ingredients": [],\n'
        '  "instructions": ["Crumble paneer.", "Saute with spices in ghee.", "Fold in chopped spinach."],\n'
        '  "chef_tip": "Do not overcook paneer to keep it tender."\n'
        "}"
    )

    briefing_text = (
        "Recovery is primed at 82/100. Attack today's 25-minute strength session with high intent. "
        "Refuel with Spiced Paneer & Palak Bhurji delivering 48g of high-quality vegetarian protein."
    )

    # Return responses for Node 1, Node 2, and Node 3
    mock_ainvoke.side_effect = [
        AIMessage(content=habit_json),
        AIMessage(content=meal_json),
        AIMessage(content=briefing_text),
    ]

    payload = {
        "sleep_hours": 6.5,
        "stress_level": 7,
        "energy_level": 5,
        "time_available_minutes": 25,
        "pantry_items": ["paneer", "palak (spinach)", "ghee"],
        "macro_goals": {
            "protein_g": 140,
            "carbs_g": 160,
            "fat_g": 45,
            "calories_kcal": 1605,
        },
        "dietary_preference": "high-protein-veg",
        "openrouter_api_key": "sk-or-v1-mock-key-for-test",
    }

    response = client.post("/api/checkin", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["habit_analysis"]["recovery_score"] == 82
    assert data["habit_analysis"]["fatigue_status"] == "Optimal Readiness"
    assert data["meal_plan"]["recipe_name"] == "Spiced Paneer & Palak Bhurji"
    assert data["meal_plan"]["macros"]["protein_g"] == 48
    assert len(data["executive_summary"]) > 20


def test_checkin_validation_error():
    """Verify validation error when required boundaries are violated."""
    payload = {
        "sleep_hours": 25.0,  # Invalid: max is 14.0
        "stress_level": 5,
        "energy_level": 5,
    }
    response = client.post("/api/checkin", json=payload)
    assert response.status_code == 422
