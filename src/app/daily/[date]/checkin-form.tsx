"use client";

import { useActionState, useState } from "react";
import { upsertDailyEntry, type ActionState } from "@/app/actions/daily";
import { Button, Card, Input, Textarea, Badge, SectionLabel } from "@/components/ui";

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
  const [achievements, setAchievements] = useState<Achievement[]>(initialAchievements);
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
        <SectionLabel>今日の気分</SectionLabel>
        <div className="flex gap-2">
          {MOOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setMood(mood === opt.value ? null : opt.value)}
              className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-3 text-2xl transition-colors ${
                mood === opt.value
                  ? "bg-amber-100 ring-2 ring-amber-300"
                  : "border border-stone-200 bg-white/70 hover:bg-white"
              }`}
            >
              {opt.emoji}
              <span className="text-[10px] font-mono text-stone-400">
                {opt.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 達成リスト */}
      <section>
        <SectionLabel>今日の達成</SectionLabel>

        {achievements.length > 0 && (
          <ul className="mb-3 flex flex-col gap-2">
            {achievements.map((a, i) => (
              <li key={i}>
                <Card padding="sm" className="flex items-start justify-between gap-2">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-sm text-stone-800">{a.text}</span>
                    {a.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {a.tags.map((tag) => (
                          <Badge key={tag} variant="stone">#{tag}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAchievement(i)}
                    className="mt-0.5 text-stone-300 hover:text-red-400 transition-colors text-sm"
                    aria-label="削除"
                  >
                    ✕
                  </button>
                </Card>
              </li>
            ))}
          </ul>
        )}

        {/* 新規追加 */}
        <Card>
          <Input
            type="text"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addAchievement())}
            placeholder="やったこと・達成したことを入力"
            maxLength={200}
          />

          {/* タグ */}
          <div className="mt-2 flex flex-wrap items-center gap-1">
            {newTags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-500"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="text-stone-300 hover:text-red-400 transition-colors"
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
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                placeholder="タグを追加（Enter）"
                maxLength={20}
                className="min-w-0 flex-1 rounded-lg bg-[#f9f6ef] px-2 py-1 text-xs text-stone-700 placeholder-stone-300 outline-none focus:ring-1 focus:ring-stone-300"
              />
            )}
          </div>

          <div className="mt-3 flex justify-end">
            <Button
              type="button"
              onClick={addAchievement}
              disabled={!newText.trim()}
              size="sm"
            >
              追加
            </Button>
          </div>
        </Card>
      </section>

      {/* 今日のまとめ */}
      <section>
        <SectionLabel>
          今日のまとめ
          <span className="ml-2 text-[10px] font-normal normal-case tracking-normal text-stone-300">任意</span>
        </SectionLabel>
        <Textarea
          name="summary"
          defaultValue={initialSummary ?? ""}
          rows={3}
          maxLength={500}
          placeholder="今日を一言で振り返ると…"
        />
      </section>

      {/* 明日やりたいこと */}
      <section>
        <SectionLabel>
          明日やりたいこと
          <span className="ml-2 text-[10px] font-normal normal-case tracking-normal text-stone-300">任意</span>
        </SectionLabel>
        <Textarea
          name="tomorrowNote"
          defaultValue={initialTomorrowNote ?? ""}
          rows={2}
          maxLength={500}
          placeholder="明日の自分へ一言…"
        />
      </section>

      {/* フィードバック */}
      {state.error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          記録しました！
        </p>
      )}

      {/* 保存 */}
      <Button
        type="submit"
        disabled={pending}
        className="w-full py-4 text-base font-semibold rounded-xl"
      >
        {pending ? "保存中…" : "今日を刻む"}
      </Button>
    </form>
  );
}
