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

from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

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

elif 4 <= month <= 6:
    print("Playoffs")
    fetch_season(playoff_id, "playoffs")
    fetch_standings()

else:
    print("Off-season — collecting final statistics")
    fetch_season(regular_season_id, "regular")
    fetch_standings()

print("-" * 50)
