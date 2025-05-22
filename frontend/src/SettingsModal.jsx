import React, { useState } from "react";
import Modal from "react-modal";

export default function SettingsModal({ isOpen, onRequestClose, onSave, initialApiKey, initialSteamId }) {
  const [apiKey, setApiKey] = useState(initialApiKey || "");
  const [steamId, setSteamId] = useState(initialSteamId || "");

  const handleSave = () => {
    onSave(apiKey, steamId);
    onRequestClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Settings"
      style={{
        content: {
          maxWidth: "400px",
          margin: "auto",
          padding: "2rem",
          borderRadius: "10px",
          fontFamily: "sans-serif",
          background: "#f1f5f9",
          border: "1px solid #3b82f6",
        },
        overlay: {
          backgroundColor: "rgba(30, 41, 59, 0.7)",
          zIndex: 1000,
        },
      }}
    >
      <h2 style={{ color: "#2563eb" }}>Steam Settings</h2>
      <div style={{ marginBottom: "1rem" }}>
        <label style={{ display: "block", marginBottom: "0.5rem" }}>Steam API Key</label>
        <input
          type="text"
          value={apiKey}
          onChange={e => setApiKey(e.target.value)}
          style={{
            width: "100%",
            padding: "0.5rem",
            borderRadius: "5px",
            border: "1px solid #3b82f6",
            marginBottom: "1rem"
          }}
        />
        <label style={{ display: "block", marginBottom: "0.5rem" }}>Steam ID</label>
        <input
          type="text"
          value={steamId}
          onChange={e => setSteamId(e.target.value)}
          style={{
            width: "100%",
            padding: "0.5rem",
            borderRadius: "5px",
            border: "1px solid #3b82f6"
          }}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
        <button
          onClick={onRequestClose}
          style={{
            background: "#e5e7eb",
            color: "#1e293b",
            border: "none",
            borderRadius: "5px",
            padding: "0.5rem 1rem",
            cursor: "pointer"
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          style={{
            background: "#3b82f6",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            padding: "0.5rem 1rem",
            cursor: "pointer"
          }}
        >
          Save
        </button>
      </div>
    </Modal>
  );
}