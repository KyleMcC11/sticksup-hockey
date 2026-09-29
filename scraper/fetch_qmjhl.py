"""Fetch the latest QMJHL stats and save the CSVs the website reads.

The site loads three data files:
  - public/data/qmjhl_player_stats.csv  (skaters, via src/data/loadPlayerStats.js)
  - public/data/qmjhl_goalie_stats.csv  (goalies, via src/data/loadGoalieStats.js)
  - public/data/qmjhl_standings.csv     (standings, via src/data/loadStandings.js)

This script replaces the old manual Excel exports — it pulls the same columns
straight from the HockeyTech feed (via the scrapernhl package) and overwrites
those CSVs, so the site picks up fresh numbers with zero manual work.

Run by .github/workflows/scrape.yml every morning; also runnable by hand:

    pip install -r requirements.txt
    python scraper/fetch_qmjhl.py
"""

from datetime import datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

import pandas as pd
from scrapernhl import HockeyScraper


# Use Cape Breton time instead of the GitHub server's UTC time
today = datetime.now(ZoneInfo("America/Glace_Bay"))

year = today.year
month = today.month
season_start = year if month >= 9 else year - 1

# QMJHL season ID pattern (HockeyTech): 211 = 2025-26 regular, +3 each year
base_year = 2025
base_regular_id = 211

years_from_base = season_start - base_year
regular_season_id = base_regular_id + (years_from_base * 3)
playoff_id = regular_season_id + 1

# Repository folders
project_root = Path(__file__).resolve().parents[1]
data_folder = project_root / "public" / "data"
data_folder.mkdir(parents=True, exist_ok=True)

# The files the website reads — keep these names stable.
SKATERS_CSV = data_folder / "qmjhl_player_stats.csv"
GOALIES_CSV = data_folder / "qmjhl_goalie_stats.csv"
STANDINGS_CSV = data_folder / "qmjhl_standings.csv"

qmjhl = HockeyScraper("qmjhl")


def fetch_and_save(
    season_id: int,
    season_type: str,
    position: str,
    csv_file: Path,
) -> bool:
    """Fetch QMJHL statistics for one position group and overwrite its CSV."""

    try:
        print(
            f"Fetching {season_start}-{season_start + 1} "
            f"{season_type.upper()} {position} statistics..."
        )

        players = qmjhl.player_stats(
            season=season_id,
            position=position,
        )

        if players is None or len(players) == 0:
            print(f"Feed returned no {position} — leaving {csv_file.name} untouched.")
            return False

        players.to_csv(csv_file, index=False, encoding="utf-8")

        print(f"Wrote {len(players)} {position} to {csv_file}")
        return True

    except Exception as error:
        print(f"Could not fetch {season_type} {position} statistics: {error}")
        print(f"Leaving {csv_file.name} untouched.")
        return False


def fetch_season(season_id: int, season_type: str) -> None:
    """Fetch skaters and goalies for one season."""
    fetch_and_save(season_id, season_type, "skaters", SKATERS_CSV)
    fetch_and_save(season_id, season_type, "goalies", GOALIES_CSV)


def fetch_standings() -> bool:
    """Fetch the regular-season standings and overwrite the website's CSV."""

    try:
        print(
            f"Fetching {season_start}-{season_start + 1} standings..."
        )

        standings = qmjhl.standings(season=regular_season_id)

        if standings is None or len(standings) == 0:
            print("Feed returned no standings — leaving the CSV untouched.")
            return False

        standings.to_csv(STANDINGS_CSV, index=False, encoding="utf-8")

        print(f"Wrote {len(standings)} teams to {STANDINGS_CSV}")
        return True

    except Exception as error:
        print(f"Could not fetch standings: {error}")
        print("Leaving the existing CSV untouched.")
        return False


# ---------------------------------------------------------------------------
# Schedule, rosters and game details (new for the Scores section)
# ---------------------------------------------------------------------------

SCHEDULE_CSV = data_folder / "qmjhl_schedule.csv"
ROSTERS_CSV = data_folder / "qmjhl_rosters.csv"
GAME_EVENTS_CSV = data_folder / "qmjhl_game_events.csv"

