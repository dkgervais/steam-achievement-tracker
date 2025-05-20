import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';

const BACKEND = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

// For accessibility, bind modal to root app element
Modal.setAppElement('#root');

function App() {
  const [games, setGames] = useState([]);
  const [gamesLoading, setGamesLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [achLoading, setAchLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchGames() {
      setGamesLoading(true);
      try {
        const res = await fetch(`${BACKEND}/api/games`);
        if (!res.ok) throw new Error(`Games fetch failed: ${res.statusText}`);
        const data = await res.json();
        setGames(data.response?.games || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setGamesLoading(false);
      }
    }
    fetchGames();
  }, []);

  useEffect(() => {
    if (!selectedGame) return;

    async function fetchAchievements() {
      setAchLoading(true);
      try {
        const res = await fetch(`${BACKEND}/api/achievements?appid=${selectedGame.appid}`);
        if (!res.ok) throw new Error(`Achievements fetch failed: ${res.statusText}`);
        const data = await res.json();
        setAchievements(data.playerstats?.achievements || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setAchLoading(false);
      }
    }
    fetchAchievements();
  }, [selectedGame]);

  const getIconUrl = (appid, img_icon_url) =>
    `https://media.steampowered.com/steamcommunity/public/images/apps/${appid}/${img_icon_url}.jpg`;

  // Achievement icon URL helper
  const getAchIconUrl = (appid, ach) => 
    `http://media.steampowered.com/steamcommunity/public/images/apps/${appid}/${ach.apiname.toLowerCase()}.jpg`;


  console.log("games: ", games);
  console.log("achievements: ", achievements);
  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1>Steam Achievement Tracker</h1>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      <section>
        <h2>Your Games</h2>
        {gamesLoading ? (
          <p>Loading games…</p>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
              gap: '1rem',
              marginTop: '1rem',
            }}
          >
            {games.map((game) => (
              <div
                key={game.appid}
                onClick={() => setSelectedGame(game)}
                style={{
                  cursor: 'pointer',
                  padding: '1rem',
                  backgroundColor: '#f9f9f9',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  textAlign: 'center',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <img
                  src={getIconUrl(game.appid, game.img_icon_url)}
                  alt={game.name}
                  style={{ width: '64px', height: '64px', marginBottom: '0.5rem', borderRadius: '8px' }}
                />
                <div
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                  }}
                >
                  {game.name}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modal */}
      <Modal
        isOpen={!!selectedGame}
        onRequestClose={() => setSelectedGame(null)}
        contentLabel="Game Achievements Modal"
        style={{
          overlay: {
            backgroundColor: 'rgba(0,0,0,0.6)',
            zIndex: 1000,
          },
          content: {
            maxWidth: '700px',
            maxHeight: '90vh',
            margin: 'auto',
            padding: '1.5rem',
            borderRadius: '10px',
            overflowY: 'auto',
            fontFamily: 'sans-serif',
          },
        }}
      >
        {selectedGame && (
          <>
            <button
              onClick={() => setSelectedGame(null)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'transparent',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
              aria-label="Close modal"
            >
              &times;
            </button>

            <h2 style={{ marginBottom: '1rem' }}>{selectedGame.name} Achievements</h2>

            {achLoading ? (
              <p>Loading achievements…</p>
            ) : achievements.length === 0 ? (
              <p>No achievements found.</p>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                  gap: '1rem',
                  marginTop: '1rem',
                }}
              >
                {achievements.map((a) => {
                  const unlocked = a.achieved === 1;
                  const iconUrl = getAchIconUrl(selectedGame.appid, a);
                  return (
                    <div
                      key={a.apiname}
                      title={a.description || ''}
                      style={{
                        borderRadius: '8px',
                        padding: '0.5rem',
                        backgroundColor: unlocked ? '#e0f7fa' : '#f0f0f0',
                        color: unlocked ? '#00796b' : '#888',
                        boxShadow: unlocked
                          ? '0 0 10px #26a69a'
                          : 'inset 0 0 5px #ccc',
                        filter: unlocked ? 'none' : 'grayscale(80%)',
                        transition: 'transform 0.2s',
                        cursor: 'default',
                        textAlign: 'center',
                        userSelect: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                      }}
                    >
                      {iconUrl ? (
                        <img
                          src={iconUrl}
                          alt={a.displayName || a.apiname}
                          onError={(e => {e.target.onerror = null; e.target.src = iconUrl})}
                          style={{
                            width: '64px',
                            height: '64px',
                            marginBottom: '0.5rem',
                            borderRadius: '8px',
                            objectFit: 'contain',
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '64px',
                            height: '64px',
                            marginBottom: '0.5rem',
                            borderRadius: '8px',
                            backgroundColor: '#ccc',
                          }}
                        />
                      )}
                      <div
                        style={{
                          fontWeight: '700',
                          marginBottom: '0.3rem',
                          fontSize: '0.9rem',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                        }}
                      >
                        {a.displayName || a.apiname}
                      </div>
                      <div style={{ fontSize: '0.8rem' }}>
                        {unlocked ? 'Unlocked ✅' : 'Locked ❌'}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}

export default App;
