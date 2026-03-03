"""
Async galaxy generation task via Celery.
"""

import asyncio
import json

from app.worker import celery_app
from app.services.llm import analyze_developer_profile, generate_cosmic_description
from app.routes.analyze import compute_skill_scores, UserData, RepositoryData


@celery_app.task(bind=True, name="generate_galaxy_analysis")
def generate_galaxy_analysis(self, user_data: dict, repos_data: list[dict]) -> dict:
    """
    Async task to generate galaxy analysis.
    Called when a new user signs in or requests a refresh.
    """
    try:
        self.update_state(state="ANALYZING", meta={"step": "parsing_data"})

        user = UserData(**user_data)
        repos = [RepositoryData(**r) for r in repos_data]

        # Compute skill scores
        scores = compute_skill_scores(user, repos)

        # Build profile for LLM
        profile_data = {
            "user": user.model_dump(by_alias=True),
            "repositories_summary": {
                "count": len(repos),
                "total_stars": sum(r.stargazer_count for r in repos),
                "languages": list(set(r.primary_language for r in repos if r.primary_language)),
            },
            "skill_scores": scores.model_dump(),
        }

        profile_json = json.dumps(profile_data, indent=2)

        self.update_state(state="ANALYZING", meta={"step": "calling_llm"})

        # Run async LLM calls in sync context
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        try:
            archetype_result = loop.run_until_complete(analyze_developer_profile(profile_json))
            cosmic_desc = loop.run_until_complete(generate_cosmic_description(profile_json))
        finally:
            loop.close()

        return {
            "archetype": archetype_result["archetype"],
            "reasoning": archetype_result["reasoning"],
            "color_hex": archetype_result["color_hex"],
            "cosmic_description": cosmic_desc,
            "skill_scores": scores.model_dump(),
        }

    except Exception as e:
        self.update_state(state="FAILURE", meta={"error": str(e)})
        raise
