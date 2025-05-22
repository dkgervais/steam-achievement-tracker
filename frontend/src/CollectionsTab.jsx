import React, { useState } from "react";

export default function CollectionsTab({ collections, setCollections, achievementsMap, games }) {
  const [newCollectionName, setNewCollectionName] = useState("");

  const addCollection = () => {
    if (!newCollectionName.trim()) return;
    setCollections(prev => {
      const updated = [...prev, { name: newCollectionName, achievements: [] }];
      localStorage.setItem("achievementCollections", JSON.stringify(updated));
      return updated;
    });
    setNewCollectionName("");
  };

  const removeAchievement = (colIdx, achIdx) => {
    setCollections(prev => {
      const updated = [...prev];
      updated[colIdx].achievements.splice(achIdx, 1);
      localStorage.setItem("achievementCollections", JSON.stringify(updated));
      return updated;
    });
  };

  const deleteCollection = (colIdx) => {
    setCollections(prev => {
      const updated = prev.filter((_, idx) => idx !== colIdx);
      localStorage.setItem("achievementCollections", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <div>
      <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
        <input
          type="text"
          placeholder="New collection name"
          value={newCollectionName}
          onChange={e => setNewCollectionName(e.target.value)}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "6px",
            border: "1px solid #3b82f6",
            fontSize: "1rem",
            marginRight: "1rem"
          }}
        />
        <button
          onClick={addCollection}
          style={{
            background: "#3b82f6",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            padding: "0.5rem 1.2rem",
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          Add Collection
        </button>
      </div>
      {collections.length === 0 ? (
        <p style={{ textAlign: "center", color: "#64748b" }}>No collections yet.</p>
      ) : (
        collections.map((col, colIdx) => (
          <div key={col.name} style={{ marginBottom: "2rem", background: "#f8fafc", borderRadius: "8px", padding: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ color: "#2563eb", marginBottom: "1rem" }}>{col.name}</h3>
              <button
                onClick={() => deleteCollection(colIdx)}
                style={{
                  background: "#ef4444",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  padding: "0.3rem 0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  marginLeft: "1rem"
                }}
                title="Delete this collection"
              >
                Delete
              </button>
            </div>
            {col.achievements.length === 0 ? (
              <p style={{ color: "#64748b" }}>No achievements in this collection.</p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0 }}>
                {col.achievements.map((ach, achIdx) => (
                  <li key={ach.apiname + ach.appid} style={{ marginBottom: "0.7rem", display: "flex", alignItems: "center" }}>
                    <img src={ach.icon} alt={ach.displayName} style={{ width: 32, height: 32, marginRight: 12, borderRadius: 6 }} />
                    <span style={{ flex: 1 }}>{ach.displayName || ach.apiname}</span>
                    <button
                      onClick={() => removeAchievement(colIdx, achIdx)}
                      style={{
                        background: "#ef4444",
                        color: "#fff",
                        border: "none",
                        borderRadius: "5px",
                        padding: "0.3rem 0.8rem",
                        fontWeight: 600,
                        cursor: "pointer"
                      }}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))
      )}
    </div>
  );
}