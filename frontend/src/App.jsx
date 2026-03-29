import { useState, useRef, useEffect, useCallback } from "react";

const API_BASE = "/api";

const SAMPLE_PROMPTS = [
  "Explain the CAP theorem to a senior engineer in 3 sentences.",
  "Write a Java method to find the longest palindromic substring. Optimize for readability.",
  "Compare REST vs gRPC for internal microservice communication. Give me a table.",
  "What are the tradeoffs of event sourcing vs traditional CRUD?",
  "Roast this code: for(int i=0;i<list.size();i++){if(list.get(i).equals(x)){return list.get(i);}}",
];

function ModelTag({ model, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 14px",
        background: selected ? `${model.color}18` : "transparent",
        border: `1px solid ${selected ? model.color : "#2a2a3e"}`,
        borderRadius: 20,
        color: selected ? model.color : "#777",
        fontSize: 13,
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: selected ? 600 : 400,
        cursor: "pointer",
        transition: "all 0.2s",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={(e) => {
        if (!selected) {
          e.currentTarget.style.borderColor = model.color + "88";
          e.currentTarget.style.color = model.color;
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          e.currentTarget.style.borderColor = "#2a2a3e";
          e.currentTarget.style.color = "#777";
        }
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: model.color,
          opacity: selected ? 1 : 0.3,
        }}
      />
      {model.name}
    </button>
  );
}

