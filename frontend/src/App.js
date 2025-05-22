import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import GameGrid from './GameGrid';
import AchievementsModal from './AchievementsModal';
import CollectionsTab from './CollectionsTab';

const BACKEND = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

Modal.setAppElement('#root');

function App() {
  const [games, setGames] = useState([]);
  const [gamesLoading, setGamesLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState(null);
  const [achievementsMap, setAchievementsMap] = useState({}); // { [appid]: [achievements] }
  const [achLoading, setAchLoading] = useState(false);
  const [error, setError] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [gamesSearch, setGamesSearch] = useState("");

  // Settings state
  const [apiKey, setApiKey] = useState(localStorage.getItem("steamApiKey") || "");
  const [steamId, setSteamId] = useState(localStorage.getItem("steamId") || "");

  // New state for tabs and collections
  const [activeTab, setActiveTab] = useState("games"); // "games" or "collections"
  const [collections, setCollections] = useState(() => {
    // Persist collections in localStorage
    const saved = localStorage.getItem("achievementCollections");
    return saved ? JSON.parse(saved) : [];
  });

  // Save settings to localStorage
  const handleSaveSettings = (newApiKey, newSteamId) => {
    setApiKey(newApiKey);
    setSteamId(newSteamId);
    localStorage.setItem("steamApiKey", newApiKey);
    localStorage.setItem("steamId", newSteamId);
  };

  // Add a function to clear cache and refetch
  const handleRefresh = () => {
    localStorage.removeItem("cachedGames");
    localStorage.removeItem("cachedAchievementsMap");
    localStorage.removeItem("cacheTimestamp");
    setGamesLoading(true);
    // Force refetch by updating a dummy state or calling fetchGamesAndAchievements directly
    fetchGamesAndAchievements();
  };

  // Move fetchGamesAndAchievements outside useEffect so it can be called from handleRefresh
  async function fetchGamesAndAchievements() {
    setGamesLoading(true);
    try {
      const res = await fetch(`${BACKEND}/api/games`);
      if (!res.ok) throw new Error(`Games fetch failed: ${res.statusText}`);
      const data = await res.json();
      const gamesList = data.response?.games || [];

      // Fetch achievement schemas for all games in parallel using your backend proxy
      const schemaResults = await Promise.all(
        gamesList.map(async (game) => {
          try {
            // Fetch schema (achievement definitions)
            const schemaRes = await fetch(
              `${BACKEND}/api/achievement-schema?appid=${game.appid}&key=${apiKey}`
            );
            if (!schemaRes.ok) return { appid: game.appid, achievements: [] };
            const schemaData = await schemaRes.json();
            const schemaAchievements = schemaData.game?.availableGameStats?.achievements || [];

            // Fetch player achievements (progress)
            const playerRes = await fetch(
              `${BACKEND}/api/achievements?appid=${game.appid}`
            );
            let playerAchievements = [];
            if (playerRes.ok) {
              const playerData = await playerRes.json();
              playerAchievements = playerData.playerstats?.achievements || [];
            }

            // Map player's achieved status by apiname
            const achievedMap = {};
            playerAchievements.forEach(a => {
              achievedMap[a.apiname] = a.achieved;
            });

            // Merge achieved status into schema achievements
            return {
              appid: game.appid,
              achievements: schemaAchievements.map(a => ({
                apiname: a.name,
                displayName: a.displayName,
                description: a.description,
                icon: a.icon,
                icongray: a.icongray,
                hidden: a.hidden,
                achieved: achievedMap[a.name] ?? 0, // 1 if achieved, 0 if not, or 0 if missing
              })),
            };
          } catch {
            return { appid: game.appid, achievements: [] };
          }
        })
      );

      // Build a map: { appid: [achievements] }
      const achMap = {};
      schemaResults.forEach(({ appid, achievements }) => {
        achMap[appid] = achievements;
      });
      setAchievementsMap(achMap);

      // Filter games to only those with at least one achievement
      const gamesWithAchievements = gamesList.filter(
        (game) => (achMap[game.appid] && achMap[game.appid].length > 0)
      );
      const gamesWithAchievementsSorted = gamesWithAchievements.sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        return aName.localeCompare(bName);
      });
      setGames(gamesWithAchievementsSorted);
      localStorage.setItem("cachedGames", JSON.stringify(gamesWithAchievementsSorted));
      localStorage.setItem("cachedAchievementsMap", JSON.stringify(achMap));
      // Update cache timestamp
      localStorage.setItem("cacheTimestamp", Date.now());
    } catch (err) {
      setError(err.message);
    } finally {
      setGamesLoading(false);
    }
  }

  // Fetch games and all achievements on mount
  useEffect(() => {
    // Try to load from cache first
    const cachedGames = localStorage.getItem("cachedGames");
    const cachedAchievementsMap = localStorage.getItem("cachedAchievementsMap");
    const cacheTimestamp = localStorage.getItem("cacheTimestamp");
    const isFresh = cacheTimestamp && (Date.now() - cacheTimestamp < 1000 * 60 * 10); // 10 minutes
    if (cachedGames && cachedAchievementsMap && isFresh) {
      setGames(JSON.parse(cachedGames));
      setAchievementsMap(JSON.parse(cachedAchievementsMap));
      setGamesLoading(false);
    } else if (apiKey) {
      fetchGamesAndAchievements();
    }
  }, [apiKey]);

  // When a game is selected, set its achievements from the map
  useEffect(() => {
    if (!selectedGame) return;
    setAchLoading(true);
    setTimeout(() => {
      setAchLoading(false);
    }, 300); // Simulate loading
  }, [selectedGame]);

  const getIconUrl = (appid, img_icon_url) =>
    `https://media.steampowered.com/steamcommunity/public/images/apps/${appid}/${img_icon_url}.jpg`;

  const getAchIconUrl = (appid, ach) => {
    // Use the icon from the schema (already in achievementsMap)
    return ach.achieved === 1 ? ach.icon : ach.icongray;
  };

  // Filter games by search
  const filteredGames = games.filter(game =>
    game.name.toLowerCase().includes(gamesSearch.toLowerCase())
  );

  const handleAddToCollection = (achievement, appid, collectionName) => {
    const achWithAppid = { ...achievement, appid };
    if (!collectionName) return;
    setCollections(prev => {
      const idx = prev.findIndex(c => c.name === collectionName);
      let updated;
      if (idx === -1) {
        updated = [...prev, { name: collectionName, achievements: [achWithAppid] }];
      } else {
        // Avoid duplicates
        const exists = prev[idx].achievements.some(a => a.apiname === achievement.apiname && a.appid === appid);
        if (exists) return prev;
        updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          achievements: [...updated[idx].achievements, achWithAppid]
        };
      }
      localStorage.setItem("achievementCollections", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <div
      style={{
        fontFamily: 'sans-serif',
        padding: '2rem',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e0e7ef 0%, #f1f5f9 100%)',
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <h1
          style={{
            flex: 1,
            textAlign: "center",
            fontFamily: "'Cinzel', serif",
            fontSize: "2.8rem",
            color: "#2563eb",
            letterSpacing: "2px",
            fontWeight: 700,
            margin: 0,
          }}
        >
          Steam Achievement Tracker
        </h1>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            onClick={handleRefresh}
            style={{
              background: "#22c55e",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              padding: "0.7rem 1.4rem",
              fontSize: "1.1rem",
              fontWeight: 600,
              boxShadow: "0 2px 8px rgba(34,197,94,0.12)",
              cursor: "pointer",
            }}
            title="Refresh games and achievements"
          >
            &#x21bb; Refresh
          </button>
        </div>
      </div>
      {error && <p style={{ color: 'red', textAlign: 'center' }}>Error: {error}</p>}

      <div style={{ display: "flex", justifyContent: "center", marginBottom: "2rem" }}>
        <button
          onClick={() => setActiveTab("games")}
          style={{
            padding: "0.7rem 2rem",
            borderRadius: "6px 0 0 6px",
            border: "1px solid #3b82f6",
            background: activeTab === "games" ? "#3b82f6" : "#e0e7ef",
            color: activeTab === "games" ? "#fff" : "#2563eb",
            fontWeight: 600,
            cursor: "pointer",
            outline: "none"
          }}
        >
          Games
        </button>
        <button
          onClick={() => setActiveTab("collections")}
          style={{
            padding: "0.7rem 2rem",
            borderRadius: "0 6px 6px 0",
            border: "1px solid #3b82f6",
            borderLeft: "none",
            background: activeTab === "collections" ? "#3b82f6" : "#e0e7ef",
            color: activeTab === "collections" ? "#fff" : "#2563eb",
            fontWeight: 600,
            cursor: "pointer",
            outline: "none"
          }}
        >
          Collections
        </button>
      </div>

      <section>
        {activeTab === "games" && (
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
            <input
              type="text"
              placeholder="Search games..."
              value={gamesSearch}
              onChange={e => setGamesSearch(e.target.value)}
              style={{
                width: "100%",
                maxWidth: "400px",
                padding: "0.6rem 1rem",
                borderRadius: "6px",
                border: "1px solid #3b82f6",
                fontSize: "1rem",
                outline: "none",
                boxShadow: "0 1px 4px rgba(59,130,246,0.06)",
              }}
            />
          </div>
        )}
        {gamesLoading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80px" }}>
            <div
              style={{
                border: "4px solid #dbeafe",
                borderTop: "4px solid #2563eb",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                animation: "spin 1s linear infinite",
              }}
            />
            <style>
              {`
                @keyframes spin {
                  0% { transform: rotate(0deg);}
                  100% { transform: rotate(360deg);}
                }
              `}
            </style>
          </div>
        ) : (
          <>
            {activeTab === "games" && (
              <GameGrid games={filteredGames} onSelect={setSelectedGame} getIconUrl={getIconUrl} />
            )}

            {activeTab === "collections" && (
              <CollectionsTab
                collections={collections}
                setCollections={setCollections}
                achievementsMap={achievementsMap}
                games={games}
              />
            )}
          </>
        )}
      </section>

      <AchievementsModal
        isOpen={!!selectedGame}
        onRequestClose={() => setSelectedGame(null)}
        selectedGame={selectedGame}
        achievements={
          selectedGame
            ? [...(achievementsMap[selectedGame.appid] || [])].sort((a, b) =>
                (a.displayName || a.apiname || "").localeCompare(b.displayName || b.apiname || "")
              )
            : []
        }
        achLoading={achLoading}
        getAchIconUrl={getAchIconUrl}
        collections={collections}
        onAddToCollection={handleAddToCollection}
      />
    </div>
  );
}

export default App;