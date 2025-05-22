import React from "react";
import Modal from "react-modal";

const placeholderIcon = "https://via.placeholder.com/64?text=No+Icon";

export default function AchievementsModal({
  isOpen,
  onRequestClose,
  selectedGame,
  achievements,
  achLoading,
  getAchIconUrl,
  onAddToCollection,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Game Achievements Modal"
      style={{
        overlay: {
          backgroundColor: "rgba(30, 41, 59, 0.7)", // blue-grey overlay
          zIndex: 1000,
        },
        content: {
          maxWidth: "700px",
          maxHeight: "90vh",
          margin: "auto",
          padding: "1.5rem",
          borderRadius: "10px",
          overflowY: "auto",
          fontFamily: "sans-serif",
          background: "#f1f5f9", // light blue-grey
          border: "1px solid #3b82f6", // blue border
        },
      }}
    >
      {selectedGame && (
        <>
          <button
            onClick={onRequestClose}
            style={{
              position: "sticky",
              top: "15px",
              right: "15px",
              background: "#3b82f6",
              color: "#fff",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              fontWeight: "bold",
              borderRadius: "50%",
              width: "36px",
              height: "36px",
              boxShadow: "0 2px 8px rgba(59,130,246,0.2)",
              zIndex: 10,
            }}
            aria-label="Close modal"
          >
            &times;
          </button>

          {/* Google Fonts import for Cinzel */}
          <style>
            {`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&display=swap');`}
          </style>
          <h2
            style={{
              marginBottom: "1rem",
              color: "#2563eb",
              textAlign: "center",
              fontFamily: "'Cinzel', serif",
              fontSize: "2rem",
              letterSpacing: "1px",
              fontWeight: 700,
            }}
          >
            {selectedGame.name} Achievements
          </h2>

          {achLoading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "80px",
              }}
            >
              <div
                style={{
                  border: "4px solid #dbeafe",
                  borderTop: "4px solid #2563eb",
                  borderRadius: "50%",
                  width: "36px",
                  height: "36px",
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
          ) : achievements.length === 0 ? (
            <p>No achievements found.</p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                gap: "1rem",
                marginTop: "1rem",
              }}
            >
              {achievements.map((a) => {
                const unlocked = a.achieved === 1;
                const iconUrl = getAchIconUrl(selectedGame.appid, a);
                return (
                  <div
                    key={a.apiname}
                    title={a.description || ""}
                    style={{
                      borderRadius: "8px",
                      padding: "0.5rem",
                      backgroundColor: unlocked ? "#dbeafe" : "#e5e7eb", // blue-100 or gray-200
                      color: unlocked ? "#1d4ed8" : "#64748b", // blue-700 or gray-500
                      boxShadow: unlocked
                        ? "0 0 10px #60a5fa"
                        : "inset 0 0 5px #cbd5e1",
                      filter: unlocked ? "none" : "grayscale(80%)",
                      transition: "transform 0.2s",
                      cursor: "default",
                      textAlign: "center",
                      userSelect: "none",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      border: unlocked
                        ? "2px solid #3b82f6"
                        : "1px solid #cbd5e1",
                    }}
                  >
                    <img
                      src={iconUrl}
                      alt={a.displayName || a.apiname}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = placeholderIcon;
                      }}
                      style={{
                        width: "64px",
                        height: "64px",
                        marginBottom: "0.5rem",
                        borderRadius: "8px",
                        objectFit: "contain",
                        background: "#f8fafc",
                        border: "1px solid #cbd5e1",
                      }}
                    />
                    <div
                      style={{
                        fontWeight: "700",
                        marginBottom: "0.3rem",
                        fontSize: "0.9rem",
                        wordWrap: "break-word",
                        overflowWrap: "break-word",
                        wordBreak: "break-word",
                        maxWidth: "120px",
                        textAlign: "center",
                        whiteSpace: "normal",
                        color: "#1e293b",
                      }}
                    >
                      {a.displayName || a.apiname}
                    </div>
                    <div style={{ fontSize: "0.8rem" }}>
                      {unlocked ? (
                        <span style={{ color: "#2563eb" }}>Unlocked</span>
                      ) : (
                        <span style={{ color: "#64748b" }}>Locked</span>
                      )}
                    </div>
                    <button
                      style={{
                        marginTop: "0.5rem",
                        background: "#2563eb",
                        color: "#fff",
                        border: "none",
                        borderRadius: "5px",
                        padding: "0.3rem 0.8rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        fontSize: "0.9rem",
                      }}
                      onClick={() => onAddToCollection(a, selectedGame.appid)}
                    >
                      Add to collection...
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </Modal>
  );
}