function ResponsePanel({ model, response, isLoading, onRate }) {
  const [userRating, setUserRating] = useState(null);

  const handleRate = (rating) => {
    setUserRating(rating);
    onRate(model.id, rating);
  };

  useEffect(() => {
    setUserRating(null);
  }, [response?.runId]);

  return (
    <div
      style={{
        flex: "1 1 0",
        minWidth: 280,
        background: "#0e0e1a",
        border: `1px solid ${isLoading ? model.color + "44" : "#1e1e30"}`,
        borderRadius: 14,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        transition: "border-color 0.3s",
      }}
    >
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid #1e1e30",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: `${model.color}08`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: model.color,
              boxShadow: isLoading ? `0 0 8px ${model.color}` : "none",
              animation: isLoading ? "pulse 1.5s ease-in-out infinite" : "none",
            }}
          />
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, fontWeight: 700, color: model.color }}>
            {model.name}
          </span>
        </div>
        <span style={{ fontSize: 11, color: "#555" }}>{model.provider}</span>
      </div>

      <div
        style={{
          flex: 1,
          padding: 16,
          overflowY: "auto",
          fontSize: 13.5,
          lineHeight: 1.7,
          color: "#ccc",
          minHeight: 200,
          maxHeight: 500,
        }}
      >
        {isLoading ? (
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#555" }}>
            <div style={{ display: "flex", gap: 3 }}>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 5, height: 5, borderRadius: "50%", background: model.color,
                    opacity: 0.5, animation: `bounce 1.2s ease-in-out ${i * 0.15}s infinite`,
                  }}
                />
              ))}
            </div>
            <span style={{ fontSize: 12 }}>Thinking...</span>
          </div>
        ) : response?.error ? (
          <div style={{ color: "#ff6666" }}>{response.error}</div>
        ) : response?.text ? (
          <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{response.text}</div>
        ) : (
          <div style={{ color: "#333", fontStyle: "italic" }}>Waiting for prompt...</div>
        )}
      </div>

      {response && !response.error && !isLoading && (
        <div
          style={{
            padding: "10px 16px",
            borderTop: "1px solid #1e1e30",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <div style={{ display: "flex", gap: 14, fontSize: 11, color: "#666", fontFamily: "'Fira Code', monospace" }}>
            {response.latency_ms != null && <span>⏱ {(response.latency_ms / 1000).toFixed(2)}s</span>}
            {response.tokens != null && <span>📊 {response.tokens} tok</span>}
            {response.tokens_per_sec != null && <span>{response.tokens_per_sec.toFixed(0)} tok/s</span>}
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {["👎", "😐", "👍", "🔥"].map((emoji, i) => (
              <button
                key={i}
                onClick={() => handleRate(i)}
                style={{
                  background: userRating === i ? `${model.color}22` : "transparent",
                  border: `1px solid ${userRating === i ? model.color : "#2a2a3e"}`,
                  borderRadius: 8,
                  padding: "3px 8px",
                  fontSize: 14,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  transform: userRating === i ? "scale(1.15)" : "scale(1)",
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function LeaderboardPanel({ entries, onClose }) {
  if (!entries.length) return null;
  return (
    <div
      style={{
        background: "#0e0e1a",
        border: "1px solid #1e1e30",
        borderRadius: 14,
        marginBottom: 20,
        overflow: "hidden",
        animation: "fadeSlideIn 0.3s ease-out",
      }}
    >
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #1e1e30", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, fontWeight: 700, color: "#4a9eff" }}>
            🏆 Your Personal Rankings
          </span>
          <span style={{ fontSize: 11, color: "#555", marginLeft: 8 }}>persisted across sessions</span>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 16 }}>✕</button>
      </div>
      {entries.map((entry, i) => (
        <div
          key={entry.model_id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 14px",
            background: i === 0 ? "rgba(255, 215, 0, 0.04)" : "transparent",
            borderBottom: "1px solid #1a1a2a",
            animation: `fadeSlideIn 0.3s ease-out ${i * 0.05}s both`,
          }}
        >
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 14, color: "#555", width: 24, textAlign: "center" }}>
            {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
          </span>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: entry.color, flexShrink: 0 }} />
          <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#ddd" }}>{entry.model_name}</span>
          <div style={{ width: 80, height: 6, background: "#1a1a2a", borderRadius: 3, overflow: "hidden" }}>
            <div
              style={{
                width: `${entry.avg_rating != null ? Math.min((entry.avg_rating / 3) * 100, 100) : 0}%`,
                height: "100%",
                background: entry.color,
                borderRadius: 3,
                transition: "width 0.4s ease",
              }}
            />
          </div>
          <span style={{ fontSize: 12, color: "#888", fontFamily: "'Fira Code', monospace", width: 80, textAlign: "right" }}>
            {entry.avg_rating != null ? `${entry.avg_rating}/3` : "—"} ({entry.total_ratings})
          </span>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [models, setModels] = useState([]);
  const [selectedModels, setSelectedModels] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState({});
  const [leaderboard, setLeaderboard] = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [error, setError] = useState("");
  const [runId, setRunId] = useState(0);
  const textareaRef = useRef(null);

  // Load models on mount
  useEffect(() => {
    fetch(`${API_BASE}/models`)
      .then((r) => r.json())
      .then((data) => {
        setModels(data);
        // Default: pick first 3
        setSelectedModels(data.slice(0, 3).map((m) => m.id));
      })
      .catch(() => setError("Failed to connect to backend. Is the server running?"));
  }, []);

  const fetchLeaderboard = useCallback(() => {
    fetch(`${API_BASE}/leaderboard`)
      .then((r) => r.json())
      .then(setLeaderboard)
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const toggleModel = (modelId) => {
    setSelectedModels((prev) => {
      if (prev.includes(modelId)) return prev.length <= 2 ? prev : prev.filter((id) => id !== modelId);
      return prev.length >= 4 ? prev : [...prev, modelId];
    });
  };

  const handleRun = async () => {
    if (!prompt.trim()) {
      setError("Enter a prompt.");
      return;
    }
    setError("");
    setResponses({});
    const newRunId = runId + 1;
    setRunId(newRunId);

    const newLoading = {};
    selectedModels.forEach((id) => (newLoading[id] = true));
    setLoading(newLoading);

    selectedModels.forEach(async (modelId) => {
      try {
        const res = await fetch(`${API_BASE}/compete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model_id: modelId, prompt }),
        });
        const data = await res.json();
        setResponses((prev) => ({ ...prev, [modelId]: { ...data, runId: newRunId } }));
      } catch (err) {
        setResponses((prev) => ({
          ...prev,
          [modelId]: { error: `Network error: ${err.message}`, runId: newRunId },
        }));
      } finally {
        setLoading((prev) => ({ ...prev, [modelId]: false }));
      }
    });
  };

  const handleRate = useCallback(
    async (modelId, rating) => {
      try {
        await fetch(`${API_BASE}/rate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model_id: modelId, rating }),
        });
        fetchLeaderboard();
      } catch {}
    },
    [fetchLeaderboard]
  );

  const isAnyLoading = Object.values(loading).some(Boolean);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 24px 60px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Space Mono', monospace", fontSize: 32, fontWeight: 700, letterSpacing: -0.5 }}>
          <span style={{ color: "#4a9eff" }}>⚔️</span> MODEL ARENA
        </h1>
        <p style={{ color: "#555", fontSize: 14, marginTop: 6 }}>
          Same prompt. Multiple models. You be the judge.
        </p>
      </div>

      {/* Leaderboard toggle */}
      {leaderboard.length > 0 && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
          <button
            onClick={() => setShowLeaderboard(!showLeaderboard)}
            style={{
              padding: "8px 16px",
              background: showLeaderboard ? "#4a9eff18" : "transparent",
              border: `1px solid ${showLeaderboard ? "#4a9eff" : "#1e1e30"}`,
              borderRadius: 10,
              color: showLeaderboard ? "#4a9eff" : "#777",
              fontSize: 13,
              cursor: "pointer",
              fontWeight: 600,
              transition: "all 0.2s",
            }}
          >
            🏆 Leaderboard ({leaderboard.length})
          </button>
        </div>
      )}

      {showLeaderboard && <LeaderboardPanel entries={leaderboard} onClose={() => setShowLeaderboard(false)} />}

      {/* Model Selection */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: "#555", marginBottom: 8 }}>Select 2–4 models to compare:</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {models.map((model) => (
            <ModelTag key={model.id} model={model} selected={selectedModels.includes(model.id)} onClick={() => toggleModel(model.id)} />
          ))}
        </div>
      </div>

      {/* Prompt Input */}
      <textarea
        ref={textareaRef}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your prompt — the same query goes to all selected models..."
        rows={4}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleRun();
        }}
        style={{
          width: "100%",
          padding: 16,
          background: "#0e0e1a",
          border: "1px solid #1e1e30",
          borderRadius: 14,
          color: "#ddd",
          fontSize: 14,
          lineHeight: 1.6,
          resize: "vertical",
          marginBottom: 12,
          outline: "none",
        }}
        onFocus={(e) => { e.target.style.borderColor = "#4a9eff"; e.target.style.boxShadow = "0 0 0 2px rgba(74,158,255,0.1)"; }}
        onBlur={(e) => { e.target.style.borderColor = "#1e1e30"; e.target.style.boxShadow = "none"; }}
      />

      {/* Sample prompts */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
        <span style={{ fontSize: 11, color: "#444", lineHeight: "28px" }}>Try:</span>
        {SAMPLE_PROMPTS.map((sp, i) => (
          <button
            key={i}
            onClick={() => { setPrompt(sp); textareaRef.current?.focus(); }}
            style={{
              padding: "4px 12px",
              background: "transparent",
              border: "1px solid #1a1a2a",
              borderRadius: 14,
              color: "#555",
              fontSize: 11,
              cursor: "pointer",
              transition: "all 0.2s",
              maxWidth: 280,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => { e.target.style.borderColor = "#4a9eff44"; e.target.style.color = "#999"; }}
            onMouseLeave={(e) => { e.target.style.borderColor = "#1a1a2a"; e.target.style.color = "#555"; }}
          >
            {sp.length > 50 ? sp.slice(0, 50) + "…" : sp}
          </button>
        ))}
      </div>

      {error && (
        <div style={{
          padding: "10px 16px", background: "rgba(255,68,68,0.08)", border: "1px solid rgba(255,68,68,0.2)",
          borderRadius: 10, color: "#ff6666", fontSize: 13, marginBottom: 16,
        }}>
          {error}
        </div>
      )}

      {/* Run Button */}
      <button
        onClick={handleRun}
        disabled={!prompt.trim() || isAnyLoading}
        style={{
          width: "100%",
          padding: "13px 24px",
          background: !prompt.trim() || isAnyLoading ? "#1a1a2a" : "linear-gradient(135deg, #4a9eff, #2563eb)",
          border: "none",
          borderRadius: 12,
          color: !prompt.trim() || isAnyLoading ? "#555" : "#fff",
          fontSize: 15,
          fontWeight: 700,
          fontFamily: "'Space Mono', monospace",
          cursor: !prompt.trim() || isAnyLoading ? "not-allowed" : "pointer",
          letterSpacing: 0.5,
          transition: "all 0.3s",
          marginBottom: 24,
          textTransform: "uppercase",
        }}
        onMouseEnter={(e) => { if (prompt.trim() && !isAnyLoading) e.target.style.boxShadow = "0 4px 20px rgba(74,158,255,0.25)"; }}
        onMouseLeave={(e) => { e.target.style.boxShadow = "none"; }}
      >
        {isAnyLoading ? "⚔️ Running..." : `⚔️ Run on ${selectedModels.length} Models`}
        <span style={{ fontSize: 11, fontWeight: 400, opacity: 0.6, marginLeft: 8 }}>(⌘+Enter)</span>
      </button>

      {/* Response Panels */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {selectedModels.map((modelId) => {
          const model = models.find((m) => m.id === modelId);
          if (!model) return null;
          return (
            <ResponsePanel
              key={modelId}
              model={model}
              response={responses[modelId]}
              isLoading={loading[modelId]}
              onRate={handleRate}
            />
          );
        })}
      </div>

      {/* Footer */}
      {Object.keys(responses).length === 0 && !isAnyLoading && (
        <div style={{ textAlign: "center", color: "#333", fontSize: 12, marginTop: 32 }}>
          Powered by{" "}
          <a href="https://openrouter.ai" target="_blank" rel="noopener" style={{ color: "#444", textDecoration: "none", borderBottom: "1px dotted #333" }}>
            OpenRouter
          </a>
          . API key secured server-side.
        </div>
      )}
    </div>
  );
}
