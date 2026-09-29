"""Fetch the latest QMJHL skater stats and save them as the CSV the website reads.

The site (src/data/loadPlayerStats.js via src/pages/TeamLineupPage.jsx) loads
exactly one data file: public/data/qmjhl_player_stats.csv. This script
replaces the old manual Excel export — it pulls the same columns straight
from the HockeyTech feed (via the scrapernhl package) and overwrites that
CSV, so the site picks up fresh numbers with zero frontend changes.

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

# The one file the website reads — keep this name stable.
csv_file = data_folder / "qmjhl_player_stats.csv"

qmjhl = HockeyScraper("qmjhl")


def fetch_and_save(season_id: int, season_type: str) -> bool:
    """Fetch QMJHL skater statistics and overwrite the website's CSV."""

    try:
        print(
            f"Fetching {season_start}-{season_start + 1} "
            f"{season_type.upper()} skater statistics..."
        )

        players = qmjhl.player_stats(
            season=season_id,
            position="skaters",
        )

        if players is None or len(players) == 0:
            print("Feed returned no players — leaving the existing CSV untouched.")
            return False

        players.to_csv(csv_file, index=False, encoding="utf-8")

        print(f"Wrote {len(players)} players to {csv_file}")
        return True

    except Exception as error:
        print(f"Could not fetch {season_type} statistics: {error}")
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
    fetch_and_save(regular_season_id, "regular")

elif 4 <= month <= 6:
    print("Playoffs")
    fetch_and_save(playoff_id, "playoffs")

else:
    print("Off-season — collecting final statistics")
    fetch_and_save(regular_season_id, "regular")

print("-" * 50)
