"use client";

import { useActionState, useState } from "react";
import { upsertDailyEntry, type ActionState } from "@/app/actions/daily";

const MOOD_OPTIONS = [
  { value: 1, emoji: "😞", label: "つらい" },
  { value: 2, emoji: "😕", label: "しんどい" },
  { value: 3, emoji: "😐", label: "ふつう" },
  { value: 4, emoji: "🙂", label: "よかった" },
  { value: 5, emoji: "😁", label: "最高" },
];

type Achievement = { text: string; tags: string[] };

type Props = {
  date: string;
  initialMood?: number | null;
  initialSummary?: string | null;
  initialTomorrowNote?: string | null;
  initialAchievements?: Achievement[];
};

export function CheckinForm({
  date,
  initialMood,
  initialSummary,
  initialTomorrowNote,
  initialAchievements = [],
}: Props) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    upsertDailyEntry,
    {}
  );

  const [mood, setMood] = useState<number | null>(initialMood ?? null);
  const [achievements, setAchievements] =
    useState<Achievement[]>(initialAchievements);
  const [newText, setNewText] = useState("");
  const [newTagInput, setNewTagInput] = useState("");
  const [newTags, setNewTags] = useState<string[]>([]);

  function addAchievement() {
    const text = newText.trim();
    if (!text) return;
    setAchievements((prev) => [...prev, { text, tags: newTags }]);
    setNewText("");
    setNewTagInput("");
    setNewTags([]);
  }

  function removeAchievement(index: number) {
    setAchievements((prev) => prev.filter((_, i) => i !== index));
  }

  function addTag() {
    const tag = newTagInput.trim();
    if (!tag || newTags.length >= 5 || newTags.includes(tag)) return;
    setNewTags((prev) => [...prev, tag]);
    setNewTagInput("");
  }

  function removeTag(tag: string) {
    setNewTags((prev) => prev.filter((t) => t !== tag));
  }

  function handleSubmit(formData: FormData) {
    formData.set("mood", mood?.toString() ?? "");
    formData.set("achievements", JSON.stringify(achievements));
    action(formData);
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-6">
      <input type="hidden" name="date" value={date} />

      {/* 気分 */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          今日の気分
        </h2>
        <div className="flex gap-2">
          {MOOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setMood(mood === opt.value ? null : opt.value)}
              className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-3 text-2xl transition-colors ${
                mood === opt.value
                  ? "bg-amber-100 dark:bg-amber-900 ring-2 ring-amber-400"
                  : "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              {opt.emoji}
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {opt.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 達成リスト */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          今日の達成
        </h2>

        {achievements.length > 0 && (
          <ul className="mb-3 flex flex-col gap-2">
            {achievements.map((a, i) => (
              <li
                key={i}
                className="flex items-start justify-between gap-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 px-4 py-3"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-zinc-800 dark:text-zinc-200">
                    {a.text}
                  </span>
                  {a.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {a.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-zinc-200 dark:bg-zinc-700 px-2 py-0.5 text-xs text-zinc-600 dark:text-zinc-300"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeAchievement(i)}
                  className="mt-0.5 text-zinc-400 hover:text-red-500 transition-colors"
                  aria-label="削除"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* 新規追加 */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 p-3 flex flex-col gap-2">
          <input
            type="text"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addAchievement())}
            placeholder="やったこと・達成したことを入力"
            maxLength={200}
            className="w-full rounded-lg bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600"
          />

          {/* タグ */}
          <div className="flex flex-wrap items-center gap-1">
            {newTags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 rounded-full bg-zinc-200 dark:bg-zinc-700 px-2 py-0.5 text-xs text-zinc-600 dark:text-zinc-300"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="text-zinc-400 hover:text-red-500"
                >
                  ✕
                </button>
              </span>
            ))}
            {newTags.length < 5 && (
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addTag())
                }
                placeholder="タグを追加（Enter）"
                maxLength={20}
                className="min-w-0 flex-1 rounded-lg bg-zinc-50 dark:bg-zinc-800 px-2 py-1 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 outline-none focus:ring-1 focus:ring-zinc-300 dark:focus:ring-zinc-600"
              />
            )}
          </div>

          <button
            type="button"
            onClick={addAchievement}
            disabled={!newText.trim()}
            className="self-end rounded-lg bg-zinc-900 dark:bg-zinc-100 px-4 py-1.5 text-xs font-medium text-zinc-50 dark:text-zinc-900 disabled:opacity-40 hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors"
          >
            追加
          </button>
        </div>
      </section>

      {/* 今日のまとめ */}
      <section>
        <h2 className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          今日のまとめ
          <span className="ml-2 text-xs font-normal text-zinc-400">任意</span>
        </h2>
        <textarea
          name="summary"
          defaultValue={initialSummary ?? ""}
          rows={3}
          maxLength={500}
          placeholder="今日を一言で振り返ると…"
          className="w-full resize-none rounded-xl bg-zinc-50 dark:bg-zinc-800 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600"
        />
      </section>

      {/* 明日やりたいこと */}
      <section>
        <h2 className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          明日やりたいこと
          <span className="ml-2 text-xs font-normal text-zinc-400">任意</span>
        </h2>
        <textarea
          name="tomorrowNote"
          defaultValue={initialTomorrowNote ?? ""}
          rows={2}
          maxLength={500}
          placeholder="明日の自分へ一言…"
          className="w-full resize-none rounded-xl bg-zinc-50 dark:bg-zinc-800 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600"
        />
      </section>

      {/* フィードバック */}
      {state.error && (
        <p className="rounded-xl bg-red-50 dark:bg-red-950 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-xl bg-emerald-50 dark:bg-emerald-950 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400">
          記録しました！
        </p>
      )}

      {/* 保存 */}
      <button
        type="submit"
        disabled={pending}
        className="rounded-2xl bg-zinc-900 dark:bg-zinc-50 py-4 text-base font-semibold text-zinc-50 dark:text-zinc-900 disabled:opacity-50 hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
      >
        {pending ? "保存中…" : "今日を記録する"}
      </button>
    </form>
  );
}
