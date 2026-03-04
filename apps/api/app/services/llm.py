"""
LLM Service — LangChain integration via OpenRouter for archetype
classification and cosmic description generation.
Includes retry with exponential backoff and structured error handling.
"""

import asyncio
import json
import os
from functools import lru_cache
from typing import Any

from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.output_parsers import JsonOutputParser

# ==========================================
# LLM Client Configuration
# ==========================================

def get_llm(temperature: float = 0.7) -> ChatOpenAI:
    """Create an LLM client routed through OpenRouter."""
    api_key = os.getenv("OPENROUTER_API_KEY", "")
    return ChatOpenAI(
        model="anthropic/claude-sonnet-4",
        openai_api_key=api_key,
        openai_api_base="https://openrouter.ai/api/v1",
        temperature=temperature,
        max_tokens=1024,
        default_headers={
            "HTTP-Referer": "https://gitverse.dev",
            "X-Title": "GitVerse AI",
        },
    )


# ==========================================
# Retry Logic
# ==========================================

MAX_RETRIES = 3
INITIAL_DELAY = 1.0  # seconds


async def with_retry(fn, retries: int = MAX_RETRIES):
    """Execute async function with exponential backoff retry."""
    last_error = None

    for attempt in range(retries):
        try:
            return await fn()
        except Exception as e:
            last_error = e
            if attempt < retries - 1:
                delay = INITIAL_DELAY * (2 ** attempt)
                print(f"⚠️ LLM call attempt {attempt + 1} failed: {e}. Retrying in {delay}s...")
                await asyncio.sleep(delay)

    raise last_error or Exception("All retries exhausted")


# ==========================================
# Archetype Classification
# ==========================================

ARCHETYPE_SYSTEM_PROMPT = """You are an expert developer analyst for GitVerse, a cosmic GitHub visualization platform.
You classify developers into archetypes based on their GitHub activity data.
Always respond with valid JSON only, no markdown fences."""

ARCHETYPE_USER_TEMPLATE = """Analyze this GitHub profile data:
{profile_data}

Classify the developer into ONE of these archetypes:
1. The Architect (Heavy planning, high system design, low churn)
2. The Rapid Builder (High commit velocity, many PRs, varied libs)
3. The Precision Coder (Few commits, high impact, heavy review cycles)
4. The Librarian (Documentation heavy, issue management focused)
5. The Polymath (High diversity in languages/repos)

Output JSON: {{ "archetype": string, "reasoning": string, "color_hex": string }}

The color_hex should be a vibrant hex color that represents the archetype:
- The Architect: #3b82f6 (blue)
- The Rapid Builder: #6366f1 (indigo)
- The Precision Coder: #8b5cf6 (violet)
- The Librarian: #10b981 (emerald)
- The Polymath: #f59e0b (amber)

Respond with ONLY the JSON object."""


async def analyze_developer_profile(profile_data: str) -> dict[str, Any]:
    """Classify a developer into an archetype using LLM with retry."""
    async def _call():
        llm = get_llm(temperature=0.3)
        parser = JsonOutputParser()

        messages = [
            SystemMessage(content=ARCHETYPE_SYSTEM_PROMPT),
            HumanMessage(content=ARCHETYPE_USER_TEMPLATE.format(profile_data=profile_data)),
        ]

        response = await llm.ainvoke(messages)
        result = parser.parse(response.content if isinstance(response.content, str) else str(response.content))

        # Validate required fields
        if not all(k in result for k in ("archetype", "reasoning", "color_hex")):
            raise ValueError(f"Missing required fields in LLM response. Got keys: {list(result.keys())}")

        return result

    try:
        return await with_retry(_call)
    except Exception as e:
        # Fallback archetype if LLM fails after all retries
        print(f"⚠️ LLM archetype classification failed after {MAX_RETRIES} attempts: {e}")
        return {
            "archetype": "The Rapid Builder",
            "reasoning": "Default classification — AI analysis temporarily unavailable.",
            "color_hex": "#6366f1",
        }


# ==========================================
# Cosmic Description Generation
# ==========================================

COSMIC_SYSTEM_PROMPT = """You are a cosmic poet for GitVerse, a GitHub galaxy visualization platform.
You write poetic, sci-fi descriptions of developer galaxies.
Keep responses to exactly 2 sentences. Tone: Awe-inspiring, Cyberpunk, Cosmic."""

COSMIC_USER_TEMPLATE = """Write a poetic, sci-fi description of this developer's galaxy based on their activity.
Max 2 sentences. Tone: Awe-inspiring, Cyberpunk, Cosmic.
Example: "A blue hyper-giant star system orbiting rapidly around backend planets, surrounded by a dense asteroid belt of rapid-fire issues."

Developer profile data:
{profile_data}

Write ONLY the description text, no quotes or formatting."""


async def generate_cosmic_description(profile_data: str) -> str:
    """Generate a cosmic description for a developer's galaxy with retry."""
    async def _call():
        llm = get_llm(temperature=0.9)

        messages = [
            SystemMessage(content=COSMIC_SYSTEM_PROMPT),
            HumanMessage(content=COSMIC_USER_TEMPLATE.format(profile_data=profile_data)),
        ]

        response = await llm.ainvoke(messages)
        desc = response.content if isinstance(response.content, str) else str(response.content)
        return desc.strip().strip('"')

    try:
        return await with_retry(_call)
    except Exception as e:
        print(f"⚠️ LLM cosmic description failed after {MAX_RETRIES} attempts: {e}")
        return "A mysterious galaxy pulses in the void, its secrets yet to be revealed by the cosmic algorithms."
