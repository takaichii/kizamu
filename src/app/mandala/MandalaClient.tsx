"use client";

import { useState } from "react";

export type MandalaCell = {
  id: string;
  position: number;
  title: string;
  memo: string | null;
  orientationId: string | null;
  bucketItemId: string | null;
  recordLinks: { id: string }[];
  orientation: { id: string; title: string } | null;
  bucketItem: { id: string; title: string } | null;
};

export type Mandala = {
  id: string;
  year: number;
  quarter: number;
  centerTheme: string;
  cells: MandalaCell[];
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-[10px] font-semibold tracking-[0.25em] uppercase text-stone-400">
        {children}
      </span>
      <span className="flex-1 border-t border-stone-200" />
    </div>
  );
}

// 8セルの配置順（中心を囲む時計回り）
// 位置 0〜7 を 3×3 グリッドの外周に配置
//  0 | 1 | 2
//  7 | C | 3
//  6 | 5 | 4
const GRID_POSITIONS = [0, 1, 2, 7, -1, 3, 6, 5, 4]; // -1 = center

type CellEditorProps = {
  cell: MandalaCell | undefined;
  position: number;
  mandalaId: string;
  onSave: (cell: MandalaCell) => void;
  onClose: () => void;
};

function CellEditor({ cell, position, mandalaId, onSave, onClose }: CellEditorProps) {
  const [title, setTitle] = useState(cell?.title ?? "");
  const [memo, setMemo] = useState(cell?.memo ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/mandala/${mandalaId}/cells/${position}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, memo }),
      });
      if (res.ok) {
        const updated: MandalaCell = await res.json();
        onSave(updated);
        onClose();
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-sm rounded-xl border border-stone-200 bg-[#f9f6ef] p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-mono text-stone-400">
            Cell {String(position + 1).padStart(2, "0")}
          </span>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 text-lg leading-none">
            ×
          </button>
        </div>
        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="テーマ・目標"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            className="rounded-lg border border-stone-200 bg-white/70 px-4 py-2.5 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:ring-1 focus:ring-stone-400"
          />
          <textarea
            placeholder="メモ・詳細（任意）"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={3}
            className="rounded-lg border border-stone-200 bg-white/70 px-4 py-2.5 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:ring-1 focus:ring-stone-400 resize-none"
          />
        </div>
        <div className="mt-4 flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 rounded-lg bg-stone-800 py-2.5 text-sm font-medium text-stone-50 hover:bg-stone-700 disabled:opacity-50 transition-colors"
          >
            {saving ? "保存中..." : "保存"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-stone-200 py-2.5 text-sm text-stone-500 hover:bg-white transition-colors"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MandalaClient({
  initialMandala,
  initialYear,
  initialQuarter,
}: {
  initialMandala: Mandala | null;
  initialYear: number;
  initialQuarter: number;
}) {
  const [year, setYear] = useState(initialYear);
  const [quarter, setQuarter] = useState(initialQuarter);
  const [mandala, setMandala] = useState<Mandala | null>(initialMandala);
  const [centerTheme, setCenterTheme] = useState(initialMandala?.centerTheme ?? "");
  const [editingPos, setEditingPos] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [editingCenter, setEditingCenter] = useState(false);

  function getCellAt(pos: number): MandalaCell | undefined {
    return mandala?.cells.find((c) => c.position === pos);
  }

  async function createMandala() {
    setCreating(true);
    try {
      const res = await fetch("/api/mandala", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year, quarter, centerTheme }),
      });
      if (res.ok) {
        const created: Mandala = await res.json();
        setMandala(created);
        setCenterTheme(created.centerTheme);
      }
    } finally {
      setCreating(false);
    }
  }

  async function saveCenterTheme() {
    if (!mandala) return;
    const res = await fetch("/api/mandala", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ year, quarter, centerTheme }),
    });
    if (res.ok) {
      const updated: Mandala = await res.json();
      setMandala(updated);
      setEditingCenter(false);
    }
  }

  function handleCellSaved(updated: MandalaCell) {
    if (!mandala) return;
    const cells = mandala.cells.filter((c) => c.position !== updated.position);
    setMandala({ ...mandala, cells: [...cells, updated] });
  }

  function navigate(deltaYear: number, deltaQuarter: number) {
    let q = quarter + deltaQuarter;
    let y = year + deltaYear;
    if (q > 4) { q = 1; y++; }
    if (q < 1) { q = 4; y--; }
    setYear(y);
    setQuarter(q);
    setMandala(null);
    setCenterTheme("");
  }

  const totalRecords = mandala?.cells.reduce((s, c) => s + c.recordLinks.length, 0) ?? 0;

  return (
    <div className="min-h-screen bg-[#f9f6ef]">
      <div className="mx-auto max-w-lg px-5 pb-16 pt-10">

        {/* ヘッダー */}
        <header className="mb-10 border-b border-stone-200 pb-6">
          <p className="text-[10px] tracking-[0.25em] uppercase font-mono text-stone-400 mb-3">
            Quarterly Mandala
          </p>
          <h1 className="font-[family-name:var(--font-serif)] text-3xl font-bold text-stone-800 leading-tight">
            四半期マンダラ
          </h1>
          <p className="mt-2 text-sm text-stone-500">
            今期の注力テーマを8つのセルで整理する
          </p>
        </header>

        {/* 年・四半期ナビゲーション */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate(0, -1)}
            className="rounded-lg border border-stone-200 px-3 py-1.5 text-sm text-stone-400 hover:border-stone-400 hover:text-stone-600 transition-colors"
          >
            ← 前期
          </button>
          <h2 className="font-[family-name:var(--font-serif)] text-lg font-bold text-stone-800">
            {year}年 Q{quarter}
          </h2>
          <button
            onClick={() => navigate(0, 1)}
            className="rounded-lg border border-stone-200 px-3 py-1.5 text-sm text-stone-400 hover:border-stone-400 hover:text-stone-600 transition-colors"
          >
            次期 →
          </button>
        </div>

        {/* マンダラが未作成の場合 */}
        {!mandala ? (
          <div className="rounded-xl border border-dashed border-stone-300 bg-white/50 p-10 text-center">
            <p className="font-[family-name:var(--font-serif)] text-stone-500 text-sm mb-1">
              {year}年 Q{quarter} のマンダラはまだありません
            </p>
            <p className="text-xs text-stone-300 mb-6">中心テーマを設定して始めましょう</p>
            <input
              type="text"
              placeholder="中心テーマ（例：自分の土台をつくる）"
              value={centerTheme}
              onChange={(e) => setCenterTheme(e.target.value)}
              className="w-full rounded-lg border border-stone-200 bg-[#f9f6ef] px-4 py-2.5 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:ring-1 focus:ring-stone-400 mb-3"
            />
            <button
              onClick={createMandala}
              disabled={creating || !centerTheme.trim()}
              className="w-full rounded-lg bg-stone-800 py-2.5 text-sm font-medium text-stone-50 hover:bg-stone-700 disabled:opacity-40 transition-colors"
            >
              {creating ? "作成中..." : "マンダラを作成"}
            </button>
          </div>
        ) : (
          <>
            {/* マンダラグリッド */}
            <SectionLabel>マンダラチャート</SectionLabel>
            <div className="mb-6 grid grid-cols-3 gap-1.5">
              {GRID_POSITIONS.map((pos, gridIndex) => {
                if (pos === -1) {
                  // 中心セル
                  return (
                    <div
                      key="center"
                      className="aspect-square rounded-xl border-2 border-stone-800 bg-stone-800 flex flex-col items-center justify-center p-2 cursor-pointer hover:bg-stone-700 transition-colors"
                      onClick={() => setEditingCenter(true)}
                    >
                      {editingCenter ? (
                        <div className="w-full" onClick={(e) => e.stopPropagation()}>
                          <input
                            autoFocus
                            value={centerTheme}
                            onChange={(e) => setCenterTheme(e.target.value)}
                            onBlur={saveCenterTheme}
                            onKeyDown={(e) => e.key === "Enter" && saveCenterTheme()}
                            className="w-full bg-transparent text-center text-xs text-stone-50 outline-none"
                          />
                        </div>
                      ) : (
                        <p className="text-[10px] font-bold text-stone-50 text-center leading-tight line-clamp-3">
                          {mandala.centerTheme || "テーマ"}
                        </p>
                      )}
                    </div>
                  );
                }

                const cell = getCellAt(pos);
                const hasContent = cell && cell.title;
                return (
                  <button
                    key={gridIndex}
                    onClick={() => setEditingPos(pos)}
                    className={`aspect-square rounded-xl border flex flex-col items-center justify-center p-2 transition-all hover:border-stone-400 hover:bg-white ${
                      hasContent
                        ? "border-stone-200 bg-white/70"
                        : "border-dashed border-stone-200 bg-transparent"
                    }`}
                  >
                    {hasContent ? (
                      <>
                        <p className="text-[10px] font-medium text-stone-700 text-center leading-tight line-clamp-3">
                          {cell.title}
                        </p>
                        {cell.recordLinks.length > 0 && (
                          <span className="mt-1 text-[9px] font-mono text-stone-400">
                            {cell.recordLinks.length}件
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-stone-300 text-lg">＋</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* 統計 */}
            <SectionLabel>今期の記録</SectionLabel>
            <div className="mb-6 grid grid-cols-3 gap-3">
              {[
                { label: "入力済みセル", value: mandala.cells.filter((c) => c.title).length, unit: "/ 8" },
                { label: "達成記録", value: totalRecords, unit: "件" },
                { label: "期間", value: `Q${quarter}`, unit: `${year}` },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-stone-200 bg-white/70 p-3 text-center">
                  <p className="font-[family-name:var(--font-serif)] text-xl font-bold text-stone-800">
                    {stat.value}
                    <span className="text-xs font-sans font-normal text-stone-400 ml-0.5">{stat.unit}</span>
                  </p>
                  <p className="text-[10px] text-stone-400 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* セル一覧 */}
            {mandala.cells.filter((c) => c.title).length > 0 && (
              <>
                <SectionLabel>セル詳細</SectionLabel>
                <ul className="flex flex-col gap-2">
                  {mandala.cells
                    .filter((c) => c.title)
                    .sort((a, b) => a.position - b.position)
                    .map((cell) => (
                      <li
                        key={cell.id}
                        className="flex items-start gap-3 rounded-xl border border-stone-200 bg-white/70 p-4 cursor-pointer hover:border-stone-400 transition-colors"
                        onClick={() => setEditingPos(cell.position)}
                      >
                        <span className="text-[10px] font-mono text-stone-300 mt-0.5 shrink-0">
                          {String(cell.position + 1).padStart(2, "0")}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-stone-800">{cell.title}</p>
                          {cell.memo && (
                            <p className="mt-1 text-xs text-stone-400 leading-relaxed">{cell.memo}</p>
                          )}
                          {cell.recordLinks.length > 0 && (
                            <p className="mt-1 text-[10px] text-stone-300">
                              達成記録 <span className="font-mono text-stone-500">{cell.recordLinks.length}</span>件
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                </ul>
              </>
            )}
          </>
        )}
      </div>

      {/* セル編集モーダル */}
      {editingPos !== null && mandala && (
        <CellEditor
          cell={getCellAt(editingPos)}
          position={editingPos}
          mandalaId={mandala.id}
          onSave={handleCellSaved}
          onClose={() => setEditingPos(null)}
        />
      )}
    </div>
  );
}