# Only fetch play-by-play for finals inside this rolling window — keeps the
# daily job fast and the CSV small.
GAME_EVENT_WINDOW_DAYS = 14


def fetch_schedule(season_id: int):
    """Fetch the full season schedule/scores. Returns the DataFrame or None."""

    try:
        print(f"Fetching {season_start}-{season_start + 1} schedule...")

        schedule = qmjhl.schedule(season=season_id)

        if schedule is None or len(schedule) == 0:
            print("Feed returned no schedule — leaving the CSV untouched.")
            return None

        schedule.to_csv(SCHEDULE_CSV, index=False, encoding="utf-8")

        print(f"Wrote {len(schedule)} games to {SCHEDULE_CSV.name}")
        return schedule

    except Exception as error:
        print(f"Could not fetch schedule: {error}")
        print("Leaving the existing CSV untouched.")
        return None


def fetch_rosters(season_id: int) -> bool:
    """Fetch every team's roster (bios: age, height, weight, birthplace...)."""

    try:
        teams = qmjhl.get_teams()
        codes = [team.get("team_code") for team in teams if team.get("team_code")]

        print(f"Fetching rosters for {len(codes)} teams...")

        frames = []

        for code in codes:
            try:
                roster = qmjhl.roster(season=season_id, team=code)

                if roster is not None and len(roster) > 0:
                    frames.append(roster)
            except Exception as error:
                print(f"  roster fetch failed for {code}: {error}")

        if not frames:
            print("No rosters fetched — leaving the CSV untouched.")
            return False

        all_rosters = pd.concat(frames, ignore_index=True)
        all_rosters.to_csv(ROSTERS_CSV, index=False, encoding="utf-8")

        print(f"Wrote {len(all_rosters)} rostered players to {ROSTERS_CSV.name}")
        return True

    except Exception as error:
        print(f"Could not fetch rosters: {error}")
        print("Leaving the existing CSV untouched.")
        return False


def _name_of(value):
    """Pull a display name out of a feed value (string or nested dict)."""

    if value is None:
        return ""

    if isinstance(value, dict):
        first = str(value.get("first_name") or "").strip()
        last = str(value.get("last_name") or "").strip()
        full = f"{first} {last}".strip()
        return full or str(value.get("name") or "")

    text = str(value).strip()
    return "" if text.lower() == "nan" else text


def _to_int(value, default=0):
    try:
        return int(float(value))
    except (TypeError, ValueError):
        return default


def _to_bool(value) -> bool:
    """The feed uses '1'/'0' strings (or NaN) for flags — bool() alone lies."""

    if value is None:
        return False

    try:
        if pd.isna(value):
            return False
    except (TypeError, ValueError):
        pass

    return str(value).strip().lower() in ("1", "true", "yes", "t", "y")


def _penalty_description(event) -> str:
    """Prefer the human description ('Roughing') over the numeric class code."""

    description = _name_of(event.get("lang_penalty_description"))

    if description and not description.isdigit():
        return description

    return _name_of(event.get("offence"))


