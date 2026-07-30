from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

from scrapernhl import HockeyScraper


# Use Cape Breton time instead of the GitHub server's UTC time
today = datetime.now(ZoneInfo("America/Glace_Bay"))

year = today.year
month = today.month
season_start = year if month >= 9 else year - 1

# QMJHL season ID pattern
base_year = 2025
base_regular_id = 211

years_from_base = season_start - base_year
regular_season_id = base_regular_id + (years_from_base * 3)
playoff_id = regular_season_id + 1

# Repository folders
project_root = Path(__file__).resolve().parents[1]
data_folder = project_root / "public" / "data"
data_folder.mkdir(parents=True, exist_ok=True)

qmjhl = HockeyScraper("qmjhl")


def fetch_and_save(season_id: int, season_type: str) -> bool:
    """Fetch QMJHL statistics and save them as website-ready JSON."""

    try:
        print(
            f"Fetching {season_start}-{season_start + 1} "
            f"{season_type.upper()} statistics..."
        )

        players = qmjhl.player_stats(
            season=season_id,
            position="skaters"
        )

        # Website always reads the stable "current" filename
        current_file = (
            data_folder / f"qmjhl_current_{season_type}.json"
        )

        # Archive copy keeps the season in its filename
        archive_file = (
            data_folder
            / f"qmjhl_{season_type}_{season_start}_{season_start + 1}.json"
        )

        players.to_json(
            current_file,
            orient="records",
            force_ascii=False,
            indent=2
        )

        players.to_json(
            archive_file,
            orient="records",
            force_ascii=False,
            indent=2
        )

        print(f"Exported {len(players)} players")
        print(f"Current file: {current_file}")
        return True

    except Exception as error:
        print(f"Could not fetch {season_type} statistics: {error}")
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
    fetch_and_save(regular_season_id, "regular")
    fetch_and_save(playoff_id, "playoffs")

else:
    print("Off-season — collecting final statistics")
    fetch_and_save(regular_season_id, "regular")
    fetch_and_save(playoff_id, "playoffs")

print("-" * 50)
print(f"Files saved to: {data_folder}")