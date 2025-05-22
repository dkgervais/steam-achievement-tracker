from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import os
import requests

app = FastAPI()

# Allow frontend to make requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or restrict to ["http://localhost:3000"] in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

STEAM_API_KEY = os.getenv("STEAM_API_KEY")
STEAM_ID = os.getenv("STEAM_ID")  # SteamID64 of the user

@app.get("/api/games")
def get_owned_games():
    if not STEAM_API_KEY or not STEAM_ID:
        raise HTTPException(status_code=500, detail="API key or Steam ID not configured.")

    url = "https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/"
    params = {
        "key": STEAM_API_KEY,
        "steamid": STEAM_ID,
        "include_appinfo": True,
    }
    response = requests.get(url, params=params)
    return response.json()

@app.get("/api/achievements")
def get_achievements(appid: int):
    if not STEAM_API_KEY or not STEAM_ID:
        raise HTTPException(status_code=500, detail="API key or Steam ID not configured.")

    url = "https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/"
    params = {
        "key": STEAM_API_KEY,
        "steamid": STEAM_ID,
        "appid": appid,
    }
    response = requests.get(url, params=params)
    return response.json()

@app.get("/api/achievement-schema")
def get_achievement_schema(appid: int, key: str = Query(None)):
    """
    Proxy endpoint to fetch the achievement schema for a game from Steam.
    If 'key' is not provided, uses the backend's STEAM_API_KEY.
    """
    steam_key = key or STEAM_API_KEY
    if not steam_key:
        raise HTTPException(status_code=500, detail="API key not configured.")

    url = "https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/"
    params = {
        "key": steam_key,
        "appid": appid,
    }
    response = requests.get(url, params=params)
    if not response.ok:
        raise HTTPException(status_code=502, detail="Failed to fetch schema from Steam.")
    return response.json()

@app.get("/api/fetch-schema")
async def fetch_schema(appid: int, api_key: str):
    """
    Fetch the achievement schema for a game using the provided API key.
    """
    url = "https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/"
    params = {
        "key": api_key,
        "appid": appid,
    }
    response = requests.get(url, params=params)
    if not response.ok:
        raise HTTPException(status_code=502, detail="Failed to fetch schema from Steam.")
    return response.json()
