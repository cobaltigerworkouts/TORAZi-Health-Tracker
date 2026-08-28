import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  Dumbbell,
  Utensils,
  Pill,
  TestTube2,
  LayoutDashboard,
  Plus,
  Trash2,
  Activity,
  Loader2,
  AlertTriangle,
  Copy,
  Check,
  Download,
  Cigarette,
  ListChecks,
  CheckSquare,
  Square,
  Camera,
  X,
  Image as ImageIcon,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";

/* ---------------------------------------------------------
   カラー・トークン（"バイタルモニター"をコンセプトにした配色）
--------------------------------------------------------- */
const C = {
  bg: "#0B120F",
  panel: "#121B16",
  panelAlt: "#182420",
  border: "#233229",
  text: "#E9F3ED",
  textMuted: "#7FA090",
  mint: "#6FFFB0",
  mintDim: "#3FA87A",
  coral: "#FF7A59",
  amber: "#FFB454",
  danger: "#FF5C5C",
};

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans+JP:wght@400;500;700&display=swap');`;

/* ---------------------------------------------------------
   TORAZi DB Master（ユーザー提供のトレーニング・サプリ台帳）
--------------------------------------------------------- */
const MASTER_COMMON = {
  key: "common",
  label: "虎コン",
  items: [
    "ストレッチポール",
    "肩甲骨下制(ポール)",
    "肩甲骨ストレッチ(ポール)",
    "腰捻り胸開き",
    "股関節回し",
    "脇腹と股関節のストレッチ",
    "ABS PUSH 15回×3set",
    "ヒップリフト 10回×3set",
    "股関節ストレッチ(ポール)",
    "股割ストレッチ",
    "肩甲骨リリース",
    "Cat and Dog",
    "HIP MOBILITY 40回×1set",
    "四つ這い体幹トレーニング 20回×1set",
    "プランク 45秒×3set",
    "カーフレイズ 15回×3set",
  ],
};

const EX = (name, type, extraLabel) => ({ name, type, extraLabel });

const MASTER_DAYS = [
  {
    key: "chest",
    label: "胸",
    exercises: [
      EX("ベンチプレス", "weight_reps"),
      EX("インクラインベンチプレス", "weight_reps"),
      EX("ダンベルフライ", "weight_reps"),
      EX("下部狙いケーブルフライ", "weight_reps"),
      EX("アームカール", "weight_reps"),
      EX("フレンチプレス", "weight_reps"),
      EX("プッシュダウン", "weight_reps"),
      EX("クランチ", "weight_reps"),
      EX("ロータリートーソー", "weight_reps"),
      EX("レッグレイズ", "reps_only"),
      EX("リクラインバイク", "cardio", "レベル"),
      EX("ウォーキング", "cardio", "傾斜"),
    ],
  },
  {
    key: "back",
    label: "背",
    exercises: [
      EX("デッドリフト", "weight_reps"),
      EX("ベントオーバーロー", "weight_reps"),
      EX("ラットプルダウン", "weight_reps"),
      EX("プル・ロウ", "weight_reps"),
      EX("ショルダープレス", "weight_reps"),
      EX("ラテラルレイズ", "weight_reps"),
      EX("クランチ", "weight_reps"),
      EX("ロータリートーソー", "weight_reps"),
      EX("レッグレイズ", "reps_only"),
      EX("リクラインバイク", "cardio", "レベル"),
      EX("ウォーキング", "cardio", "傾斜"),
    ],
  },
  {
    key: "legs",
    label: "脚",
    exercises: [
      EX("スミススクワット", "weight_reps"),
      EX("スミスランジ", "weight_reps"),
      EX("レッグエクステンション", "weight_reps"),
      EX("レッグカール", "weight_reps"),
      EX("クランチ", "weight_reps"),
      EX("ロータリートーソー", "weight_reps"),
      EX("レッグレイズ", "reps_only"),
      EX("リクラインバイク", "cardio", "レベル"),
      EX("ウォーキング", "cardio", "傾斜"),
    ],
  },
  {
    key: "glutes",
    label: "尻",
    exercises: [
      EX("ワイドレッグプレス", "weight_reps"),
      EX("スミスブルガリアンスクワット", "weight_reps"),
      EX("スミスヒップスラスト", "weight_reps"),
      EX("ヒップアブダクション", "weight_reps"),
      EX("アダクション", "weight_reps"),
      EX("クランチ", "weight_reps"),
      EX("ロータリートーソー", "weight_reps"),
      EX("レッグレイズ", "reps_only"),
      EX("リクラインバイク", "cardio", "レベル"),
      EX("ウォーキング", "cardio", "傾斜"),
    ],
  },
  {
    key: "recovery",
    label: "整",
    exercises: [
      EX("クランチ", "weight_reps"),
      EX("ロータリートーソー", "weight_reps"),
      EX("レッグレイズ", "reps_only"),
      EX("リクラインバイク", "cardio", "レベル"),
      EX("ウォーキング", "cardio", "傾斜"),
    ],
  },
];

const SUPPLEMENTS = {
  morning: ["ニュートリプロテイン15g", "ニュートリトリプルX", "パーソナルプロバイオ", "ビタミンBプラス", "カルマグ", "セルアクト", "アイブレンド"],
  night: ["ニュートリプロテイン15g", "ニュートリトリプルX", "ビタミンBプラス", "カルマグ", "セルアクト", "GABA"],
};

const STORAGE_KEY = "health_data";
// Googleスプレッドシートへのリアルタイム自動送信用Webhook (Google Apps Script)
const GOOGLE_SHEET_WEBHOOK_URL =
  "https://script.google.com/macros/s/AKfycbwY5_51dIVowqYdAW5XFlfyGCuOckC45EBBi5ycG0ECU9kXg3XhN6znlp-qYGIGV3Jmtw/exec";

function sendToGoogleSheet(category, item) {
  try {
    fetch(GOOGLE_SHEET_WEBHOOK_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ category, payload: item }),
    }).catch(() => {
      // 送信失敗はアプリの動作に一切影響させない
    });
  } catch (e) {
    // 送信失敗はアプリの動作に一切影響させない
  }
}
const todayStr = () => new Date().toISOString().slice(0, 10);
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const fmtDate = (d) => {
  if (!d) return "";
  const [y, m, day] = d.split("-");
  return `${m}/${day}`;
};

function buildTrainingSummaryText(training, conditioning) {
  const lines = [];
  if (training.length > 0) {
    const sorted = [...training].sort((a, b) => (a.date < b.date ? -1 : 1));
    lines.push(
      ...sorted.map(
        (t) => `${t.date} ${t.exercise} ${formatTrainingEntry(t)}${t.memo ? ` メモ:${t.memo}` : ""}`
      )
    );
  }
  if (conditioning && conditioning.length > 0) {
    const byDate = {};
    conditioning.forEach((c) => {
      byDate[c.date] = byDate[c.date] || [];
      byDate[c.date].push(c.item);
    });
    Object.entries(byDate)
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .forEach(([date, items]) => {
        lines.push(`${date} [虎コン実施] ${items.join(" / ")}`);
      });
  }
  if (lines.length === 0) return "トレーニング記録がまだありません。";
  return `【トレーニングログ】\n${lines.join("\n")}`;
}

function buildFullSummaryText(data) {
  const parts = [];
  parts.push(buildTrainingSummaryText(data.training, data.conditioning));
  if (data.diet.length) {
    parts.push(
      "【食事ログ】\n" +
        [...data.diet]
          .sort((a, b) => (a.date < b.date ? -1 : 1))
          .map((d) => `${d.date} ${d.mealType} ${d.content}${d.memo ? ` メモ:${d.memo}` : ""}`)
          .join("\n")
    );
  }
  if (data.intake.length) {
    parts.push(
      "【サプリ・薬ログ】\n" +
        [...data.intake]
          .sort((a, b) => (a.date < b.date ? -1 : 1))
          .map((i) => `${i.date} [${i.type}] ${i.name} ${i.dose || ""} ${i.timing || ""}`)
          .join("\n")
    );
  }
  if (data.smoking.length) {
    parts.push(
      "【タバコ】\n" +
        [...data.smoking]
          .sort((a, b) => (a.date < b.date ? -1 : 1))
          .map((s) => `${s.date} ${s.time || ""} ${s.count || 1}本目 点数:${s.score || ""} 体感:${s.memo || ""}`)
          .join("\n")
    );
  }
  if (data.treats.length) {
    parts.push(
      "【お菓子・お酒】\n" +
        [...data.treats]
          .sort((a, b) => (a.date < b.date ? -1 : 1))
          .map((t) => `${t.date} ${t.time || ""} [${t.type}] ${t.content}`)
          .join("\n")
    );
  }
  if (data.bodyMetrics.length) {
    parts.push(
      "【体重・体組成】\n" +
        [...data.bodyMetrics]
          .sort((a, b) => (a.date < b.date ? -1 : 1))
          .map(
            (m) =>
              `${m.date} 体重${m.weight}kg${m.bodyFat ? ` 体脂肪率${m.bodyFat}%` : ""}${m.bodyFatMass ? ` 体脂肪量${m.bodyFatMass}kg` : ""}${
                m.muscleMass ? ` 筋肉量${m.muscleMass}kg` : ""
              }${m.bmr ? ` 基礎代謝${m.bmr}kcal` : ""}`
          )
          .join("\n")
    );
  }
  if (data.healthRecords.length) {
    parts.push(
      "【血液検査・健診】\n" +
        [...data.healthRecords]
          .sort((a, b) => (a.date < b.date ? -1 : 1))
          .map((r) => `${r.date} [${r.type}] ${r.testName} ${r.value}${r.unit}${r.refRange ? ` (基準:${r.refRange})` : ""}`)
          .join("\n")
    );
  }
  return parts.join("\n\n");
}

const emptyData = () => ({
  training: [],
  diet: [],
  intake: [], // サプリ・薬
  smoking: [], // タバコ
  treats: [], // お菓子・お酒
  conditioning: [], // 虎コン(実施チェックのみ)
  bodyMetrics: [], // 体重・体脂肪率・筋肉量
  healthRecords: [], // 血液検査・健康診断
});

