"""Tests for health endpoint and skill scoring algorithm."""

import math
from app.routes.analyze import compute_skill_scores, UserData, RepositoryData, LanguageEntry


def _make_user(**kwargs) -> UserData:
    defaults = {
        "login": "test-user",
        "name": "Test",
        "bio": None,
        "followers": 10,
        "following": 5,
        "publicRepos": 3,
        "totalCommitContributions": 500,
        "totalPRContributions": 30,
        "totalIssueContributions": 15,
        "contributionStreak": 10,
    }
    defaults.update(kwargs)
    return UserData(**defaults)


def _make_repo(**kwargs) -> RepositoryData:
    defaults = {
        "name": "test-repo",
        "description": "Test",
        "stargazerCount": 10,
        "forkCount": 2,
        "diskUsage": 20000,
        "primaryLanguage": "TypeScript",
        "languages": [LanguageEntry(name="TypeScript", percentage=100)],
        "recentCommits": 100,
        "openIssues": 5,
        "closedIssues": 20,
        "openPRs": 2,
        "closedPRs": 15,
        "isArchived": False,
        "isFork": False,
        "updatedAt": "2026-01-01",
    }
    defaults.update(kwargs)
    return RepositoryData(**defaults)


class TestSkillScoring:
    def test_velocity_score_high_commits(self):
        user = _make_user(totalCommitContributions=2600)  # 50/week
        repos = [_make_repo()]
        scores = compute_skill_scores(user, repos)
        assert scores.velocity == 100.0

    def test_velocity_score_low_commits(self):
        user = _make_user(totalCommitContributions=52)  # 1/week
        repos = [_make_repo()]
        scores = compute_skill_scores(user, repos)
        assert 0 < scores.velocity < 10

    def test_depth_score_large_repos(self):
        user = _make_user()
        repos = [_make_repo(diskUsage=100000)]
        scores = compute_skill_scores(user, repos)
        assert scores.depth == 100.0

    def test_maintenance_perfect_closure(self):
        user = _make_user()
        repos = [_make_repo(openIssues=0, closedIssues=100, openPRs=0, closedPRs=50)]
        scores = compute_skill_scores(user, repos)
        assert scores.maintenance == 100.0

    def test_diversity_single_language(self):
        user = _make_user()
        repos = [_make_repo(languages=[LanguageEntry(name="TypeScript", percentage=100)])]
        scores = compute_skill_scores(user, repos)
        assert scores.diversity == 0.0

    def test_diversity_multiple_languages(self):
        user = _make_user()
        repos = [
            _make_repo(
                languages=[
                    LanguageEntry(name="TypeScript", percentage=40),
                    LanguageEntry(name="Python", percentage=30),
                    LanguageEntry(name="Rust", percentage=30),
                ]
            )
        ]
        scores = compute_skill_scores(user, repos)
        assert scores.diversity > 50

    def test_returns_all_score_fields(self):
        user = _make_user()
        repos = [_make_repo()]
        scores = compute_skill_scores(user, repos)
        assert hasattr(scores, "velocity")
        assert hasattr(scores, "depth")
        assert hasattr(scores, "maintenance")
        assert hasattr(scores, "diversity")
        assert all(0 <= getattr(scores, f) <= 100 for f in ["velocity", "depth", "maintenance", "diversity"])
