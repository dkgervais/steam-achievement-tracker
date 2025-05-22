import React from "react";

export default function GameGrid({ games, onSelect, getIconUrl }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
        gap: "1rem",
        marginTop: "1rem",
      }}
    >
      {games.map((game) => (
        <div
          key={game.appid}
          onClick={() => onSelect(game)}
          style={{
            cursor: "pointer",
            padding: "1rem",
            backgroundColor: "#f1f5f9", // blue-grey background
            border: "2px solid #3b82f6", // blue border
            borderRadius: "8px",
            textAlign: "center",
            boxShadow: "0 1px 6px rgba(59,130,246,0.08)",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
            e.currentTarget.style.boxShadow = "0 4px 16px rgba(59,130,246,0.18)";
            e.currentTarget.style.backgroundColor = "#dbeafe"; // lighter blue
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 1px 6px rgba(59,130,246,0.08)";
            e.currentTarget.style.backgroundColor = "#f1f5f9";
          }}
        >
          <img
            src={getIconUrl(game.appid, game.img_icon_url)}
            alt={game.name}
            style={{
              width: "64px",
              height: "64px",
              marginBottom: "0.5rem",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              background: "#fff",
            }}
          />
          <div
            style={{
              fontSize: "0.9rem",
              fontWeight: "600",
              wordWrap: "break-word",
              overflowWrap: "break-word",
              color: "#1e293b",
            }}
          >
            {game.name}
          </div>
        </div>
      ))}
    </div>
  );
}