function csvEscape(v) {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function buildCsv(data) {
  const rows = [["カテゴリ", "日付", "時刻", "項目", "値1", "値2", "値3", "メモ"]];
  data.training.forEach((t) =>
    rows.push(
      t.kind === "cardio"
        ? ["トレーニング", t.date, "", t.exercise, t.extra ? `${t.extraLabel || ""}${t.extra}` : "", t.distance ? `${t.distance}km` : "", t.duration ? formatDuration(t.duration) : "", t.memo || ""]
        : ["トレーニング", t.date, "", t.exercise, `${t.weight || 0}kg`, `${t.reps || 0}rep`, `${t.sets || 0}set`, t.memo || ""]
    )
  );
  data.conditioning.forEach((c) => rows.push(["虎コン", c.date, "", c.item, "実施済", "", "", ""]));
  data.diet.forEach((d) => rows.push(["食事", d.date, d.time || "", d.mealType, d.content, "", "", d.memo || ""]));
  data.intake.forEach((i) => rows.push([i.type, i.date, "", i.name, i.dose || "", i.timing || "", "", i.memo || ""]));
  data.smoking.forEach((s) => rows.push(["タバコ", s.date, s.time || "", `${s.count || 1}本目`, s.score || "", "", "", s.memo || ""]));
  data.treats.forEach((t) => rows.push([t.type, t.date, t.time || "", t.content, "", "", "", t.memo || ""]));
  data.bodyMetrics.forEach((m) =>
    rows.push([
      "体組成",
      m.date,
      "",
      "体重",
      `${m.weight}kg`,
      m.bodyFat ? `体脂肪率${m.bodyFat}%` : "",
      m.bodyFatMass ? `体脂肪量${m.bodyFatMass}kg` : "",
      `${m.muscleMass ? `筋肉量${m.muscleMass}kg ` : ""}${m.bmr ? `基礎代謝${m.bmr}kcal` : ""}`.trim(),
    ])
  );
  data.healthRecords.forEach((r) => rows.push([r.type, r.date, "", r.testName, `${r.value}${r.unit}`, r.refRange || "", "", r.memo || ""]));
  return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
}

function downloadCsv(data) {
  const csv = "\uFEFF" + buildCsv(data);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `TORAZi-actual-db-${todayStr()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ---------------------------------------------------------
   汎用: フォーム入力 UI
--------------------------------------------------------- */
function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm" style={{ color: C.textMuted }}>
      <span>{label}</span>
      {children}
    </label>
  );
}

const inputStyle = {
  background: C.panelAlt,
  border: `1px solid ${C.border}`,
  color: C.text,
  borderRadius: 7,
  padding: "13px 15px",
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: 16.5,
  outline: "none",
  width: "100%",
};

function Input(props) {
  return <input {...props} style={{ ...inputStyle, ...(props.style || {}) }} />;
}
function Select(props) {
  return (
    <select {...props} style={{ ...inputStyle, ...(props.style || {}) }}>
      {props.children}
    </select>
  );
}

function PrimaryButton({ children, onClick, type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="flex items-center justify-center gap-1.5 transition-opacity hover:opacity-90"
      style={{
        background: C.mint,
        color: "#06120C",
        fontWeight: 600,
        fontSize: 16.5,
        borderRadius: 7,
        padding: "13px 20px",
        fontFamily: "'IBM Plex Sans JP', sans-serif",
      }}
    >
      {children}
    </button>
  );
}

function IconGhostButton({ onClick, title, danger }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="transition-colors"
      style={{
        color: danger ? C.danger : C.textMuted,
        padding: 7,
        borderRadius: 7,
        background: "transparent",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = C.panelAlt)}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <Trash2 size={17} />
    </button>
  );
}

function CopyButton({ getText, label = "Claude用にコピー" }) {
  const [copied, setCopied] = useState(false);
  const doCopy = async () => {
    try {
      await navigator.clipboard.writeText(getText());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (e) {
      // クリップボード権限がない環境向けフォールバック
      setCopied(false);
    }
  };
  return (
    <button
      onClick={doCopy}
      className="flex items-center gap-1.5 transition-opacity hover:opacity-90"
      style={{
        background: "transparent",
        border: `1px solid ${C.mint}`,
        color: C.mint,
        fontSize: 15.5,
        borderRadius: 7,
        padding: "11px 16px",
        fontFamily: "'IBM Plex Sans JP', sans-serif",
      }}
    >
      {copied ? <Check size={16} /> : <Copy size={16} />}
      {copied ? "コピーしました" : label}
    </button>
  );
}

function Panel({ children, style }) {
  return (
    <div
      style={{
        background: C.panel,
        border: `1px solid ${C.border}`,
        borderRadius: 11,
        padding: 18,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SectionTitle({ children, accent, bold }) {
  return (
    <h3
      style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 15.5,
        letterSpacing: "0.08em",
        color: accent || C.mint,
        marginBottom: 14,
        textTransform: "uppercase",
        fontWeight: bold ? 700 : 400,
      }}
    >
      {children}
    </h3>
  );
}

function EmptyState({ text }) {
  return (
    <div
      style={{
        color: C.textMuted,
        fontSize: 14.5,
        padding: "26px 10px",
        textAlign: "center",
        border: `1px dashed ${C.border}`,
        borderRadius: 8,
      }}
    >
      {text}
    </div>
  );
}

/* ---------------------------------------------------------
   トレーニング タブ
--------------------------------------------------------- */
const FEELING_OPTIONS = [
  { value: "", label: "" },
  { value: "限界", label: "限界(8回不可)" },
  { value: "キツ", label: "キツ(10回不可)" },
  { value: "最適", label: "最適(10回可能)" },
  { value: "普通", label: "普通(12回可能)" },
  { value: "余裕", label: "余裕(15回可能)" },
];
const SMOKING_FEELING_OPTIONS = ["", "ルーティン", "イライラ", "なんとなく", "もらいタバコ", "ひと息", "落ち着いた", "その他"];

function formatDuration(d) {
  if (!d) return "";
  if (d.includes(":")) {
    const [m, s] = d.split(":");
    return `${m}分${Number(s) > 0 ? `${s}秒` : ""}`;
  }
  return `${d}分`;
}

function formatTrainingEntry(t) {
  if (t.kind === "cardio") {
    const parts = [];
    if (t.extra) parts.push(`${t.extraLabel || ""}${t.extra}`);
    if (t.distance) parts.push(`${t.distance}km`);
    if (t.duration) parts.push(formatDuration(t.duration));
    return parts.length ? parts.join(" ・ ") : "記録なし";
  }
  return `${t.weight || 0}kg×${t.reps || 0}rep×${t.sets || 0}set`;
}

// 4桁(MMSS)のテンキー入力を分:秒に変換。4桁でない、または秒が60以上の場合は不正。
function parseDurationRaw(raw) {
  if (!raw) return { valid: true, value: "" };
  if (!/^\d{4}$/.test(raw)) return { valid: false, value: "" };
  const mm = raw.slice(0, 2);
  const ss = raw.slice(2, 4);
  if (Number(ss) > 59) return { valid: false, value: "" };
  return { valid: true, value: `${Number(mm)}:${ss}` };
}

function DurationInput({ raw, onChange, error }) {
  return (
    <div>
      <Input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={4}
        placeholder="例: 3025"
        value={raw}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 4))}
        style={{ width: 100 }}
      />
      <div style={{ fontSize: 12.5, color: error ? C.danger : C.textMuted, marginTop: 3 }}>
        {error ? "4桁・下2桁は59以下で入力してください(例:3025→30分25秒)" : "分秒を4桁で(例:3025→30分25秒、下2桁は59まで)"}
      </div>
    </div>
  );
}

// 4桁(HHMM)のテンキー入力をHH:MMに変換。4桁でない、時が24以上、分が60以上の場合は不正。
function parseTimeRaw(raw) {
  if (!raw) return { valid: true, value: "" };
  if (!/^\d{4}$/.test(raw)) return { valid: false, value: "" };
  const hh = raw.slice(0, 2);
  const mm = raw.slice(2, 4);
  if (Number(hh) > 23 || Number(mm) > 59) return { valid: false, value: "" };
  return { valid: true, value: `${hh}:${mm}` };
}

function TimeInput({ raw, onChange, error }) {
  return (
    <div>
      <Input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={4}
        placeholder="例: 0830"
        value={raw}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 4))}
        style={{ width: 100 }}
      />
      <div style={{ fontSize: 12.5, color: error ? C.danger : C.textMuted, marginTop: 3 }}>
        {error ? "4桁・24時間表記で正しく入力してください(例:0830→08:30)" : "未入力なら記録ボタンを押した時刻になります"}
      </div>
    </div>
  );
}

function lastSetsForExercise(training, name) {
  const entries = training.filter((t) => t.exercise === name).sort((a, b) => (a.date < b.date ? 1 : -1));
  if (entries.length === 0) return null;
  const latestDate = entries[0].date;
  return { date: latestDate, sets: entries.filter((e) => e.date === latestDate) };
}

function ExerciseCard({ exercise, training, state, onChangeRow, onChangeCardio, onChangeFeeling, durationError }) {
  const last = lastSetsForExercise(training, exercise.name);
  const lastLabel = last
    ? `前回(${fmtDate(last.date)}): ${last.sets
        .map((s) =>
          exercise.type === "weight_reps"
            ? `${s.weight || 0}kg×${s.reps || 0}`
            : exercise.type === "cardio"
            ? `${s.extra ? `${exercise.extraLabel}${s.extra} ` : ""}${s.distance ? `${s.distance}km ` : ""}${formatDuration(s.duration) || "0分"}`
            : `${s.reps || 0}回`
        )
        .join(" / ")}`
    : null;

  const rowLabels = ["①", "②", "③", "④"];

  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: 12, background: C.panelAlt }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
        <span style={{ fontSize: 14.5, fontWeight: 600 }}>□ {exercise.name}</span>
      </div>
      {lastLabel && (
        <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 8, fontFamily: "'IBM Plex Mono', monospace" }}>{lastLabel}</div>
      )}

      {exercise.type === "cardio" ? (
        <div className="flex flex-wrap items-start gap-3">
          {exercise.extraLabel && (
            <Field label={exercise.extraLabel}>
              <Input
                type="text"
                inputMode="decimal"
                placeholder="0"
                value={state.cardio.extra}
                onChange={(e) => onChangeCardio({ extra: e.target.value.replace(/[^0-9.]/g, "") })}
                style={{ width: 96 }}
              />
            </Field>
          )}
          <Field label="距離(km)">
            <Input
              type="text"
              inputMode="decimal"
              value={state.cardio.distance}
              onChange={(e) => onChangeCardio({ distance: e.target.value.replace(/[^0-9.]/g, "") })}
              style={{ width: 106 }}
            />
          </Field>
          <Field label="時間(4桁)">
            <DurationInput raw={state.cardio.durationRaw} onChange={(v) => onChangeCardio({ durationRaw: v })} error={durationError} />
          </Field>
          <Field label="体感">
            <Select value={state.feeling} onChange={(e) => onChangeFeeling(e.target.value)} style={{ width: 200 }}>
              {FEELING_OPTIONS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.value === "" ? "選択" : f.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {state.rows.map((row, i) => {
            const locked = i > 0 && (state.rows[i - 1].reps === "" || !state.rows[i - 1].feeling);
            const repsLocked = locked || (exercise.type === "weight_reps" && row.weight === "");
            const feelingLocked = locked || repsLocked || row.reps === "";
            return (
              <div key={i} className="flex flex-nowrap items-center gap-1" style={{ fontSize: 13, opacity: locked ? 0.4 : 1 }}>
                <span style={{ color: C.textMuted, width: 14, flexShrink: 0, fontFamily: "'IBM Plex Mono', monospace" }}>{rowLabels[i]}</span>
                {exercise.type === "weight_reps" && (
                  <>
                    <Input
                      type="text"
                      inputMode="decimal"
                      placeholder="0"
                      value={row.weight}
                      disabled={locked}
                      onChange={(e) => onChangeRow(i, { weight: e.target.value.replace(/[^0-9.]/g, "") })}
                      style={{ width: 52, padding: "10px 6px", flexShrink: 0 }}
                    />
                    <span style={{ color: C.textMuted, flexShrink: 0, fontSize: 12 }}>kg×</span>
                  </>
                )}
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="0"
                  value={row.reps}
                  disabled={repsLocked}
                  onChange={(e) => onChangeRow(i, { reps: e.target.value.replace(/\D/g, "") })}
                  style={{ width: 40, padding: "10px 6px", flexShrink: 0, opacity: repsLocked && !locked ? 0.4 : 1 }}
                />
                <span style={{ color: C.textMuted, flexShrink: 0, fontSize: 12 }}>回</span>
                <Select
                  value={row.feeling || ""}
                  disabled={feelingLocked}
                  onChange={(e) => onChangeRow(i, { feeling: e.target.value })}
                  style={{ width: 128, padding: "10px 4px", flexShrink: 1, fontSize: 12, opacity: feelingLocked && !locked ? 0.4 : 1 }}
                >
                  {FEELING_OPTIONS.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.value === "" ? "体感" : f.label}
                    </option>
                  ))}
                </Select>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TrainingTab({ data, addItem, removeItem }) {
  const [form, setForm] = useState({
    date: todayStr(),
    exercise: "",
    weight: "",
    sets: "",
    reps: "",
    durationRaw: "",
    memo: "",
  });
  const [durationErr, setDurationErr] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);

  const submit = () => {
    if (!form.exercise) return;
    const parsed = parseDurationRaw(form.durationRaw);
    if (!parsed.valid) {
      setDurationErr(true);
      return;
    }
    setDurationErr(false);
    addItem("training", { date: form.date, exercise: form.exercise, weight: form.weight, sets: form.sets, reps: form.reps, duration: parsed.value, memo: form.memo, id: uid() });
    setForm({ date: todayStr(), exercise: "", weight: "", sets: "", reps: "", durationRaw: "", memo: "" });
  };

  const [pendingConditioning, setPendingConditioning] = useState(new Set());
  const toggleConditioning = (item) => {
    setPendingConditioning((prev) => {
      const next = new Set(prev);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      return next;
    });
  };
  const isConditioningDone = (item) => {
    const saved = data.conditioning.some((c) => c.date === form.date && c.item === item);
    return pendingConditioning.has(item) ? !saved : saved;
  };
  const conditioningDoneCount = MASTER_COMMON.items.filter((item) => isConditioningDone(item)).length;
  const allConditioningDone = MASTER_COMMON.items.every((item) => isConditioningDone(item));
  const toggleAllConditioning = () => {
    const target = !allConditioningDone;
    setPendingConditioning((prev) => {
      const next = new Set(prev);
      MASTER_COMMON.items.forEach((item) => {
        const saved = data.conditioning.some((c) => c.date === form.date && c.item === item);
        const pending = prev.has(item);
        const displayed = pending ? !saved : saved;
        if (displayed !== target) {
          if (next.has(item)) next.delete(item);
          else next.add(item);
        }
      });
      return next;
    });
  };

  const dayDef = MASTER_DAYS.find((d) => d.key === selectedDay);

  const conditioningByDate = useMemo(() => {
    const map = {};
    data.conditioning.forEach((c) => {
      map[c.date] = map[c.date] || [];
      map[c.date].push(c);
    });
    return Object.entries(map).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [data.conditioning]);

  const emptyExState = () => ({
    rows: [
      { weight: "", reps: "", feeling: "" },
      { weight: "", reps: "", feeling: "" },
      { weight: "", reps: "", feeling: "" },
      { weight: "", reps: "", feeling: "" },
    ],
    cardio: { distance: "", durationRaw: "", extra: "" },
    feeling: "",
  });
  const keyFor = (ex) => `${ex.name}__${ex.type}`;
  const [sessionState, setSessionState] = useState({});
  const [durationErrors, setDurationErrors] = useState({});
  const [bulkSaved, setBulkSaved] = useState(false);

  const getExState = (ex) => sessionState[keyFor(ex)] || emptyExState();

  const updateRow = (ex, i, patch) => {
    const key = keyFor(ex);
    const cur = getExState(ex);
    const rows = cur.rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r));
    setSessionState((prev) => ({ ...prev, [key]: { ...cur, rows } }));
  };
  const updateCardio = (ex, patch) => {
    const key = keyFor(ex);
    const cur = getExState(ex);
    setSessionState((prev) => ({ ...prev, [key]: { ...cur, cardio: { ...cur.cardio, ...patch } } }));
    setDurationErrors((prev) => ({ ...prev, [key]: false }));
  };
  const updateFeeling = (ex, value) => {
    const key = keyFor(ex);
    const cur = getExState(ex);
    setSessionState((prev) => ({ ...prev, [key]: { ...cur, feeling: value } }));
  };

  const saveAllExercises = () => {
    const errors = {};
    let anySaved = false;

    pendingConditioning.forEach((item) => {
      const existing = data.conditioning.find((c) => c.date === form.date && c.item === item);
      if (existing) {
        removeItem("conditioning", existing.id);
      } else {
        addItem("conditioning", { id: uid(), date: form.date, item });
      }
      anySaved = true;
    });
    if (pendingConditioning.size > 0) setPendingConditioning(new Set());

    (dayDef ? dayDef.exercises : []).forEach((ex) => {
      const key = keyFor(ex);
      const st = getExState(ex);
      if (ex.type === "cardio") {
        const parsed = parseDurationRaw(st.cardio.durationRaw);
        if (!parsed.valid) {
          errors[key] = true;
          return;
        }
        if (!st.cardio.distance && !parsed.value && !st.cardio.extra) return;
        addItem("training", {
          id: uid(),
          date: form.date,
          exercise: ex.name,
          kind: "cardio",
          weight: "",
          sets: "",
          reps: "",
          distance: st.cardio.distance,
          duration: parsed.value,
          extraLabel: ex.extraLabel || "",
          extra: st.cardio.extra,
          memo: st.feeling || "",
        });
        anySaved = true;
      } else {
        const filled = st.rows.map((r, i) => ({ ...r, i })).filter((r) => r.weight !== "" || r.reps !== "");
        if (filled.length === 0) return;
        filled.forEach((r) => {
          addItem("training", {
            id: uid(),
            date: form.date,
            exercise: ex.name,
            kind: "strength",
            weight: ex.type === "weight_reps" ? r.weight : "",
            sets: 1,
            reps: r.reps,
            duration: "",
            memo: r.feeling || "",
          });
        });
        anySaved = true;
      }
    });
    if (Object.keys(errors).length > 0) {
      setDurationErrors(errors);
      return;
    }
    setDurationErrors({});
    if (anySaved) {
      if (dayDef) {
        setSessionState((prev) => {
          const next = { ...prev };
          dayDef.exercises.forEach((ex) => delete next[keyFor(ex)]);
          return next;
        });
      }
      setBulkSaved(true);
      setTimeout(() => setBulkSaved(false), 1800);
    }
  };

  const chip = (label, onClick, active) => (
    <button
      key={label}
      onClick={onClick}
      style={{
        padding: "8px 14px",
        borderRadius: 999,
        fontSize: 13.5,
        fontFamily: "'IBM Plex Sans JP', sans-serif",
        background: active ? C.mint : C.panelAlt,
        color: active ? "#06120C" : C.text,
        border: `1px solid ${active ? C.mint : C.border}`,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );

  const volumeByDate = useMemo(() => {
    const map = {};
    data.training.forEach((t) => {
      const vol = (Number(t.weight) || 0) * (Number(t.sets) || 0) * (Number(t.reps) || 0);
      map[t.date] = (map[t.date] || 0) + vol;
    });
    return Object.entries(map)
      .sort((a, b) => (a[0] > b[0] ? 1 : -1))
      .slice(-14)
      .map(([date, vol]) => ({ date: fmtDate(date), vol }));
  }, [data.training]);

  const sorted = [...data.training].sort((a, b) => (a.date < b.date ? 1 : -1));

  const combinedTrainingLog = useMemo(() => {
    const exerciseRows = sorted.map((t) => ({ _kind: "exercise", date: t.date, entry: t }));
    const conditioningRows = conditioningByDate.map(([date, items]) => ({ _kind: "conditioning", date, items }));
    return [...exerciseRows, ...conditioningRows].sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [sorted, conditioningByDate]);

  return (
    <div className="flex flex-col gap-4">
      <Panel>
        <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
          <div className="flex items-center gap-2">
            <ListChecks size={15} color={C.mint} />
            <SectionTitle accent={C.mint}>コンディショニング</SectionTitle>
          </div>
          <span style={{ fontSize: 13, color: C.textMuted, fontFamily: "'IBM Plex Mono', monospace" }}>
            {conditioningDoneCount}/{MASTER_COMMON.items.length} 実施 ・ {fmtDate(form.date)}
          </span>
        </div>
        <p style={{ fontSize: 13, color: C.textMuted, marginBottom: 10 }}>
          重量は関係なし。やったものだけタップしてチェックしてください。
        </p>
        <div className="flex flex-col gap-1.5">
          {MASTER_COMMON.items.map((item) => {
            const done = isConditioningDone(item);
            return (
              <button
                key={item}
                onClick={() => toggleConditioning(item)}
                className="flex items-center gap-2"
                style={{
                  padding: "9px 12px",
                  borderRadius: 6,
                  fontSize: 14,
                  textAlign: "left",
                  background: done ? `${C.mint}1A` : "transparent",
                  color: done ? C.mint : C.text,
                  border: `1px solid ${done ? C.mintDim : C.border}`,
                }}
              >
                {done ? <CheckSquare size={16} /> : <Square size={16} color={C.textMuted} />}
                {item}
              </button>
            );
          })}
          <button
            onClick={toggleAllConditioning}
            className="flex items-center gap-2"
            style={{
              padding: "9px 12px",
              borderRadius: 6,
              fontSize: 14,
              textAlign: "left",
              fontWeight: 600,
              background: allConditioningDone ? `${C.coral}1A` : "transparent",
              color: allConditioningDone ? C.coral : C.textMuted,
              border: `1px solid ${allConditioningDone ? C.coral : C.border}`,
            }}
          >
            {allConditioningDone ? <CheckSquare size={16} /> : <Square size={16} />}
            全て完了
          </button>
        </div>
      </Panel>

      <Panel>
        <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
          <Dumbbell size={15} color={C.text} />
          <SectionTitle accent={C.text} bold>TORAZi 種目メニュー</SectionTitle>
        </div>
        <div className="flex gap-2">
          {MASTER_DAYS.map((d) => {
            const active = selectedDay === d.key;
            return (
              <button
                key={d.key}
                onClick={() => setSelectedDay(d.key === selectedDay ? null : d.key)}
                style={{
                  flex: 1,
                  padding: "14px 4px",
                  borderRadius: 8,
                  fontSize: 24,
                  fontWeight: 700,
                  fontFamily: "'IBM Plex Sans JP', sans-serif",
                  textAlign: "center",
                  background: active ? C.mint : C.panelAlt,
                  color: active ? "#06120C" : C.text,
                  border: `1px solid ${active ? C.mint : C.border}`,
                }}
              >
                {d.label}
              </button>
            );
          })}
        </div>
        {dayDef && (
          <div className="flex flex-col gap-3" style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
            {dayDef.exercises.map((ex) => (
              <ExerciseCard
                key={ex.name + ex.type}
                exercise={ex}
                training={data.training}
                state={getExState(ex)}
                onChangeRow={(i, patch) => updateRow(ex, i, patch)}
                onChangeCardio={(patch) => updateCardio(ex, patch)}
                onChangeFeeling={(v) => updateFeeling(ex, v)}
                durationError={!!durationErrors[keyFor(ex)]}
              />
            ))}
          </div>
        )}
        <div className="flex items-center gap-3" style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
          <PrimaryButton onClick={saveAllExercises}>
            <Plus size={15} /> まとめて記録する
          </PrimaryButton>
          {bulkSaved && (
            <span style={{ fontSize: 13.5, color: C.mint, display: "flex", alignItems: "center", gap: 3 }}>
              <Check size={14} /> 記録しました
            </span>
          )}
        </div>
        <p style={{ fontSize: 13, color: C.textMuted, marginTop: 8 }}>虎コンのチェックもこのボタンでまとめて記録されます。</p>
      </Panel>

      <Panel>
        <SectionTitle>その他の種目を記録</SectionTitle>
        <p style={{ fontSize: 13, color: C.textMuted, marginTop: -8, marginBottom: 10 }}>マスターにない種目はこちらから自由に記録できます。</p>
        <div className="flex flex-col gap-3">
          <Field label="日付">
            <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} style={{ width: 170, maxWidth: "100%" }} />
          </Field>
          <Field label="種目名">
            <Input
              placeholder="ベンチプレス"
              value={form.exercise}
              onChange={(e) => setForm({ ...form, exercise: e.target.value })}
            />
          </Field>
          <Field label="重量 (kg)">
            <Input
              type="text"
              inputMode="decimal"
              value={form.weight}
              onChange={(e) => setForm({ ...form, weight: e.target.value.replace(/[^0-9.]/g, "") })}
            />
          </Field>
          <Field label="回数 (reps)">
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={form.reps}
              onChange={(e) => setForm({ ...form, reps: e.target.value.replace(/\D/g, "") })}
            />
          </Field>
          <Field label="セット数">
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={form.sets}
              onChange={(e) => setForm({ ...form, sets: e.target.value.replace(/\D/g, "") })}
            />
          </Field>
          <Field label="時間 (4桁・任意)">
            <DurationInput
              raw={form.durationRaw}
              onChange={(v) => {
                setForm({ ...form, durationRaw: v });
                setDurationErr(false);
              }}
              error={durationErr}
            />
          </Field>
        </div>
        <div className="mt-3">
          <Field label="メモ">
            <Input value={form.memo} onChange={(e) => setForm({ ...form, memo: e.target.value })} placeholder="調子・フォームなど" />
          </Field>
        </div>
        <div className="mt-4">
          <PrimaryButton onClick={submit}>
            <Plus size={15} /> 記録する
          </PrimaryButton>
        </div>
      </Panel>

      {volumeByDate.length > 0 && (
        <Panel>
          <SectionTitle accent={C.coral}>総ボリューム推移（重量×セット×回数）</SectionTitle>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={volumeByDate}>
              <CartesianGrid stroke={C.border} vertical={false} />
              <XAxis dataKey="date" stroke={C.textMuted} tick={{ fontSize: 13 }} />
              <YAxis stroke={C.textMuted} tick={{ fontSize: 13 }} width={40} />
              <Tooltip contentStyle={{ background: C.panelAlt, border: `1px solid ${C.border}`, fontSize: 13.5 }} />
              <Bar dataKey="vol" fill={C.coral} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      )}

      <Panel>
        <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
          <SectionTitle>ログ</SectionTitle>
          {combinedTrainingLog.length > 0 && (
            <CopyButton getText={() => buildTrainingSummaryText(data.training, data.conditioning)} label="このログをコピー" />
          )}
        </div>
        {combinedTrainingLog.length === 0 ? (
          <EmptyState text="まだ記録がありません。上のフォームから最初のセットを記録しましょう。" />
        ) : (
          <div className="flex flex-col gap-2">
            {combinedTrainingLog.map((row) =>
              row._kind === "exercise" ? (
                <div
                  key={row.entry.id}
                  className="flex items-center justify-between gap-2"
                  style={{ borderBottom: `1px solid ${C.border}`, paddingBottom: 8 }}
                >
                  <div className="flex flex-col">
                    <span style={{ fontSize: 14.5, fontWeight: 500 }}>{row.entry.exercise}</span>
                    <span style={{ fontSize: 13, color: C.textMuted, fontFamily: "'IBM Plex Mono', monospace" }}>
                      {fmtDate(row.entry.date)} ・ {formatTrainingEntry(row.entry)}
                      {row.entry.memo ? ` ・ ${row.entry.memo}` : ""}
                    </span>
                  </div>
                  <IconGhostButton onClick={() => removeItem("training", row.entry.id)} title="削除" danger />
                </div>
              ) : (
                <div key={`cond-${row.date}`} style={{ borderBottom: `1px solid ${C.border}`, paddingBottom: 8 }}>
                  <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
                    <span style={{ fontSize: 14.5, fontWeight: 500, color: C.mint }}>虎コン</span>
                    <span style={{ fontSize: 13, color: C.textMuted, fontFamily: "'IBM Plex Mono', monospace" }}>
                      {fmtDate(row.date)} ・ {row.items.length}/{MASTER_COMMON.items.length} 実施
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {row.items.map((c) => (
                      <span
                        key={c.id}
                        className="flex items-center gap-1"
                        style={{
                          fontSize: 13,
                          color: C.mint,
                          background: `${C.mint}14`,
                          border: `1px solid ${C.mintDim}`,
                          borderRadius: 999,
                          padding: "5px 10px",
                        }}
                      >
                        {c.item}
                        <button onClick={() => removeItem("conditioning", c.id)} style={{ color: C.textMuted, lineHeight: 0 }}>
                          <X size={11} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </Panel>
    </div>
  );
}

/* ---------------------------------------------------------
   食事・サプリ・薬 タブ
--------------------------------------------------------- */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = () => reject(new Error("読み込みに失敗しました"));
    reader.readAsDataURL(file);
  });
}

function nowHHMM() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function MealBlock({ mealType, addItem }) {
  const [timeRaw, setTimeRaw] = useState("");
  const [timeErr, setTimeErr] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoBase64, setPhotoBase64] = useState("");
  const [photoMediaType, setPhotoMediaType] = useState("");
  const [manualText, setManualText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeErr, setAnalyzeErr] = useState("");
  const [submitErr, setSubmitErr] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPhotoChooser, setShowPhotoChooser] = useState(false);
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const handlePhoto = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setAnalyzeErr("");
    setPhotoPreview(URL.createObjectURL(file));
    setSubmitErr(false);
    try {
      const base64 = await fileToBase64(file);
      setPhotoBase64(base64);
      setPhotoMediaType(file.type || "image/jpeg");
      setAnalyzing(true);
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: [
                { type: "image", source: { type: "base64", media_type: file.type || "image/jpeg", data: base64 } },
                { type: "text", text: "この写真に写っている食事の内容を、料理名や主な食材が分かるように日本語で30文字程度で簡潔に記述してください。前置きや説明は不要で、内容の文字列だけを出力してください。" },
              ],
            },
          ],
        }),
      });
      const json = await resp.json();
      const text = (json.content || [])
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("")
        .trim();
      if (text) setManualText(text);
      else setAnalyzeErr("解析結果を取得できませんでした。手動で入力してください。");
    } catch (err) {
      setAnalyzeErr("画像の解析に失敗しました。手動で入力してください。");
    } finally {
      setAnalyzing(false);
    }
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    setPhotoBase64("");
    setPhotoMediaType("");
    setAnalyzeErr("");
  };

  const submit = () => {
    const parsed = parseTimeRaw(timeRaw);
    if (!parsed.valid) {
      setTimeErr(true);
      return;
    }
    setTimeErr(false);
    if (!photoBase64 && !manualText.trim()) {
      setSubmitErr(true);
      return;
    }
    setSubmitErr(false);
    addItem("diet", {
      id: uid(),
      date: todayStr(),
      time: parsed.value || nowHHMM(),
      mealType,
      content: manualText.trim(),
      memo: photoBase64 ? "(写真解析)" : "",
    });
    setTimeRaw("");
    removePhoto();
    setManualText("");
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: 12, background: C.panelAlt }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
        <span style={{ fontSize: 14.5, fontWeight: 600 }}>{mealType}</span>
        {saved && (
          <span style={{ fontSize: 13, color: C.mint, display: "flex", alignItems: "center", gap: 3 }}>
            <Check size={13} /> 記録しました
          </span>
        )}
      </div>

      <div style={{ marginBottom: 10 }}>
        <Field label="時刻(4桁・任意)">
          <TimeInput
            raw={timeRaw}
            onChange={(v) => {
              setTimeRaw(v);
              setTimeErr(false);
            }}
            error={timeErr}
          />
        </Field>
      </div>

      <div style={{ marginBottom: 10, position: "relative" }}>
        <button
          onClick={() => setShowPhotoChooser((v) => !v)}
          className="flex items-center justify-center gap-1.5"
          style={{
            width: "100%",
            border: `1px dashed ${C.mintDim}`,
            color: C.mint,
            fontSize: 14,
            borderRadius: 6,
            padding: "11px 14px",
            cursor: "pointer",
            background: "transparent",
          }}
        >
          <Camera size={15} /> 写真を追加
        </button>
        {showPhotoChooser && (
          <div
            className="flex flex-col gap-1"
            style={{
              marginTop: 6,
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              overflow: "hidden",
              background: C.panel,
            }}
          >
            <button
              onClick={() => {
                setShowPhotoChooser(false);
                cameraInputRef.current && cameraInputRef.current.click();
              }}
              className="flex items-center gap-2"
              style={{ padding: "12px 14px", fontSize: 14, color: C.text, background: "transparent" }}
            >
              <Camera size={15} color={C.mint} /> カメラ
            </button>
            <button
              onClick={() => {
                setShowPhotoChooser(false);
                galleryInputRef.current && galleryInputRef.current.click();
              }}
              className="flex items-center gap-2"
              style={{ padding: "12px 14px", fontSize: 14, color: C.text, background: "transparent", borderTop: `1px solid ${C.border}` }}
            >
              <ImageIcon size={15} color={C.mint} /> 写真フォルダ
            </button>
          </div>
        )}
        <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhoto} style={{ display: "none" }} />
        <input ref={galleryInputRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: "none" }} />
        {photoPreview && (
          <div className="flex items-center gap-2" style={{ marginTop: 8 }}>
            <img src={photoPreview} alt="meal" style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 6, border: `1px solid ${C.border}` }} />
            {analyzing ? (
              <span style={{ fontSize: 13, color: C.textMuted, display: "flex", alignItems: "center", gap: 4 }}>
                <Loader2 size={13} className="animate-spin" /> 解析中...
              </span>
            ) : (
              <button onClick={removePhoto} style={{ color: C.textMuted, fontSize: 13, display: "flex", alignItems: "center", gap: 3 }}>
                <X size={13} /> 削除
              </button>
            )}
          </div>
        )}
        {analyzeErr && <div style={{ fontSize: 13, color: C.danger, marginTop: 6 }}>{analyzeErr}</div>}
      </div>

      <div style={{ marginBottom: 10 }}>
        <Field label="内容(写真がない場合は手入力)">
          <Input value={manualText} onChange={(e) => setManualText(e.target.value)} placeholder="鶏むね肉 + 玄米 + 味噌汁" />
        </Field>
      </div>

      {submitErr && <div style={{ fontSize: 13, color: C.danger, marginBottom: 8 }}>写真または内容のどちらかを入力してください。</div>}

      <PrimaryButton onClick={submit}>
        <Plus size={15} /> {mealType}を記録
      </PrimaryButton>
    </div>
  );
}

function IntakeTab({ data, addItem, removeItem }) {
  const [sub, setSub] = useState("diet");

  const [intakeForm, setIntakeForm] = useState({ date: todayStr(), type: "サプリ", name: "", dose: "", timing: "", memo: "" });
  const [smokeForm, setSmokeForm] = useState({ date: todayStr(), score: "", memo: "" });
  const [treatForm, setTreatForm] = useState({ timeRaw: "", timeErr: false, content: "" });

  const submitIntake = () => {
    if (!intakeForm.name) return;
    addItem("intake", { ...intakeForm, id: uid() });
    setIntakeForm({ date: todayStr(), type: intakeForm.type, name: "", dose: "", timing: "", memo: "" });
  };
  const submitSmoke = () => {
    const todayCount = data.smoking.filter((s) => s.date === smokeForm.date).length + 1;
    addItem("smoking", { ...smokeForm, time: nowHHMM(), count: todayCount, id: uid() });
    setSmokeForm({ date: todayStr(), score: "", memo: "" });
  };
  const submitTreat = () => {
    const parsed = parseTimeRaw(treatForm.timeRaw);
    if (!parsed.valid) {
      setTreatForm({ ...treatForm, timeErr: true });
      return;
    }
    if (!treatForm.content) return;
    addItem("treats", { id: uid(), date: todayStr(), time: parsed.value || nowHHMM(), type: "お酒", content: treatForm.content });
    setTreatForm({ timeRaw: "", timeErr: false, content: "" });
  };

  const isSupplementDone = (name, timing) => data.intake.some((i) => i.date === todayStr() && i.type === "サプリ" && i.name === name && i.timing === timing);
  const toggleSupplement = (name, timing) => {
    const existing = data.intake.find((i) => i.date === todayStr() && i.type === "サプリ" && i.name === name && i.timing === timing);
    if (existing) {
      removeItem("intake", existing.id);
    } else {
      addItem("intake", { id: uid(), date: todayStr(), type: "サプリ", name, dose: "", timing, memo: "" });
    }
  };
  const toggleAllSupplements = (timing) => {
    const list = timing === "朝" ? SUPPLEMENTS.morning : SUPPLEMENTS.night;
    const allDone = list.every((name) => isSupplementDone(name, timing));
    if (allDone) {
      list.forEach((name) => {
        const existing = data.intake.find((i) => i.date === todayStr() && i.type === "サプリ" && i.name === name && i.timing === timing);
        if (existing) removeItem("intake", existing.id);
      });
    } else {
      list.forEach((name) => {
        if (!isSupplementDone(name, timing)) {
          addItem("intake", { id: uid(), date: todayStr(), type: "サプリ", name, dose: "", timing, memo: "" });
        }
      });
    }
  };

  const meals = [...data.diet].sort((a, b) => (a.date < b.date ? 1 : -1));
  const intakes = [...data.intake].sort((a, b) => (a.date < b.date ? 1 : -1));
  const smokes = [...data.smoking].sort((a, b) => (a.date < b.date ? 1 : -1));
  const treats = [...data.treats].sort((a, b) => (a.date < b.date ? 1 : -1));
  const dietLog = [
    ...data.diet.map((m) => ({ ...m, _cat: "diet", _label: m.mealType })),
    ...data.treats.map((t) => ({ ...t, _cat: "treats", _label: "お酒" })),
  ].sort((a, b) => (a.date < b.date ? 1 : -1));
  const todaySmokeCount = data.smoking.filter((s) => s.date === todayStr()).length;

  const chip = (label, onClick) => (
    <button
      key={label}
      onClick={onClick}
      style={{
        padding: "7px 12px",
        borderRadius: 999,
        fontSize: 13,
        fontFamily: "'IBM Plex Sans JP', sans-serif",
        background: C.panelAlt,
        color: C.text,
        border: `1px solid ${C.border}`,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 overflow-x-auto">
        {[
          ["diet", "食事", Utensils],
          ["intake", "Nutrition", Pill],
          ["smoking", "タバコ", Cigarette],
        ].map(([key, label, Icon]) => (
          <button
            key={key}
            onClick={() => setSub(key)}
            className="flex items-center gap-1.5"
            style={{
              padding: "9px 16px",
              borderRadius: 8,
              fontSize: 14.5,
              fontFamily: "'IBM Plex Sans JP', sans-serif",
              background: sub === key ? C.mint : C.panelAlt,
              color: sub === key ? "#06120C" : C.textMuted,
              fontWeight: sub === key ? 600 : 400,
              whiteSpace: "nowrap",
            }}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {sub === "diet" ? (
        <>
          <Panel>
            <SectionTitle>食事を記録(写真 or 手入力)</SectionTitle>
            <div className="flex flex-col gap-3">
              <MealBlock mealType="朝食" addItem={addItem} />
              <MealBlock mealType="昼食" addItem={addItem} />
              <MealBlock mealType="夕食" addItem={addItem} />
              <MealBlock mealType="間食" addItem={addItem} />
            </div>
          </Panel>
          <Panel>
            <SectionTitle>食事ログ</SectionTitle>
            {dietLog.length === 0 ? (
              <EmptyState text="まだ食事の記録がありません。" />
            ) : (
              <div className="flex flex-col gap-2">
                {dietLog.map((m) => (
                  <div key={m.id} className="flex items-center justify-between gap-2" style={{ borderBottom: `1px solid ${C.border}`, paddingBottom: 8 }}>
                    <div className="flex flex-col">
                      <span style={{ fontSize: 14.5 }}>
                        <span style={{ color: C.mint, fontFamily: "'IBM Plex Mono', monospace", fontSize: 13 }}>[{m._label}]</span> {m.content}
                      </span>
                      <span style={{ fontSize: 13, color: C.textMuted, fontFamily: "'IBM Plex Mono', monospace" }}>
                        {fmtDate(m.date)} {m.time ? m.time : ""} {m.memo ? `・ ${m.memo}` : ""}
                      </span>
                    </div>
                    <IconGhostButton onClick={() => removeItem(m._cat, m.id)} title="削除" danger />
                  </div>
                ))}
              </div>
            )}
          </Panel>
          <Panel>
            <div style={{ fontSize: 14.5, fontWeight: 600, marginBottom: 10 }}>お酒の記録</div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="時刻(4桁・任意)">
                <TimeInput
                  raw={treatForm.timeRaw}
                  onChange={(v) => setTreatForm({ ...treatForm, timeRaw: v, timeErr: false })}
                  error={treatForm.timeErr}
                />
              </Field>
              <Field label="内容">
                <Input value={treatForm.content} onChange={(e) => setTreatForm({ ...treatForm, content: e.target.value })} placeholder="ビール1缶 / ハイボール2杯" />
              </Field>
            </div>
            <div className="mt-4">
              <PrimaryButton onClick={submitTreat}>
                <Plus size={15} /> 記録する
              </PrimaryButton>
            </div>
          </Panel>
        </>
      ) : sub === "intake" ? (
        <>
          <Panel>
            <SectionTitle>TORAZi 定番サプリ</SectionTitle>
            <p style={{ fontSize: 13, color: C.textMuted, marginBottom: 8 }}>朝サプリ</p>
            <div className="flex flex-col gap-1.5" style={{ marginBottom: 16 }}>
              {SUPPLEMENTS.morning.map((s) => {
                const done = isSupplementDone(s, "朝");
                return (
                  <button
                    key={s}
                    onClick={() => toggleSupplement(s, "朝")}
                    className="flex items-center gap-2"
                    style={{
                      padding: "9px 12px",
                      borderRadius: 6,
                      fontSize: 14,
                      textAlign: "left",
                      background: done ? `${C.mint}1A` : "transparent",
                      color: done ? C.mint : C.text,
                      border: `1px solid ${done ? C.mintDim : C.border}`,
                    }}
                  >
                    {done ? <CheckSquare size={16} /> : <Square size={16} color={C.textMuted} />}
                    {s}
                  </button>
                );
              })}
              <button
                onClick={() => toggleAllSupplements("朝")}
                className="flex items-center gap-2"
                style={{
                  padding: "9px 12px",
                  borderRadius: 6,
                  fontSize: 14,
                  textAlign: "left",
                  fontWeight: 600,
                  background: SUPPLEMENTS.morning.every((s) => isSupplementDone(s, "朝")) ? `${C.coral}1A` : "transparent",
                  color: SUPPLEMENTS.morning.every((s) => isSupplementDone(s, "朝")) ? C.coral : C.textMuted,
                  border: `1px solid ${SUPPLEMENTS.morning.every((s) => isSupplementDone(s, "朝")) ? C.coral : C.border}`,
                }}
              >
                {SUPPLEMENTS.morning.every((s) => isSupplementDone(s, "朝")) ? <CheckSquare size={16} /> : <Square size={16} />}
                すべて摂取
              </button>
            </div>
            <p style={{ fontSize: 13, color: C.textMuted, marginBottom: 8 }}>夜サプリ</p>
            <div className="flex flex-col gap-1.5">
              {SUPPLEMENTS.night.map((s) => {
                const done = isSupplementDone(s, "夜");
                return (
                  <button
                    key={s}
                    onClick={() => toggleSupplement(s, "夜")}
                    className="flex items-center gap-2"
                    style={{
                      padding: "9px 12px",
                      borderRadius: 6,
                      fontSize: 14,
                      textAlign: "left",
                      background: done ? `${C.mint}1A` : "transparent",
                      color: done ? C.mint : C.text,
                      border: `1px solid ${done ? C.mintDim : C.border}`,
                    }}
                  >
                    {done ? <CheckSquare size={16} /> : <Square size={16} color={C.textMuted} />}
                    {s}
                  </button>
                );
              })}
              <button
                onClick={() => toggleAllSupplements("夜")}
                className="flex items-center gap-2"
                style={{
                  padding: "9px 12px",
                  borderRadius: 6,
                  fontSize: 14,
                  textAlign: "left",
                  fontWeight: 600,
                  background: SUPPLEMENTS.night.every((s) => isSupplementDone(s, "夜")) ? `${C.coral}1A` : "transparent",
                  color: SUPPLEMENTS.night.every((s) => isSupplementDone(s, "夜")) ? C.coral : C.textMuted,
                  border: `1px solid ${SUPPLEMENTS.night.every((s) => isSupplementDone(s, "夜")) ? C.coral : C.border}`,
                }}
              >
                {SUPPLEMENTS.night.every((s) => isSupplementDone(s, "夜")) ? <CheckSquare size={16} /> : <Square size={16} />}
                すべて摂取
              </button>
            </div>
          </Panel>
          <Panel>
            <SectionTitle>サプリ・薬を記録</SectionTitle>
            <p style={{ fontSize: 13, color: C.textMuted, marginTop: -8, marginBottom: 10 }}>定番以外のサプリ・薬はこちらから記録できます。</p>
            <div className="flex flex-col gap-3">
              <Field label="種別">
                <Select value={intakeForm.type} onChange={(e) => setIntakeForm({ ...intakeForm, type: e.target.value })}>
                  <option>サプリ</option>
                  <option>薬</option>
                </Select>
              </Field>
              <Field label="名前">
                <Input value={intakeForm.name} onChange={(e) => setIntakeForm({ ...intakeForm, name: e.target.value })} placeholder="ビタミンD / ロキソニン等" />
              </Field>
            </div>
            <div className="mt-4">
              <PrimaryButton onClick={submitIntake}>
                <Plus size={15} /> 記録する
              </PrimaryButton>
            </div>
          </Panel>
          <Panel>
            <SectionTitle>サプリ・薬ログ</SectionTitle>
            {intakes.length === 0 ? (
              <EmptyState text="まだサプリ・薬の記録がありません。" />
            ) : (
              <div className="flex flex-col gap-2">
                {intakes.map((it) => (
                  <div key={it.id} className="flex items-center justify-between gap-2" style={{ borderBottom: `1px solid ${C.border}`, paddingBottom: 8 }}>
                    <div className="flex flex-col">
                      <span style={{ fontSize: 14.5 }}>
                        <span style={{ color: it.type === "薬" ? C.coral : C.mint, fontFamily: "'IBM Plex Mono', monospace", fontSize: 13 }}>
                          [{it.type}]
                        </span>{" "}
                        {it.name} {it.dose ? `・ ${it.dose}` : ""}
                      </span>
                      <span style={{ fontSize: 13, color: C.textMuted, fontFamily: "'IBM Plex Mono', monospace" }}>
                        {fmtDate(it.date)} {it.timing ? `・ ${it.timing}` : ""}
                      </span>
                    </div>
                    <IconGhostButton onClick={() => removeItem("intake", it.id)} title="削除" danger />
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </>
      ) : sub === "smoking" ? (
        <>
          <Panel>
            <div className="flex items-center justify-between">
              <SectionTitle accent={C.coral}>タバコを記録</SectionTitle>
              <span style={{ fontSize: 13.5, color: C.textMuted, fontFamily: "'IBM Plex Mono', monospace" }}>
                本日 {todaySmokeCount} 本目
              </span>
            </div>
            <div className="flex flex-col gap-3">
              <Field label="点数(0-10・任意)">
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={smokeForm.score}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "");
                    const clamped = digits === "" ? "" : String(Math.min(10, Number(digits)));
                    setSmokeForm({ ...smokeForm, score: clamped });
                  }}
                />
              </Field>
              <Field label="体感(任意)">
                <Select value={smokeForm.memo} onChange={(e) => setSmokeForm({ ...smokeForm, memo: e.target.value })}>
                  {SMOKING_FEELING_OPTIONS.map((f) => (
                    <option key={f} value={f}>
                      {f === "" ? "選択" : f}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <p style={{ fontSize: 13, color: C.textMuted, marginTop: 8 }}>記録ボタンを押した時刻が自動で記録されます。</p>
            <div className="mt-4">
              <PrimaryButton onClick={submitSmoke}>
                <Plus size={15} /> 1本記録する
              </PrimaryButton>
            </div>
          </Panel>
          <Panel>
            <SectionTitle>タバコログ</SectionTitle>
            {smokes.length === 0 ? (
              <EmptyState text="まだタバコの記録がありません。" />
            ) : (
              <div className="flex flex-col gap-2">
                {smokes.map((s) => (
                  <div key={s.id} className="flex items-center justify-between gap-2" style={{ borderBottom: `1px solid ${C.border}`, paddingBottom: 8 }}>
                    <span style={{ fontSize: 14.5, fontFamily: "'IBM Plex Mono', monospace" }}>
                      {fmtDate(s.date)} {s.time ? s.time : ""} ・ {s.count}本目
                      {s.score ? ` ・ 点数${s.score}` : ""}
                      {s.memo ? ` ・ ${s.memo}` : ""}
                    </span>
                    <IconGhostButton onClick={() => removeItem("smoking", s.id)} title="削除" danger />
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </>
      ) : null}
    </div>
  );
}

/* ---------------------------------------------------------
   体組成・血液検査 タブ
--------------------------------------------------------- */
function parseJsonFromAiText(text) {
  const cleaned = text.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}

function AttachButtons({ onFile, accept, folderLabel, fileLabel }) {
  const [open, setOpen] = useState(false);
  const folderRef = useRef(null);
  const fileRef = useRef(null);
  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-center gap-1.5"
        style={{
          width: "100%",
          border: `1px dashed ${C.mintDim}`,
          color: C.mint,
          fontSize: 14,
          borderRadius: 6,
          padding: "12px 14px",
          cursor: "pointer",
          background: "transparent",
        }}
      >
        <Camera size={15} /> 画像を添付
      </button>
      {open && (
        <div className="flex flex-col gap-1" style={{ marginTop: 6, border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden", background: C.panel }}>
          <button
            onClick={() => {
              setOpen(false);
              folderRef.current && folderRef.current.click();
            }}
            className="flex items-center gap-2"
            style={{ padding: "12px 14px", fontSize: 14, color: C.text, background: "transparent" }}
          >
            <ImageIcon size={15} color={C.mint} /> {folderLabel}
          </button>
          <button
            onClick={() => {
              setOpen(false);
              fileRef.current && fileRef.current.click();
            }}
            className="flex items-center gap-2"
            style={{ padding: "12px 14px", fontSize: 14, color: C.text, background: "transparent", borderTop: `1px solid ${C.border}` }}
          >
            <Download size={15} color={C.mint} /> {fileLabel}
          </button>
        </div>
      )}
      <input ref={folderRef} type="file" accept={accept} onChange={onFile} style={{ display: "none" }} />
      <input ref={fileRef} type="file" accept={accept} onChange={onFile} style={{ display: "none" }} />
    </div>
  );
}

function BodyMetricsUploader({ addItem }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [extracted, setExtracted] = useState(null); // {date, weight, bodyFatMass, muscleMass, bodyFat, bmr}

  const handleFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setError("");
    setAnalyzing(true);
    try {
      const base64 = await fileToBase64(file);
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: [
                { type: "image", source: { type: "base64", media_type: file.type || "image/jpeg", data: base64 } },
                {
                  type: "text",
                  text:
                    "この体組成計の画面や結果の写真から、体重(kg)、体脂肪量(kg)、筋肉量(kg)、体脂肪率(%)、基礎代謝量(kcal)を読み取り、次のJSON形式だけを出力してください。読み取れない項目はnullにしてください。前置きや説明文は不要です。\n" +
                    '{"weight": 数値またはnull, "bodyFatMass": 数値またはnull, "muscleMass": 数値またはnull, "bodyFat": 数値またはnull, "bmr": 数値またはnull}',
                },
              ],
            },
          ],
        }),
      });
      const json = await resp.json();
      const text = (json.content || []).filter((b) => b.type === "text").map((b) => b.text).join("");
      const parsed = parseJsonFromAiText(text);
      setExtracted({
        date: todayStr(),
        weight: parsed.weight ?? "",
        bodyFatMass: parsed.bodyFatMass ?? "",
        muscleMass: parsed.muscleMass ?? "",
        bodyFat: parsed.bodyFat ?? "",
        bmr: parsed.bmr ?? "",
      });
    } catch (err) {
      setError("画像の解析に失敗しました。もう一度お試しください。");
    } finally {
      setAnalyzing(false);
    }
  };

  const save = () => {
    if (!extracted) return;
    addItem("bodyMetrics", { id: uid(), ...extracted, memo: "" });
    setExtracted(null);
  };

  return (
    <Panel>
      <SectionTitle>体重・体組成を記録</SectionTitle>
      <p style={{ fontSize: 13, color: C.textMuted, marginTop: -8, marginBottom: 10 }}>体組成計の画面などの画像を添付すると自動で読み取ります。</p>
      <AttachButtons onFile={handleFile} accept="image/*" folderLabel="写真フォルダ" fileLabel="ファイル選択" />
      {analyzing && (
        <div className="flex items-center gap-2" style={{ marginTop: 10, fontSize: 13.5, color: C.textMuted }}>
          <Loader2 size={14} className="animate-spin" /> 解析中...
        </div>
      )}
      {error && <div style={{ fontSize: 13, color: C.danger, marginTop: 8 }}>{error}</div>}
      {extracted && (
        <div className="flex flex-col gap-3" style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
          <Field label="日付">
            <Input type="date" value={extracted.date} onChange={(e) => setExtracted({ ...extracted, date: e.target.value })} />
          </Field>
          <Field label="体重 (kg)">
            <Input type="text" inputMode="decimal" value={extracted.weight} onChange={(e) => setExtracted({ ...extracted, weight: e.target.value.replace(/[^0-9.]/g, "") })} />
          </Field>
          <Field label="体脂肪量 (kg)">
            <Input type="text" inputMode="decimal" value={extracted.bodyFatMass} onChange={(e) => setExtracted({ ...extracted, bodyFatMass: e.target.value.replace(/[^0-9.]/g, "") })} />
          </Field>
          <Field label="筋肉量 (kg)">
            <Input type="text" inputMode="decimal" value={extracted.muscleMass} onChange={(e) => setExtracted({ ...extracted, muscleMass: e.target.value.replace(/[^0-9.]/g, "") })} />
          </Field>
          <Field label="体脂肪率 (%)">
            <Input type="text" inputMode="decimal" value={extracted.bodyFat} onChange={(e) => setExtracted({ ...extracted, bodyFat: e.target.value.replace(/[^0-9.]/g, "") })} />
          </Field>
          <Field label="基礎代謝量 (kcal)">
            <Input type="text" inputMode="decimal" value={extracted.bmr} onChange={(e) => setExtracted({ ...extracted, bmr: e.target.value.replace(/[^0-9.]/g, "") })} />
          </Field>
          <PrimaryButton onClick={save}>
            <Plus size={15} /> 記録する
          </PrimaryButton>
        </div>
      )}
    </Panel>
  );
}

function BloodTestUploader({ addItem }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [date, setDate] = useState(todayStr());
  const [items, setItems] = useState([]); // [{type,testName,value,unit,refRange}]
  const [pasteText, setPasteText] = useState("");
  const [pasteErr, setPasteErr] = useState("");

  const parsePastedText = () => {
    setPasteErr("");
    const lines = pasteText.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return;
    const parsedItems = [];
    let dateFromText = "";
    lines.forEach((line) => {
      const dateMatch = line.match(/^日付[:：]\s*(\d{4}-\d{2}-\d{2})/);
      if (dateMatch) {
        dateFromText = dateMatch[1];
        return;
      }
      const cols = line.split(",").map((c) => c.trim());
      if (cols.length >= 3) {
        parsedItems.push({
          _id: uid(),
          type: cols[0] || "血液検査",
          testName: cols[1] || "",
          value: cols[2] || "",
          unit: cols[3] || "",
          refRange: cols[4] || "",
        });
      }
    });
    if (parsedItems.length === 0) {
      setPasteErr("読み取れる行が見つかりませんでした。フォーマットを確認してください。");
      return;
    }
    if (dateFromText) setDate(dateFromText);
    setItems((prev) => [...prev, ...parsedItems]);
    setPasteText("");
  };

  const handleFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setError("");
    setAnalyzing(true);
    try {
      const base64 = await fileToBase64(file);
      const isPdf = (file.type || "").includes("pdf") || /\.pdf$/i.test(file.name || "");
      const fileBlock = isPdf
        ? { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } }
        : { type: "image", source: { type: "base64", media_type: file.type || "image/jpeg", data: base64 } };
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: [
                fileBlock,
                {
                  type: "text",
                  text:
                    "この血液検査・健康診断の結果から、検査項目ごとに種別(血液検査 または 健康診断)、項目名、値、単位、基準範囲を読み取り、次のJSON配列だけを出力してください。前置きや説明文は不要です。\n" +
                    '[{"type": "血液検査", "testName": "LDLコレステロール", "value": "120", "unit": "mg/dL", "refRange": "70-139"}]',
                },
              ],
            },
          ],
        }),
      });
      const json = await resp.json();
      const text = (json.content || []).filter((b) => b.type === "text").map((b) => b.text).join("");
      const parsed = parseJsonFromAiText(text);
      setItems(Array.isArray(parsed) ? parsed.map((p) => ({ ...p, _id: uid() })) : []);
    } catch (err) {
      setError("解析に失敗しました。もう一度お試しください。");
    } finally {
      setAnalyzing(false);
    }
  };

  const removeExtracted = (id) => setItems((prev) => prev.filter((i) => i._id !== id));

  const saveAll = () => {
    items.forEach((i) => {
      addItem("healthRecords", { id: uid(), date, type: i.type || "血液検査", testName: i.testName || "", value: i.value || "", unit: i.unit || "", refRange: i.refRange || "", memo: "" });
    });
    setItems([]);
  };

  return (
    <Panel>
      <SectionTitle>血液検査・健康診断を記録</SectionTitle>
      <p style={{ fontSize: 13, color: C.textMuted, marginTop: -8, marginBottom: 10 }}>結果の写真またはPDFを添付すると自動で読み取ります。</p>
      <AttachButtons onFile={handleFile} accept="image/*,.pdf,application/pdf" folderLabel="写真フォルダ" fileLabel="ファイル選択" />
      {analyzing && (
        <div className="flex items-center gap-2" style={{ marginTop: 10, fontSize: 13.5, color: C.textMuted }}>
          <Loader2 size={14} className="animate-spin" /> 解析中...
        </div>
      )}
      {error && <div style={{ fontSize: 13, color: C.danger, marginTop: 8 }}>{error}</div>}

      <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
        <p style={{ fontSize: 13, color: C.textMuted, marginBottom: 6 }}>
          または、Claudeとのチャットで読み取ってもらった結果を貼り付けて読み込むこともできます。
        </p>
        <p style={{ fontSize: 12, color: C.textMuted, marginBottom: 8, fontFamily: "'IBM Plex Mono', monospace" }}>
          形式: 種別,項目名,値,単位,基準範囲 (1行1項目。1行目に「日付: 2026-06-15」も指定可)
        </p>
        <textarea
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          placeholder={"日付: 2026-06-15\n血液検査,LDLコレステロール,120,mg/dL,70-139\n血液検査,HbA1c,5.4,%,4.6-6.2"}
          style={{ ...inputStyle, minHeight: 100, resize: "vertical" }}
        />
        {pasteErr && <div style={{ fontSize: 13, color: C.danger, marginTop: 6 }}>{pasteErr}</div>}
        <div className="mt-2">
          <button
            onClick={parsePastedText}
            style={{
              fontSize: 14,
              color: C.mint,
              border: `1px solid ${C.mintDim}`,
              background: "transparent",
              borderRadius: 7,
              padding: "10px 16px",
            }}
          >
            貼り付けた内容を読み込む
          </button>
        </div>
      </div>

      {items.length > 0 && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
          <Field label="日付">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <div className="flex flex-col gap-2" style={{ marginTop: 10 }}>
            {items.map((i) => (
              <div key={i._id} className="flex items-center justify-between gap-2" style={{ borderBottom: `1px solid ${C.border}`, paddingBottom: 6 }}>
                <span style={{ fontSize: 14 }}>
                  <span style={{ color: C.textMuted, fontFamily: "'IBM Plex Mono', monospace", fontSize: 13 }}>[{i.type}]</span> {i.testName} {i.value}
                  {i.unit} {i.refRange ? `(基準:${i.refRange})` : ""}
                </span>
                <IconGhostButton onClick={() => removeExtracted(i._id)} title="削除" danger />
              </div>
            ))}
          </div>
          <div className="mt-4">
            <PrimaryButton onClick={saveAll}>
              <Plus size={15} /> まとめて記録する
            </PrimaryButton>
          </div>
        </div>
      )}
    </Panel>
  );
}

function BodyTab({ data, addItem, removeItem }) {
  const [sub, setSub] = useState("metrics");
  const [metricForm, setMetricForm] = useState({ date: todayStr(), weight: "", bodyFat: "", bodyFatMass: "", muscleMass: "", bmr: "" });

  const submitMetric = () => {
    if (!metricForm.weight) return;
    addItem("bodyMetrics", { ...metricForm, id: uid() });
    setMetricForm({ date: todayStr(), weight: "", bodyFat: "", bodyFatMass: "", muscleMass: "", bmr: "" });
  };

  const metrics = useMemo(
    () => [...data.bodyMetrics].sort((a, b) => (a.date > b.date ? 1 : -1)).slice(-30).map((m) => ({ ...m, dateLabel: fmtDate(m.date) })),
    [data.bodyMetrics]
  );
  const metricsSorted = [...data.bodyMetrics].sort((a, b) => (a.date < b.date ? 1 : -1));
  const recordsSorted = [...data.healthRecords].sort((a, b) => (a.date < b.date ? 1 : -1));

  const isOutOfRange = (rec) => {
    if (!rec.refRange || !rec.value) return false;
    const m = rec.refRange.match(/([\d.]+)\s*[-~〜]\s*([\d.]+)/);
    if (!m) return false;
    const v = parseFloat(rec.value);
    return v < parseFloat(m[1]) || v > parseFloat(m[2]);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        {[
          ["metrics", "体重・体組成", Activity],
          ["records", "血液検査・健診", TestTube2],
        ].map(([key, label, Icon]) => (
          <button
            key={key}
            onClick={() => setSub(key)}
            className="flex items-center gap-1.5"
            style={{
              padding: "9px 16px",
              borderRadius: 8,
              fontSize: 14.5,
              fontFamily: "'IBM Plex Sans JP', sans-serif",
              background: sub === key ? C.mint : C.panelAlt,
              color: sub === key ? "#06120C" : C.textMuted,
              fontWeight: sub === key ? 600 : 400,
            }}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {sub === "metrics" ? (
        <>
          <Panel>
            <SectionTitle>体重・体組成を記録</SectionTitle>
            <div className="flex flex-col gap-3">
              <Field label="日付">
                <Input type="date" value={metricForm.date} onChange={(e) => setMetricForm({ ...metricForm, date: e.target.value })} style={{ width: 170, maxWidth: "100%" }} />
              </Field>
              <Field label="体重 (kg)">
                <Input
                  type="text"
                  inputMode="decimal"
                  value={metricForm.weight}
                  onChange={(e) => setMetricForm({ ...metricForm, weight: e.target.value.replace(/[^0-9.]/g, "") })}
                />
              </Field>
              <Field label="体脂肪率 (%)">
                <Input
                  type="text"
                  inputMode="decimal"
                  value={metricForm.bodyFat}
                  onChange={(e) => setMetricForm({ ...metricForm, bodyFat: e.target.value.replace(/[^0-9.]/g, "") })}
                />
              </Field>
              <Field label="体脂肪量 (kg)">
                <Input
                  type="text"
                  inputMode="decimal"
                  value={metricForm.bodyFatMass}
                  onChange={(e) => setMetricForm({ ...metricForm, bodyFatMass: e.target.value.replace(/[^0-9.]/g, "") })}
                />
              </Field>
              <Field label="筋肉量 (kg)">
                <Input
                  type="text"
                  inputMode="decimal"
                  value={metricForm.muscleMass}
                  onChange={(e) => setMetricForm({ ...metricForm, muscleMass: e.target.value.replace(/[^0-9.]/g, "") })}
                />
              </Field>
              <Field label="基礎代謝量 (kcal)">
                <Input
                  type="text"
                  inputMode="decimal"
                  value={metricForm.bmr}
                  onChange={(e) => setMetricForm({ ...metricForm, bmr: e.target.value.replace(/[^0-9.]/g, "") })}
                />
              </Field>
            </div>
            <div className="mt-4">
              <PrimaryButton onClick={submitMetric}>
                <Plus size={15} /> 記録する
              </PrimaryButton>
            </div>
          </Panel>

          {metrics.length > 1 && (
            <Panel>
              <SectionTitle accent={C.amber}>体重推移</SectionTitle>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={metrics}>
                  <CartesianGrid stroke={C.border} vertical={false} />
                  <XAxis dataKey="dateLabel" stroke={C.textMuted} tick={{ fontSize: 13 }} />
                  <YAxis stroke={C.textMuted} tick={{ fontSize: 13 }} width={40} domain={["auto", "auto"]} />
                  <Tooltip contentStyle={{ background: C.panelAlt, border: `1px solid ${C.border}`, fontSize: 13.5 }} />
                  <Line type="monotone" dataKey="weight" stroke={C.mint} strokeWidth={2} dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </Panel>
          )}

          <Panel>
            <SectionTitle>記録一覧</SectionTitle>
            {metricsSorted.length === 0 ? (
              <EmptyState text="まだ体重・体組成の記録がありません。" />
            ) : (
              <div className="flex flex-col gap-2">
                {metricsSorted.map((m) => (
                  <div key={m.id} className="flex items-center justify-between gap-2" style={{ borderBottom: `1px solid ${C.border}`, paddingBottom: 8 }}>
                    <span style={{ fontSize: 14.5, fontFamily: "'IBM Plex Mono', monospace" }}>
                      {fmtDate(m.date)} ・ {m.weight}kg
                      {m.bodyFat ? ` ・ 体脂肪率 ${m.bodyFat}%` : ""}
                      {m.bodyFatMass ? ` ・ 体脂肪量 ${m.bodyFatMass}kg` : ""}
                      {m.muscleMass ? ` ・ 筋肉量 ${m.muscleMass}kg` : ""}
                      {m.bmr ? ` ・ 基礎代謝 ${m.bmr}kcal` : ""}
                    </span>
                    <IconGhostButton onClick={() => removeItem("bodyMetrics", m.id)} title="削除" danger />
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </>
      ) : (
        <>
          <BloodTestUploader addItem={addItem} />

          <Panel>
            <SectionTitle>検査ログ</SectionTitle>
            {recordsSorted.length === 0 ? (
              <EmptyState text="まだ検査・健診の記録がありません。" />
            ) : (
              <div className="flex flex-col gap-2">
                {recordsSorted.map((r) => {
                  const outOfRange = isOutOfRange(r);
                  return (
                    <div key={r.id} className="flex items-center justify-between gap-2" style={{ borderBottom: `1px solid ${C.border}`, paddingBottom: 8 }}>
                      <div className="flex items-center gap-2">
                        {outOfRange && <AlertTriangle size={14} color={C.danger} />}
                        <div className="flex flex-col">
                          <span style={{ fontSize: 14.5 }}>
                            <span style={{ color: C.textMuted, fontFamily: "'IBM Plex Mono', monospace", fontSize: 13 }}>[{r.type}]</span>{" "}
                            {r.testName}
                            {r.value ? (
                              <span style={{ color: outOfRange ? C.danger : C.mint, fontWeight: 600 }}> {r.value}{r.unit}</span>
                            ) : null}
                          </span>
                          <span style={{ fontSize: 13, color: C.textMuted, fontFamily: "'IBM Plex Mono', monospace" }}>
                            {fmtDate(r.date)} {r.refRange ? `・ 基準 ${r.refRange}` : ""} {r.memo ? `・ ${r.memo}` : ""}
                          </span>
                        </div>
                      </div>
                      <IconGhostButton onClick={() => removeItem("healthRecords", r.id)} title="削除" danger />
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>
        </>
      )}
    </div>
  );
}

/* ---------------------------------------------------------
   概要 タブ
--------------------------------------------------------- */
function OverviewTab({ data }) {
  const today = todayStr();
  const todayIntake = data.intake.filter((i) => i.date === today);
  const todayMeals = data.diet.filter((d) => d.date === today);
  const lastTraining = [...data.training].sort((a, b) => (a.date < b.date ? 1 : -1))[0];
  const lastWeight = [...data.bodyMetrics].sort((a, b) => (a.date < b.date ? 1 : -1))[0];
  const weightSeries = useMemo(
    () => [...data.bodyMetrics].sort((a, b) => (a.date > b.date ? 1 : -1)).slice(-30).map((m) => ({ dateLabel: fmtDate(m.date), weight: Number(m.weight) })),
    [data.bodyMetrics]
  );

  const stat = (label, value, accent) => (
    <Panel style={{ flex: 1, minWidth: 140 }}>
      <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 6, fontFamily: "'IBM Plex Mono', monospace" }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 600, color: accent || C.text, fontFamily: "'IBM Plex Mono', monospace" }}>{value}</div>
    </Panel>
  );

  const hasAnyData =
    data.training.length ||
    data.conditioning.length ||
    data.diet.length ||
    data.intake.length ||
    data.smoking.length ||
    data.treats.length ||
    data.bodyMetrics.length ||
    data.healthRecords.length;

  return (
    <div className="flex flex-col gap-4">
      <Panel>
        <div className="flex items-center justify-between">
          <SectionTitle accent={C.amber}>Googleシート連携</SectionTitle>
          <span style={{ fontSize: 12, color: C.mint, display: "flex", alignItems: "center", gap: 3 }}>
            <Check size={14} /> 自動送信 有効
          </span>
        </div>
        <p style={{ fontSize: 13, color: C.textMuted, marginTop: -8 }}>
          記録するたびに、設定済みのGoogleシートへ自動的に送信されます。通信に失敗しても、この画面やデータには影響しません。
        </p>
      </Panel>

      {hasAnyData ? (
        <Panel>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <SectionTitle>Claudeに分析してもらう / 虎データ</SectionTitle>
              <p style={{ fontSize: 13.5, color: C.textMuted, marginTop: -6 }}>
                コピーしてチャットに貼り付けると分析します。CSVはActual DBとして保存できます。
              </p>
            </div>
            <div className="flex gap-2">
              <CopyButton getText={() => buildFullSummaryText(data)} label="全記録をコピー" />
              <button
                onClick={() => downloadCsv(data)}
                className="flex items-center gap-1.5"
                style={{
                  background: "transparent",
                  border: `1px solid ${C.border}`,
                  color: C.textMuted,
                  fontSize: 13.5,
                  borderRadius: 6,
                  padding: "9px 14px",
                  fontFamily: "'IBM Plex Sans JP', sans-serif",
                }}
              >
                <Download size={14} /> CSV
              </button>
            </div>
          </div>
        </Panel>
      ) : null}
      <div className="flex flex-wrap gap-3">
        {stat("本日の食事", `${todayMeals.length} 件`, C.mint)}
        {stat("本日のサプリ・薬", `${todayIntake.length} 件`, C.coral)}
        {stat("本日のタバコ", `${data.smoking.filter((s) => s.date === today).length} 本`, C.amber)}
        {stat("直近の体重", lastWeight ? `${lastWeight.weight} kg` : "―", C.amber)}
        {stat("直近のトレーニング", lastTraining ? fmtDate(lastTraining.date) : "―", C.mint)}
      </div>

      {weightSeries.length > 1 && (
        <Panel>
          <SectionTitle>体重推移（直近30件）</SectionTitle>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={weightSeries}>
              <CartesianGrid stroke={C.border} vertical={false} />
              <XAxis dataKey="dateLabel" stroke={C.textMuted} tick={{ fontSize: 13 }} />
              <YAxis stroke={C.textMuted} tick={{ fontSize: 13 }} width={40} domain={["auto", "auto"]} />
              <Tooltip contentStyle={{ background: C.panelAlt, border: `1px solid ${C.border}`, fontSize: 13.5 }} />
              <Line type="monotone" dataKey="weight" stroke={C.mint} strokeWidth={2} dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>
      )}

      {lastTraining && (
        <Panel>
          <SectionTitle accent={C.coral}>直近のトレーニング</SectionTitle>
          <div style={{ fontSize: 14.5 }}>
            {fmtDate(lastTraining.date)} ・ {lastTraining.exercise} ・ {formatTrainingEntry(lastTraining)}
          </div>
        </Panel>
      )}

      {data.training.length === 0 && data.diet.length === 0 && data.bodyMetrics.length === 0 && (
        <EmptyState text="記録がまだありません。左のメニューから各項目を入力しましょう。" />
      )}
    </div>
  );
}

/* ---------------------------------------------------------
   メインアプリ
--------------------------------------------------------- */
const TABS = [
  { key: "training", label: "Training", icon: Dumbbell },
  { key: "intake", label: "Intakes", icon: Pill },
  { key: "body", label: "Metrics", icon: TestTube2 },
  { key: "overview", label: "Overview", icon: LayoutDashboard },
];

export default function HealthTracker() {
  const [data, setData] = useState(emptyData());
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [activeTab, setActiveTab] = useState("training");

  useEffect(() => {
    (async () => {
      try {
        const result = await window.storage.get(STORAGE_KEY, false);
        if (result && result.value) {
          const parsed = JSON.parse(result.value);
          setData({ ...emptyData(), ...parsed });
        }
      } catch (e) {
        // キーが存在しない場合はデフォルト値のまま
        setLoadError(false);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persist = useCallback(async (next) => {
    try {
      const result = await window.storage.set(STORAGE_KEY, JSON.stringify(next), false);
      setSaveError(!result);
    } catch (e) {
      setSaveError(true);
    }
  }, []);

  const addItem = useCallback(
    (category, item) => {
      setData((prev) => {
        const next = { ...prev, [category]: [...prev[category], item] };
        persist(next);
        return next;
      });
      sendToGoogleSheet(category, item);
    },
    [persist]
  );

  const removeItem = useCallback(
    (category, id) => {
      setData((prev) => {
        const next = { ...prev, [category]: prev[category].filter((x) => x.id !== id) };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  return (
    <div
      style={{
        background: C.bg,
        color: C.text,
        minHeight: "100vh",
        fontFamily: "'IBM Plex Sans JP', sans-serif",
      }}
    >
      <style>{FONT_IMPORT}</style>
      <div className="flex flex-col md:flex-row" style={{ minHeight: "100vh" }}>
        {/* サイドバー */}
        <div
          className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible"
          style={{
            background: C.panel,
            borderBottom: `1px solid ${C.border}`,
            borderRight: `1px solid ${C.border}`,
            padding: 12,
            minWidth: 0,
          }}
        >
          <div className="hidden md:block" style={{ padding: "4px 8px 16px" }}>
            <div style={{ fontSize: 13, letterSpacing: "0.1em", color: C.textMuted, fontFamily: "'IBM Plex Mono', monospace" }}>
              VITALS LOG
            </div>
          </div>
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className="flex items-center gap-2 whitespace-nowrap"
                style={{
                  padding: "11px 14px",
                  borderRadius: 8,
                  fontSize: 14.5,
                  color: active ? "#06120C" : C.textMuted,
                  background: active ? C.mint : "transparent",
                  fontWeight: active ? 600 : 400,
                }}
              >
                <Icon size={16} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* メイン */}
        <div className="flex-1" style={{ padding: "20px 16px 60px", maxWidth: 900 }}>
          <div style={{ marginBottom: 20 }}>
            <div className="flex items-center justify-between">
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 700 }}>{TABS.find((t) => t.key === activeTab)?.label}</h1>
                <p style={{ fontSize: 13.5, color: C.textMuted, marginTop: 2 }}>
                  食事・サプリ・薬・運動・体重・血液検査・健診・体組成をまとめて記録します
                </p>
              </div>
              {saveError && (
                <span style={{ fontSize: 13, color: C.danger, display: "flex", alignItems: "center", gap: 4 }}>
                  <AlertTriangle size={13} /> 保存に失敗しました
                </span>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center gap-2" style={{ color: C.textMuted, fontSize: 14.5 }}>
              <Loader2 size={17} className="animate-spin" /> 読み込み中...
            </div>
          ) : (
            <>
              {activeTab === "training" && <TrainingTab data={data} addItem={addItem} removeItem={removeItem} />}
              {activeTab === "intake" && <IntakeTab data={data} addItem={addItem} removeItem={removeItem} />}
              {activeTab === "body" && <BodyTab data={data} addItem={addItem} removeItem={removeItem} />}
              {activeTab === "overview" && <OverviewTab data={data} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
