"use client";

import { useState, useEffect, useRef } from "react";

const STORAGE_KEY = "card-prob-state";

interface HistoryItem {
  type: "black" | "red";
  number: number;
}

interface SavedState {
  phase: string;
  totalBlack: string;
  totalRed: string;
  totalPeople: string;
  currentBlack: number;
  currentRed: number;
  drawnBlack: number;
  drawnRed: number;
  history: HistoryItem[];
}

function loadState(): SavedState | null {
  try {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function saveState(state: SavedState) {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

function CardIcon({ color, size = 32 }: { color: string; size?: number }) {
  const fill = color === "red" ? "#ef4444" : "#1e293b";
  return (
    <svg width={size} height={size * 1.4} viewBox="0 0 40 56" fill="none">
      <rect x="1" y="1" width="38" height="54" rx="4" fill={fill} stroke="#475569" strokeWidth="1.5" />
      <rect x="4" y="4" width="32" height="48" rx="2" fill={fill} fillOpacity="0.3" />
      {color === "red" ? (
        <path d="M20 16 L14 24 L20 32 L26 24 Z" fill="#fca5a5" fillOpacity="0.8" />
      ) : (
        <circle cx="20" cy="24" r="7" fill="#94a3b8" fillOpacity="0.5" />
      )}
    </svg>
  );
}

export default function Home() {
  const [phase, setPhase] = useState<"setup" | "play">("setup");
  const [totalBlack, setTotalBlack] = useState("");
  const [totalRed, setTotalRed] = useState("");
  const [totalPeople, setTotalPeople] = useState("");
  const [currentBlack, setCurrentBlack] = useState(0);
  const [currentRed, setCurrentRed] = useState(0);
  const [drawnBlack, setDrawnBlack] = useState(0);
  const [drawnRed, setDrawnRed] = useState(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [mounted, setMounted] = useState(false);
  const historyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const saved = loadState();
    if (saved && saved.phase === "play") {
      setPhase("play");
      setTotalBlack(saved.totalBlack);
      setTotalRed(saved.totalRed);
      setTotalPeople(saved.totalPeople);
      setCurrentBlack(saved.currentBlack);
      setCurrentRed(saved.currentRed);
      setDrawnBlack(saved.drawnBlack);
      setDrawnRed(saved.drawnRed);
      setHistory(saved.history || []);
    }
  }, []);

  useEffect(() => {
    if (phase === "play" && mounted) {
      saveState({
        phase, totalBlack, totalRed, totalPeople,
        currentBlack, currentRed, drawnBlack, drawnRed, history,
      });
    }
  }, [phase, currentBlack, currentRed, drawnBlack, drawnRed, history, mounted, totalBlack, totalRed, totalPeople]);

  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [history]);

  const totalCards = currentBlack + currentRed;
  const probRed = totalCards > 0 ? (currentRed / totalCards) * 100 : 0;
  const probBlack = totalCards > 0 ? (currentBlack / totalCards) * 100 : 0;
  const drawNumber = drawnBlack + drawnRed + 1;

  const startGame = () => {
    const b = parseInt(totalBlack) || 0;
    const r = parseInt(totalRed) || 0;
    if (b + r === 0) return;
    setCurrentBlack(b);
    setCurrentRed(r);
    setDrawnBlack(0);
    setDrawnRed(0);
    setHistory([]);
    setPhase("play");
  };

  const drawCard = (color: "black" | "red") => {
    if (color === "black" && currentBlack > 0) {
      setCurrentBlack((prev) => prev - 1);
      setDrawnBlack((prev) => prev + 1);
      setHistory((prev) => [...prev, { type: "black", number: drawNumber }]);
    } else if (color === "red" && currentRed > 0) {
      setCurrentRed((prev) => prev - 1);
      setDrawnRed((prev) => prev + 1);
      setHistory((prev) => [...prev, { type: "red", number: drawNumber }]);
    }
  };

  const resetGame = () => {
    setPhase("setup");
    setTotalBlack("");
    setTotalRed("");
    setTotalPeople("");
    setCurrentBlack(0);
    setCurrentRed(0);
    setDrawnBlack(0);
    setDrawnRed(0);
    setHistory([]);
    setShowConfirmReset(false);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0c1929] to-[#111827] flex items-center justify-center">
        <div className="text-slate-400 text-sm">กำลังโหลด...</div>
      </div>
    );
  }

  if (phase === "setup") {
    const canStart = (parseInt(totalBlack) || 0) + (parseInt(totalRed) || 0) > 0;
    const previewProb =
      canStart
        ? (
            ((parseInt(totalRed) || 0) /
              ((parseInt(totalBlack) || 0) + (parseInt(totalRed) || 0))) *
            100
          ).toFixed(1)
        : "0";

    return (
      <main className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0c1929] to-[#111827] flex flex-col items-center justify-center px-5 py-10 text-slate-200">
        <div className="fixed -top-[30%] left-[20%] w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(37,99,235,0.12)_0%,transparent_70%)] rounded-full pointer-events-none" />
        <div className="max-w-[440px] w-full bg-slate-900/85 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-xl shadow-[0_25px_50px_rgba(0,0,0,0.5)]">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <CardIcon color="black" size={24} />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-300 to-blue-500 bg-clip-text text-transparent tracking-tight">
                CARD DRAW
              </h1>
              <CardIcon color="red" size={24} />
            </div>
            <p className="text-slate-500 text-sm">คำนวณความน่าจะเป็นในการจับใบ</p>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                <span className="w-3 h-3 rounded bg-slate-700 border border-slate-600 inline-block" />
                จำนวนใบดำ
              </label>
              <input
                type="number"
                value={totalBlack}
                onChange={(e) => setTotalBlack(e.target.value)}
                placeholder="0"
                min="0"
                className="w-full px-4 py-3 bg-slate-800/60 border border-slate-700/80 rounded-xl text-slate-200 text-lg font-semibold outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                <span className="w-3 h-3 rounded bg-red-600 inline-block" />
                จำนวนใบแดง
              </label>
              <input
                type="number"
                value={totalRed}
                onChange={(e) => setTotalRed(e.target.value)}
                placeholder="0"
                min="0"
                className="w-full px-4 py-3 bg-slate-800/60 border border-slate-700/80 rounded-xl text-slate-200 text-lg font-semibold outline-none focus:border-red-500 transition-colors"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                <span className="text-sm">👥</span>
                จำนวนคนทั้งหมด
              </label>
              <input
                type="number"
                value={totalPeople}
                onChange={(e) => setTotalPeople(e.target.value)}
                placeholder="0"
                min="0"
                className="w-full px-4 py-3 bg-slate-800/60 border border-slate-700/80 rounded-xl text-slate-200 text-lg font-semibold outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {canStart && (
            <div className="mt-5 p-4 bg-blue-600/10 border border-blue-600/20 rounded-xl text-center">
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">โอกาสจับใบแดง</p>
              <p className="text-[32px] font-extrabold text-red-500 font-mono">{previewProb}%</p>
              {totalPeople && parseInt(totalPeople) > 0 && (
                <p className="text-slate-400 text-sm mt-1">
                  จาก {totalPeople} คน • ใบทั้งหมด {(parseInt(totalBlack) || 0) + (parseInt(totalRed) || 0)} ใบ
                </p>
              )}
            </div>
          )}

          <button
            onClick={startGame}
            disabled={!canStart}
            className={`w-full mt-6 py-3.5 rounded-xl text-base font-bold tracking-wide transition-all ${
              canStart
                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white border border-blue-500 shadow-[0_4px_20px_rgba(37,99,235,0.3)] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                : "bg-slate-800/50 text-slate-600 border border-slate-700/30 cursor-not-allowed"
            }`}
          >
            เริ่มจับใบ
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0c1929] to-[#111827] text-slate-200 px-4 py-4">
      <div className="fixed -top-[20%] -right-[10%] w-[350px] h-[350px] bg-[radial-gradient(circle,rgba(37,99,235,0.08)_0%,transparent_70%)] rounded-full pointer-events-none" />
      <div className="max-w-[500px] mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-lg font-bold bg-gradient-to-r from-blue-300 to-blue-500 bg-clip-text text-transparent">CARD DRAW</h1>
          <button onClick={() => setShowConfirmReset(true)} className="px-3.5 py-1.5 bg-slate-800/60 border border-slate-700/50 rounded-lg text-slate-400 text-sm cursor-pointer hover:border-red-500 hover:text-red-400 transition-all">
            รีเซ็ต
          </button>
        </div>

        {showConfirmReset && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur flex items-center justify-center p-5">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-7 max-w-[340px] w-full text-center">
              <p className="text-base font-semibold mb-2">รีเซ็ตข้อมูลทั้งหมด?</p>
              <p className="text-slate-500 text-sm mb-6">จะเริ่มตั้งค่าใหม่ทั้งหมด</p>
              <div className="flex gap-2.5">
                <button onClick={() => setShowConfirmReset(false)} className="flex-1 py-2.5 bg-slate-800/60 border border-slate-700 rounded-lg text-slate-400 text-sm font-semibold cursor-pointer">ยกเลิก</button>
                <button onClick={resetGame} className="flex-1 py-2.5 bg-red-600 border border-red-500 rounded-lg text-white text-sm font-semibold cursor-pointer">รีเซ็ต</button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-slate-900/85 border border-slate-700/50 rounded-2xl p-5 mb-3 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-slate-500 text-xs uppercase tracking-wider">โอกาสจับใบแดง</span>
            {totalPeople && <span className="text-slate-500 text-xs">{totalPeople} คน</span>}
          </div>
          <div className={`text-5xl font-extrabold font-mono leading-none transition-colors duration-300 ${probRed > 50 ? "text-red-500" : probRed > 25 ? "text-amber-500" : "text-green-500"}`}>
            {probRed.toFixed(1)}%
          </div>
          <div className="h-2 rounded-full bg-slate-800 mt-3 overflow-hidden flex">
            <div className="h-full bg-gradient-to-r from-slate-600 to-slate-500 transition-all duration-300" style={{ width: `${probBlack}%` }} />
            <div className="h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-300" style={{ width: `${probRed}%` }} />
          </div>
          <div className="flex justify-between mt-1.5 text-xs text-slate-500">
            <span>ดำ {probBlack.toFixed(1)}%</span>
            <span>แดง {probRed.toFixed(1)}%</span>
          </div>
        </div>

        <div className="flex gap-2.5 mb-3">
          <div className="flex-1 bg-slate-900/85 border border-slate-700/50 rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <span className="w-2.5 h-2.5 rounded bg-slate-600 inline-block" />
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">ใบดำ</span>
            </div>
            <div className="text-4xl font-extrabold font-mono text-slate-200">{currentBlack}</div>
            <div className="text-xs text-slate-500 mb-3">เหลือ จาก {totalBlack}</div>
            <button
              onClick={() => drawCard("black")}
              disabled={currentBlack <= 0}
              className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${currentBlack > 0 ? "bg-gradient-to-b from-slate-600 to-slate-800 border border-slate-500 text-slate-200 cursor-pointer hover:-translate-y-0.5 active:translate-y-0" : "bg-slate-800/30 border border-slate-700/20 text-slate-700 cursor-not-allowed"}`}
            >
              จับใบดำ
            </button>
            <div className="mt-2.5 py-1.5 px-2.5 bg-slate-800/40 rounded-md text-xs text-slate-500">
              จับแล้ว <span className="text-slate-300 font-bold">{drawnBlack}</span> ใบ
            </div>
          </div>

          <div className="flex-1 bg-slate-900/85 border border-red-900/30 rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <span className="w-2.5 h-2.5 rounded bg-red-600 inline-block" />
              <span className="text-xs font-semibold text-red-300 uppercase tracking-wider">ใบแดง</span>
            </div>
            <div className="text-4xl font-extrabold font-mono text-red-300">{currentRed}</div>
            <div className="text-xs text-slate-500 mb-3">เหลือ จาก {totalRed}</div>
            <button
              onClick={() => drawCard("red")}
              disabled={currentRed <= 0}
              className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${currentRed > 0 ? "bg-gradient-to-b from-red-600 to-red-800 border border-red-500 text-white cursor-pointer shadow-[0_4px_16px_rgba(220,38,38,0.25)] hover:-translate-y-0.5 active:translate-y-0" : "bg-slate-800/30 border border-slate-700/20 text-slate-700 cursor-not-allowed"}`}
            >
              จับใบแดง
            </button>
            <div className="mt-2.5 py-1.5 px-2.5 bg-red-950/20 rounded-md text-xs text-red-300">
              จับแล้ว <span className="font-bold">{drawnRed}</span> ใบ
            </div>
          </div>
        </div>

        <div className="bg-slate-900/85 border border-slate-700/50 rounded-2xl py-3.5 px-4 mb-3 flex justify-around">
          <div className="text-center">
            <div className="text-[11px] text-slate-500 uppercase tracking-wider">จับแล้ว</div>
            <div className="text-xl font-extrabold text-blue-500 font-mono">{drawnBlack + drawnRed}</div>
          </div>
          <div className="w-px bg-slate-800" />
          <div className="text-center">
            <div className="text-[11px] text-slate-500 uppercase tracking-wider">เหลือ</div>
            <div className="text-xl font-extrabold text-slate-200 font-mono">{totalCards}</div>
          </div>
          <div className="w-px bg-slate-800" />
          <div className="text-center">
            <div className="text-[11px] text-slate-500 uppercase tracking-wider">ทั้งหมด</div>
            <div className="text-xl font-extrabold text-slate-400 font-mono">{(parseInt(totalBlack) || 0) + (parseInt(totalRed) || 0)}</div>
          </div>
        </div>

        {history.length > 0 && (
          <div className="bg-slate-900/85 border border-slate-700/50 rounded-2xl p-4">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">ประวัติการจับ</div>
            <div ref={historyRef} className="max-h-[180px] overflow-y-auto flex flex-wrap gap-1.5">
              {history.map((item, i) => (
                <div key={i} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold border ${item.type === "red" ? "bg-red-950/25 border-red-600/30 text-red-300" : "bg-slate-800/50 border-slate-600/30 text-slate-400"}`}>
                  <span className={`w-1.5 h-1.5 rounded-sm ${item.type === "red" ? "bg-red-500" : "bg-slate-500"}`} />
                  #{item.number}
                </div>
              ))}
            </div>
          </div>
        )}

        {totalCards === 0 && (
          <div className="mt-3 p-5 bg-blue-600/10 border border-blue-600/30 rounded-2xl text-center">
            <div className="text-2xl mb-2">🎉</div>
            <p className="text-base font-bold text-blue-300 mb-1">จับใบครบแล้ว!</p>
            <p className="text-sm text-slate-500">ดำ {drawnBlack} ใบ • แดง {drawnRed} ใบ</p>
          </div>
        )}
      </div>
    </main>
  );
}
