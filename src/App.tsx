import { useState, useRef } from "react";
import { Instagram, Download, Share2 } from "lucide-react";
import html2canvas from "html2canvas";

const INITIAL_PLAYERS = [
  "Dayo Olabode",
  "David Vanteko",
  "TJ Baba",
  "Abass",
];

const NAVY = "#1A2744";
const ROYAL_BLUE = "#2B4C8C";
const CRIMSON = "#B91C1C";
const DARK_RED = "#7F1D1D";
const CREAM = "#F5F0E8";
const DARK_BG = "#0F1520";
const CARD_BG = "#151D2E";
const LOGO_URL = "https://res.cloudinary.com/dspngcwzj/image/upload/v1772200670/ChatGPT_Image_Feb_27_2026_02_33_01_PM_fyn4xl.png";

function shuffleArray(arr: string[]) {
  const s = [...arr];
  for (let i = s.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [s[i], s[j]] = [s[j], s[i]];
  }
  return s;
}

function splitIntoTeams(players: string[], n: number) {
  const s = shuffleArray(players);
  const teams = Array.from({ length: n }, () => [] as string[]);
  s.forEach((p, i) => teams[i % n].push(p));
  return teams;
}

const BASE_TC = [
  { name: "Team A", bg: ROYAL_BLUE, accent: "#60A5FA", badge: "🔵", strip: "#2563EB" },
  { name: "Team B", bg: "#991B1B", accent: "#F87171", badge: "🔴", strip: CRIMSON },
  { name: "Team C", bg: "#065F46", accent: "#34D399", badge: "🟢", strip: "#059669" },
  { name: "Team D", bg: "#92400E", accent: "#FBBF24", badge: "🟡", strip: "#D97706" },
  { name: "Team E", bg: "#581C87", accent: "#C084FC", badge: "🟣", strip: "#7C3AED" },
];

const EXTRA_COLORS = [
  { bg: "#164E63", accent: "#22D3EE", badge: "🩵", strip: "#0891B2" },
  { bg: "#713F12", accent: "#FACC15", badge: "🟠", strip: "#CA8A04" },
  { bg: "#831843", accent: "#F472B6", badge: "🩷", strip: "#DB2777" },
  { bg: "#1E3A5F", accent: "#7DD3FC", badge: "🔷", strip: "#0284C7" },
  { bg: "#365314", accent: "#A3E635", badge: "💚", strip: "#65A30D" },
  { bg: "#4A1D96", accent: "#A78BFA", badge: "💜", strip: "#7C3AED" },
  { bg: "#7C2D12", accent: "#FB923C", badge: "🧡", strip: "#EA580C" },
];

function getTeamConfig(index: number) {
  const letter = String.fromCharCode(65 + index); // A, B, C...
  if (index < BASE_TC.length) {
    return BASE_TC[index];
  }
  const extra = EXTRA_COLORS[(index - BASE_TC.length) % EXTRA_COLORS.length];
  return { ...extra, name: `Team ${letter}` };
}