def fetch_game_events(schedule) -> bool:
    """Fetch scoring-summary + penalty events for recent finals.

    Incremental: games already stored in the CSV are skipped, so the daily
    job only fetches new finals.
    """

    try:
        if schedule is None or len(schedule) == 0:
            print("No schedule available — skipping game events.")
            return False

        known_ids = set()

        if GAME_EVENTS_CSV.exists():
            try:
                existing = pd.read_csv(GAME_EVENTS_CSV, dtype={"game_id": str})
                known_ids = set(existing["game_id"].astype(str).tolist())
            except Exception as error:
                print(f"Could not read existing game events: {error}")

        cutoff = today.replace(tzinfo=None) - timedelta(days=GAME_EVENT_WINDOW_DAYS)
        games = schedule.copy()
        games["game_date"] = pd.to_datetime(games["date"], errors="coerce")

        finals = games[
            (games["gameStatus"] == "Final")
            & (games["game_date"] >= cutoff)
            & (~games["gameId"].astype(str).isin(known_ids))
        ]

        print(
            f"Fetching play-by-play for {len(finals)} new finals "
            f"(last {GAME_EVENT_WINDOW_DAYS} days)..."
        )

        new_rows = []

        for _, game in finals.iterrows():
            game_id = str(game["gameId"])

            try:
                pbp = qmjhl.play_by_play(game_id)
            except Exception as error:
                print(f"  PBP fetch failed for game {game_id}: {error}")
                continue

            if pbp is None or len(pbp) == 0:
                continue

            game_date = game["game_date"].strftime("%Y-%m-%d")

            for _, event in pbp.iterrows():
                kind = str(event.get("event") or "").lower()

                if kind not in ("goal", "penalty"):
                    continue

                row = {
                    "game_id": game_id,
                    "game_date": game_date,
                    "home_code": game.get("homeCode", ""),
                    "away_code": game.get("awayCode", ""),
                    "period": _to_int(event.get("period_id") or event.get("period")),
                    # Goals carry elapsed time in "time"; penalties use
                    # "time_off_formatted" instead. (_name_of drops NaN.)
                    "time": _name_of(event.get("time"))
                    or _name_of(event.get("time_off_formatted")),
                    "event": kind,
                    "team_code": event.get("team_code") or "",
                    "scorer": _name_of(event.get("goal_scorer")),
                    "assist1": _name_of(event.get("assist1_player")),
                    "assist2": _name_of(event.get("assist2_player")),
                    "is_pp": _to_bool(event.get("power_play")),
                    "is_sh": _to_bool(event.get("short_handed")),
                    "is_en": _to_bool(event.get("empty_net")),
                    "is_gw": _to_bool(event.get("game_winning")),
                    "score_home": _to_int(event.get("score_home")),
                    "score_away": _to_int(event.get("score_away")),
                    "penalized_player": _name_of(event.get("player_penalized_info")),
                    "offence": _penalty_description(event),
                    "minutes": _to_int(event.get("minutes")),
                }

                new_rows.append(row)

            print(f"  game {game_id}: {len(new_rows)} events so far")

        if not new_rows:
            print("No new game events found.")
            return True

        fresh = pd.DataFrame(new_rows)

        if GAME_EVENTS_CSV.exists() and known_ids:
            combined = pd.concat(
                [pd.read_csv(GAME_EVENTS_CSV, dtype={"game_id": str}), fresh],
                ignore_index=True,
            )
            # Keep only the rolling window so the file never grows unbounded.
            combined["game_date"] = pd.to_datetime(
                combined["game_date"], errors="coerce"
            )
            combined = combined[combined["game_date"] >= cutoff]
            combined["game_date"] = combined["game_date"].dt.strftime("%Y-%m-%d")
            combined.to_csv(GAME_EVENTS_CSV, index=False, encoding="utf-8")
            print(
                f"Wrote {len(combined)} game events "
                f"({len(fresh)} new) to {GAME_EVENTS_CSV.name}"
            )
        else:
            fresh.to_csv(GAME_EVENTS_CSV, index=False, encoding="utf-8")
            print(f"Wrote {len(fresh)} game events to {GAME_EVENTS_CSV.name}")

        return True

    except Exception as error:
        print(f"Could not fetch game events: {error}")
        print("Leaving the existing CSV untouched.")
        return False


def fetch_extras(season_id: int) -> None:
    """Schedule, rosters and game details for the Scores section."""

    schedule = fetch_schedule(season_id)
    fetch_rosters(season_id)
    fetch_game_events(schedule)


print(f"Today: {today.strftime('%B %d, %Y')}")
print(f"Season: {season_start}-{season_start + 1}")
print(f"Regular ID: {regular_season_id}")
print(f"Playoff ID: {playoff_id}")
print("-" * 50)

if month == 8 or (month == 9 and today.day <= 15):
    print("Preseason period — no data collected.")

elif (
    (month == 9 and today.day > 15)
    or 10 <= month <= 12
    or 1 <= month <= 3
):
    print("Regular season")
    fetch_season(regular_season_id, "regular")
    fetch_standings()
    fetch_extras(regular_season_id)

elif 4 <= month <= 6:
    print("Playoffs")
    fetch_season(playoff_id, "playoffs")
    fetch_standings()
    fetch_extras(playoff_id)

else:
    print("Off-season — collecting final statistics")
    fetch_season(regular_season_id, "regular")
    fetch_standings()
    fetch_extras(regular_season_id)

print("-" * 50)
