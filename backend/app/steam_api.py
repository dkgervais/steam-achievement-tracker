import requests
import os

STEAM_API_KEY = os.getenv("STEAM_API_KEY")

def get_achievements(steam_id, app_id):
    url = f"https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/"
    params = {
        "key": STEAM_API_KEY,
        "steamid": steam_id,
        "appid": app_id,
    }
    response = requests.get(url, params=params)
    return response.json()