export default function App() {
  const [players, setPlayers] = useState<string[]>(INITIAL_PLAYERS);
  const [newPlayer, setNewPlayer] = useState("");
  const [numTeams, setNumTeams] = useState(2);
  const [teams, setTeams] = useState<string[][] | null>(null);
  const [isShuffling, setIsShuffling] = useState(false);
  const [shuffleCount, setShuffleCount] = useState(0);
  const [showTeams, setShowTeams] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const teamsRef = useRef<HTMLDivElement>(null);

  const addPlayer = () => {
    const name = newPlayer.trim();
    if (name && !players.includes(name)) {
      setPlayers([...players, name]);
      setNewPlayer("");
      setTeams(null);
      setShowTeams(false);
    }
  };

  const removePlayer = (i: number) => {
    setPlayers(players.filter((_, idx) => idx !== i));
    setTeams(null);
    setShowTeams(false);
  };

  const handleShuffle = () => {
    if (players.length < numTeams) return;
    setIsShuffling(true);
    setShowTeams(false);
    setShuffleCount(c => c + 1);
    let count = 0;
    const iv = setInterval(() => {
      setTeams(splitIntoTeams(players, numTeams));
      count++;
      if (count >= 12) {
        clearInterval(iv);
        setTeams(splitIntoTeams(players, numTeams));
        setIsShuffling(false);
        setTimeout(() => setShowTeams(true), 100);
      }
    }, 100);
  };

  const handleDownloadTeam = async (teamIndex: number) => {
    const originalCard = document.querySelector(`[data-team-card="${teamIndex}"]`) as HTMLElement;
    if (!originalCard) return;
    setIsDownloading(true);
    try {
      const tc = getTeamConfig(teamIndex);
      
      // 1. Create off-screen wrapper
      const wrapper = document.createElement("div");
      wrapper.style.position = "absolute";
      wrapper.style.left = "-9999px";
      wrapper.style.top = "0";
      wrapper.style.width = "400px";
      wrapper.style.padding = "24px";
      wrapper.style.background = DARK_BG;
      wrapper.style.display = "flex";
      wrapper.style.flexDirection = "column";
      wrapper.style.borderRadius = "16px";
      
      // 2. Clone the card
      const clone = originalCard.cloneNode(true) as HTMLElement;
      clone.style.width = "100%";
      clone.style.height = "max-content";
      clone.style.margin = "0";
      clone.style.animation = "none";
      clone.style.transform = "none";
      clone.style.overflow = "visible"; // Ensure no clipping
      
      // 3. Reveal hidden branding
      const brandHeader = clone.querySelector(".card-brand-header") as HTMLElement;
      if (brandHeader) brandHeader.style.display = "flex";
      
      const brandFooter = clone.querySelector(".card-brand-footer") as HTMLElement;
      if (brandFooter) brandFooter.style.display = "block";
      
      // 4. Hide download button
      const dlBtn = clone.querySelector(".card-download-btn") as HTMLElement;
      if (dlBtn) dlBtn.style.display = "none";
      
      // 5. Assemble and append to DOM
      wrapper.appendChild(clone);
      document.body.appendChild(wrapper);
      
      // 6. Capture
      const canvas = await html2canvas(wrapper, {
        backgroundColor: DARK_BG,
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
      });
      
      // 7. Cleanup
      document.body.removeChild(wrapper);
      
      // 8. Download
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `SOT-FC-${tc.name.replace(/\s/g, "-")}-${new Date().toISOString().slice(0, 10)}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Team download failed:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(170deg, ${DARK_BG}cc 0%, #111827bb 50%, #1A1020cc 100%), url('https://res.cloudinary.com/dspngcwzj/image/upload/v1772203995/soccer-stadium-night_st5tlt.jpg') center/cover fixed no-repeat`,
      fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif",
      color: CREAM, position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", zIndex: 0, opacity: 0.03 }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", width: 300, height: 300, borderRadius: "50%", border: "2px solid white", transform: "translate(-50%, -50%)" }} />
        <div style={{ position: "absolute", top: 0, left: "50%", width: 2, height: "100%", background: "white" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 720, margin: "0 auto", padding: "24px 20px 40px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          {/* Logo */}
          <div style={{ marginBottom: 16, display: "flex", justifyContent: "center" }}>
            {!logoError ? (
              <img
                src={LOGO_URL}
                alt="SOT FC Logo"
                style={{
                  width: 140, height: 140, objectFit: "cover",
                  borderRadius: "50%",
                  filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.4))"
                }}
                onError={() => setLogoError(true)}
              />
            ) : (
              <div style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 80, height: 80, borderRadius: "50%",
                background: `linear-gradient(180deg, ${ROYAL_BLUE} 50%, ${CRIMSON} 50%)`,
                border: `3px solid ${NAVY}`,
                boxShadow: `0 8px 32px rgba(43,76,140,0.3), 0 0 60px rgba(185,28,28,0.15)`,
                fontSize: 36,
              }}>
                ⚽
              </div>
            )}
          </div>

          <h1 style={{ fontSize: 26, fontWeight: 300, margin: "8px 0 6px", letterSpacing: 2, textTransform: "uppercase" }}>
            <span style={{ fontWeight: 800, color: CREAM }}>SOT FC</span>{" "}
            <span style={{ color: "#94A3B8" }}>Team Shuffler</span>
          </h1>
          <p style={{ color: "#64748B", fontSize: 12, margin: "0 0 16px", letterSpacing: 1.5 }}>
            SOCCER ON TURF • AMUWO ODOFIN • EST. 2023
          </p>

          {/* Instagram Link */}
          <a
            href="https://www.instagram.com/sot.fc?igsh=aTA1eHY2aHJxaXFw"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "8px 16px", borderRadius: 20,
              background: "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
              color: "white", textDecoration: "none", fontSize: 13, fontWeight: 600,
              boxShadow: "0 4px 12px rgba(220, 39, 67, 0.3)",
              transition: "transform 0.2s ease",
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
            onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            <Instagram size={16} />
            <span>Follow @sot.fc</span>
          </a>
        </div>

        {/* Squad */}
        <div style={{ background: CARD_BG, borderRadius: 16, border: `1px solid ${ROYAL_BLUE}33`, padding: 24, marginBottom: 16, boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 16 }}>👥</span>
            <h2 style={{ fontSize: 15, fontWeight: 600, margin: 0, color: "#94A3B8" }}>Squad ({players.length})</h2>
          </div>

          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            <input
              type="text" value={newPlayer}
              onChange={e => setNewPlayer(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addPlayer()}
              placeholder="Enter player name..."
              style={{
                flex: 1, padding: "12px 16px", borderRadius: 10,
                border: `1px solid ${ROYAL_BLUE}44`, background: "#0D1117",
                color: CREAM, fontSize: 15, outline: "none",
              }}
            />
            <button onClick={addPlayer} style={{
              padding: "12px 20px", borderRadius: 10, border: "none",
              background: `linear-gradient(135deg, ${ROYAL_BLUE}, ${NAVY})`,
              color: CREAM, fontSize: 14, fontWeight: 600, cursor: "pointer",
            }}>+ Add</button>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {players.map((p, i) => (
              <div key={`${p}-${i}`} style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: `${NAVY}88`, padding: "8px 14px", borderRadius: 8,
                fontSize: 14, fontWeight: 500, border: `1px solid ${ROYAL_BLUE}33`,
              }}>
                <span style={{
                  width: 22, height: 22, borderRadius: "50%",
                  background: `linear-gradient(135deg, ${ROYAL_BLUE}, ${CRIMSON})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0,
                }}>{i + 1}</span>
                <span>{p}</span>
                <button onClick={() => removePlayer(i)} style={{
                  background: "none", border: "none", color: "#64748B",
                  cursor: "pointer", fontSize: 16, padding: "0 2px", lineHeight: 1,
                }}>×</button>
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div style={{ background: CARD_BG, borderRadius: 16, border: `1px solid ${ROYAL_BLUE}33`, padding: 24, marginBottom: 20, boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div>
              <label style={{ fontSize: 11, color: "#64748B", fontWeight: 600, display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1.5 }}>Teams</label>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button
                  onClick={() => { setNumTeams(Math.max(2, numTeams - 1)); setTeams(null); setShowTeams(false); }}
                  disabled={numTeams <= 2}
                  style={{
                    width: 44, height: 44, borderRadius: 10,
                    border: `1px solid ${ROYAL_BLUE}44`, background: "#0D1117",
                    color: numTeams <= 2 ? "#1E293B" : "#94A3B8",
                    fontSize: 20, fontWeight: 700, cursor: numTeams <= 2 ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >−</button>

                <div style={{
                  minWidth: 52, height: 44, borderRadius: 10,
                  border: `2px solid ${CRIMSON}`, background: `${CRIMSON}22`,
                  color: "#F87171", fontSize: 18, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  padding: "0 12px",
                }}>{numTeams}</div>

                <button
                  onClick={() => { setNumTeams(numTeams + 1); setTeams(null); setShowTeams(false); }}
                  disabled={numTeams >= players.length}
                  style={{
                    width: 44, height: 44, borderRadius: 10,
                    border: `1px solid ${ROYAL_BLUE}44`, background: "#0D1117",
                    color: numTeams >= players.length ? "#1E293B" : "#94A3B8",
                    fontSize: 20, fontWeight: 700, cursor: numTeams >= players.length ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >+</button>
              </div>
            </div>
            <button onClick={handleShuffle}
              disabled={players.length < numTeams || isShuffling}
              style={{
                padding: "14px 36px", borderRadius: 12, border: "none",
                background: players.length < numTeams ? "#1E293B" : `linear-gradient(135deg, ${CRIMSON}, ${DARK_RED})`,
                color: players.length < numTeams ? "#334155" : "#fff",
                fontSize: 16, fontWeight: 700, cursor: players.length < numTeams ? "not-allowed" : "pointer",
                letterSpacing: 1, textTransform: "uppercase",
                boxShadow: players.length >= numTeams ? `0 4px 24px rgba(185,28,28,0.35)` : "none",
                transform: isShuffling ? "scale(0.96)" : "scale(1)",
              }}
            >{isShuffling ? "🎲 Shuffling..." : "⚡ Shuffle Teams"}</button>
          </div>
        </div>

        {/* Results */}
        {teams && (
          <div style={{ opacity: showTeams ? 1 : 0.3, transition: "opacity 0.5s ease" }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <span style={{
                display: "inline-block", padding: "6px 18px",
                background: `${ROYAL_BLUE}22`, borderRadius: 20,
                border: `1px solid ${ROYAL_BLUE}44`,
                fontSize: 12, color: "#60A5FA", fontWeight: 600,
                letterSpacing: 1, textTransform: "uppercase",
              }}>Shuffle #{shuffleCount} — {players.length} players → {numTeams} teams</span>
            </div>

            {/* Capture Area */}
            <div ref={teamsRef} style={{ padding: "20px", background: DARK_BG, borderRadius: "16px" }}>
              {/* Header for Image Export Only - Hidden normally */}
              <div className="export-header" style={{ display: "none", textAlign: "center", marginBottom: "24px" }}>
                <img 
                  src={LOGO_URL} 
                  alt="SOT FC Logo" 
                  style={{ width: "120px", height: "120px", objectFit: "cover", borderRadius: "50%", marginBottom: "12px", filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))" }} 
                  crossOrigin="anonymous"
                />
                <h2 style={{ fontSize: "24px", fontWeight: 800, color: CREAM, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "2px" }}>SOT FC</h2>
                <p style={{ color: "#94A3B8", fontSize: "14px", margin: 0, letterSpacing: "1px" }}>TEAM LINEUP • {new Date().toLocaleDateString()}</p>
              </div>

              <div data-teams-grid style={{
                display: "grid",
                gridTemplateColumns: numTeams <= 1 ? "1fr" : "repeat(2, 1fr)",
                gap: 14,
              }}>
                {teams.map((team, i) => {
                  const tc = getTeamConfig(i);
                  return (
                    <div key={`t-${i}-${shuffleCount}`} data-team-card={i} style={{
                      background: `linear-gradient(180deg, ${tc.bg}22, ${CARD_BG})`,
                      borderRadius: 14, border: `1px solid ${tc.accent}33`, overflow: "hidden",
                      animation: showTeams ? `slideUp 0.4s ease ${i * 0.1}s both` : "none",
                      position: "relative",
                    }}>
                      {/* Branded header - hidden on screen, shown in download */}
                      <div className="card-brand-header" style={{
                        display: "none", alignItems: "center", gap: 10,
                        padding: "16px 16px 12px", borderBottom: `1px solid ${tc.accent}22`,
                      }}>
                        <img
                          src={LOGO_URL}
                          alt="SOT FC"
                          style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }}
                          crossOrigin="anonymous"
                        />
                        <div>
                          <span style={{ fontSize: 13, fontWeight: 800, color: CREAM, letterSpacing: 1 }}>SOT FC</span>
                          <span style={{ fontSize: 10, color: "#64748B", display: "block", letterSpacing: 0.5 }}>
                            SOCCER ON TURF • {new Date().toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div style={{ height: 4, background: `linear-gradient(90deg, ${tc.strip}, ${tc.accent})` }} />

                      <div style={{ padding: "10px 10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 14 }}>{tc.badge}</span>
                          <div>
                            <h3 style={{ margin: 0, fontSize: 12, fontWeight: 700, color: tc.accent, whiteSpace: "nowrap" }}>{tc.name}</h3>
                            <span style={{ fontSize: 10, color: "#64748B" }}>{team.length} player{team.length !== 1 ? "s" : ""}</span>
                          </div>
                        </div>
                        <button
                          className="card-download-btn"
                          onClick={() => handleDownloadTeam(i)}
                          disabled={isDownloading}
                          title={`Download ${tc.name}`}
                          style={{
                            width: 28, height: 28, borderRadius: 6,
                            border: `1px solid ${tc.accent}44`,
                            background: `${tc.bg}88`,
                            color: tc.accent, cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 12, flexShrink: 0,
                            transition: "all 0.2s ease",
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background = tc.accent;
                            e.currentTarget.style.color = "#fff";
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = `${tc.bg}88`;
                            e.currentTarget.style.color = tc.accent;
                          }}
                        >
                          <Download size={12} />
                        </button>
                      </div>
                      <div style={{ padding: "4px 10px 8px" }}>
                        {team.map((p, j) => (
                          <div key={p} style={{
                            display: "flex", alignItems: "center", gap: 8, padding: "7px 0", // Reduced padding and gap
                            borderBottom: j < team.length - 1 ? `1px solid ${tc.accent}11` : "none",
                          }}>
                            <div style={{
                              width: 20, height: 20, borderRadius: "50%", // Smaller number circle
                              background: `linear-gradient(135deg, ${tc.bg}, ${tc.accent}33)`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 9, fontWeight: 700, color: tc.accent, // Smaller font
                              border: `1px solid ${tc.accent}33`, flexShrink: 0,
                            }}>{j + 1}</div>
                            <span style={{ 
                              fontSize: 11, fontWeight: 500, color: CREAM, wordBreak: "break-word", lineHeight: 1.3
                            }}>{p}</span>
                          </div>
                        ))}
                      </div>

                      {/* Branded footer - hidden on screen, shown in download */}
                      <div className="card-brand-footer" style={{
                        display: "none", textAlign: "center",
                        padding: "10px 16px 14px",
                        borderTop: `1px solid ${tc.accent}15`,
                        fontSize: 9, color: "#475569", letterSpacing: 0.5,
                      }}>
                        Generated by SOT FC Team Shuffler • sot.fc
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ textAlign: "center", marginTop: 16, opacity: 0.5, fontSize: 10, color: "#64748B", display: "none" }} className="export-footer">
                Generated by SOT FC Team Shuffler
              </div>
            </div>

            <div style={{ textAlign: "center", marginTop: 24, display: "flex", justifyContent: "center", gap: 12 }}>
              <button onClick={handleShuffle} disabled={isShuffling} style={{
                padding: "10px 28px", borderRadius: 10,
                border: `1px solid ${CRIMSON}55`, background: "transparent",
                color: "#F87171", fontSize: 14, fontWeight: 600, cursor: "pointer",
              }}>🔄 Reshuffle</button>
            </div>
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: 40, padding: "20px 0", borderTop: `1px solid ${ROYAL_BLUE}22` }}>
          <p style={{ color: "white", fontSize: 11, margin: 0, letterSpacing: 0.5 }}>
            SOT FC Team Shuffler • Soccer On Turf, Amuwo Odofin • Built by Tieko Media Limited
          </p>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        input::placeholder { color: #334155; }
      `}</style>
    </div>
  );
}
