"""
Analyze Galaxy endpoint — AI-powered developer archetype classification
and cosmic description generation using LangChain + OpenRouter.
"""

import json
import math
import os
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.llm import analyze_developer_profile, generate_cosmic_description

router = APIRouter()


# ==========================================
# Request / Response Models
# ==========================================

class LanguageEntry(BaseModel):
    name: str
    percentage: float


class RepositoryData(BaseModel):
    name: str
    description: Optional[str] = None
    stargazer_count: int = Field(alias="stargazerCount", default=0)
    fork_count: int = Field(alias="forkCount", default=0)
    disk_usage: int = Field(alias="diskUsage", default=0)
    primary_language: Optional[str] = Field(alias="primaryLanguage", default=None)
    languages: list[LanguageEntry] = []
    recent_commits: int = Field(alias="recentCommits", default=0)
    open_issues: int = Field(alias="openIssues", default=0)
    closed_issues: int = Field(alias="closedIssues", default=0)
    open_prs: int = Field(alias="openPRs", default=0)
    closed_prs: int = Field(alias="closedPRs", default=0)
    is_archived: bool = Field(alias="isArchived", default=False)
    is_fork: bool = Field(alias="isFork", default=False)

    model_config = {"populate_by_name": True}


class UserData(BaseModel):
    login: str
    name: Optional[str] = None
    bio: Optional[str] = None
    followers: int = 0
    following: int = 0
    public_repos: int = Field(alias="publicRepos", default=0)
    total_commit_contributions: int = Field(alias="totalCommitContributions", default=0)
    total_pr_contributions: int = Field(alias="totalPRContributions", default=0)
    total_issue_contributions: int = Field(alias="totalIssueContributions", default=0)
    contribution_streak: int = Field(alias="contributionStreak", default=0)

    model_config = {"populate_by_name": True}


class AnalyzeRequest(BaseModel):
    user: UserData
    repositories: list[RepositoryData]


class SkillScores(BaseModel):
    velocity: float
    depth: float
    maintenance: float
    diversity: float


class AnalyzeResponse(BaseModel):
    archetype: str
    reasoning: str
    color_hex: str = Field(alias="colorHex")
    cosmic_description: str = Field(alias="cosmicDescription")
    skill_scores: SkillScores = Field(alias="skillScores")

    model_config = {"populate_by_name": True}


# ==========================================
# Skill Scoring Algorithm
# ==========================================

def compute_skill_scores(user: UserData, repos: list[RepositoryData]) -> SkillScores:
    """Compute skill scores based on the spec's algorithm."""

    # Velocity: Commits per week (Normalized 0-100)
    # Assume ~52 weeks of data; normalize against a "high" of 50 commits/week
    total_commits = user.total_commit_contributions
    commits_per_week = total_commits / 52.0
    velocity = min(100.0, (commits_per_week / 50.0) * 100.0)

    # Depth: Average code size per repo as proxy for lines changed
    active_repos = [r for r in repos if not r.is_archived and not r.is_fork]
    if active_repos:
        avg_disk = sum(r.disk_usage for r in active_repos) / len(active_repos)
        depth = min(100.0, (avg_disk / 100000.0) * 100.0)
    else:
        depth = 0.0

    # Maintenance: Issue closure rate + PR merge rate
    total_open = sum(r.open_issues for r in repos)
    total_closed = sum(r.closed_issues for r in repos)
    total_open_prs = sum(r.open_prs for r in repos)
    total_closed_prs = sum(r.closed_prs for r in repos)

    issue_total = total_open + total_closed
    pr_total = total_open_prs + total_closed_prs

    issue_closure_rate = (total_closed / issue_total * 100) if issue_total > 0 else 50
    pr_merge_rate = (total_closed_prs / pr_total * 100) if pr_total > 0 else 50

    maintenance = (issue_closure_rate + pr_merge_rate) / 2.0

    # Diversity: Shannon Entropy of language usage
    lang_counts: dict[str, float] = {}
    for repo in active_repos:
        for lang in repo.languages:
            lang_counts[lang.name] = lang_counts.get(lang.name, 0) + lang.percentage

    total_lang = sum(lang_counts.values())
    if total_lang > 0 and len(lang_counts) > 1:
        probabilities = [v / total_lang for v in lang_counts.values()]
        entropy = -sum(p * math.log2(p) for p in probabilities if p > 0)
        # Normalize: max entropy for N languages is log2(N)
        max_entropy = math.log2(len(lang_counts))
        diversity = min(100.0, (entropy / max(max_entropy, 1)) * 100.0)
    else:
        diversity = 0.0

    return SkillScores(
        velocity=round(velocity, 1),
        depth=round(depth, 1),
        maintenance=round(maintenance, 1),
        diversity=round(diversity, 1),
    )


# ==========================================
# Route Handler
# ==========================================

@router.post("/analyze-galaxy", response_model=AnalyzeResponse)
async def analyze_galaxy(request: AnalyzeRequest):
    """Analyze a GitHub profile and return AI-generated archetype + cosmic description."""

    try:
        # Compute skill scores
        scores = compute_skill_scores(request.user, request.repositories)

        # Build profile summary for LLM
        profile_data = {
            "user": request.user.model_dump(by_alias=True),
            "repositories_summary": {
                "count": len(request.repositories),
                "total_stars": sum(r.stargazer_count for r in request.repositories),
                "total_forks": sum(r.fork_count for r in request.repositories),
                "languages": list(
                    set(
                        r.primary_language
                        for r in request.repositories
                        if r.primary_language
                    )
                ),
                "active_repos": len(
                    [r for r in request.repositories if not r.is_archived and not r.is_fork]
                ),
            },
            "skill_scores": scores.model_dump(),
        }

        # Call LLM for archetype
        archetype_result = await analyze_developer_profile(json.dumps(profile_data, indent=2))

        # Call LLM for cosmic description
        cosmic_desc = await generate_cosmic_description(json.dumps(profile_data, indent=2))

        return AnalyzeResponse(
            archetype=archetype_result["archetype"],
            reasoning=archetype_result["reasoning"],
            colorHex=archetype_result["color_hex"],
            cosmicDescription=cosmic_desc,
            skillScores=scores,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
