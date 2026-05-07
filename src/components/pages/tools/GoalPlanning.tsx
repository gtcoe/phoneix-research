"use client";
import { useState } from "react";
import { fmt } from "@/lib/formatters";
import { Icon } from "@/components/ui";
import type { PhoenixData } from "@/types";

export function GoalPlanning({ data }: { data: PhoenixData }) {
  const [goals, setGoals] = useState(data.goals);
  const [showAdd, setShowAdd] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: "",
    targetAmount: "",
    targetYear: "2030",
    currentAmount: "",
    monthlyAddition: "",
    icon: "🎯",
    color: "#6366f1",
  });

  const deleteGoal = (id: string) =>
    setGoals((prev) => prev.filter((g) => g.id !== id));

  const addGoal = () => {
    const goal = {
      id: `g${Date.now()}`,
      name: newGoal.name,
      targetAmount: parseFloat(newGoal.targetAmount) || 0,
      targetYear: parseInt(newGoal.targetYear) || 2030,
      currentAmount: parseFloat(newGoal.currentAmount) || 0,
      monthlyAddition: parseFloat(newGoal.monthlyAddition) || 0,
      icon: newGoal.icon,
      color: newGoal.color,
    };
    setGoals((prev) => [...prev, goal]);
    setShowAdd(false);
    setNewGoal({
      name: "",
      targetAmount: "",
      targetYear: "2030",
      currentAmount: "",
      monthlyAddition: "",
      icon: "🎯",
      color: "#6366f1",
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <div className="text-sm font-semibold text-[var(--text)]">
          Financial Goals
        </div>
        <button
            type="button"
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 py-[7px] px-3.5 bg-[var(--accent)] border-0 rounded-lg cursor-pointer text-white text-xs font-semibold"
        >
          <Icon name="plus" size={14} color="#fff" />
          Add Goal
        </button>
      </div>

      {showAdd && (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl py-4 px-5 mb-5">
          <div className="text-sm font-semibold text-[var(--text)] mb-3.5">
            New Goal
          </div>
          <div className="grid grid-cols-3 gap-3 mb-3">
            {[
              {
                label: "Goal Name",
                key: "name",
                type: "text",
                placeholder: "e.g. Retirement Fund",
              },
              {
                label: "Target Amount (₹)",
                key: "targetAmount",
                type: "number",
                placeholder: "10000000",
              },
              {
                label: "Target Year",
                key: "targetYear",
                type: "number",
                placeholder: "2030",
              },
              {
                label: "Current Amount (₹)",
                key: "currentAmount",
                type: "number",
                placeholder: "0",
              },
              {
                label: "Monthly Addition (₹)",
                key: "monthlyAddition",
                type: "number",
                placeholder: "50000",
              },
            ].map((f) => (
              <div key={f.key}>
                <label className="text-[11px] text-[var(--muted)] block mb-1">
                  {f.label}
                </label>
                <input
                  type={f.type}
                  value={(newGoal as Record<string, string>)[f.key]}
                  onChange={(e) =>
                    setNewGoal((prev) => ({ ...prev, [f.key]: e.target.value }))
                  }
                  placeholder={f.placeholder}
                  className="w-full py-[7px] px-[10px] bg-[var(--bg)] border border-[var(--border)] rounded-md text-[var(--text)] text-xs box-border"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button
                type="button"
              onClick={addGoal}
              className="py-[7px] px-[18px] bg-[var(--accent)] border-0 rounded-md text-white cursor-pointer text-xs font-semibold"
            >
              Save
            </button>
            <button
                type="button"
              onClick={() => setShowAdd(false)}
              className="py-[7px] px-3.5 bg-[var(--surface2)] border border-[var(--border)] rounded-md text-[var(--muted)] cursor-pointer text-xs"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {goals.length === 0 ? (
        <div className="p-[60px] text-center text-[var(--muted)] bg-[var(--card)] border border-[var(--border)] rounded-xl">
          <div className="text-[40px]">🎯</div>
          <div className="mt-3.5 text-base font-semibold text-[var(--text)]">
            No financial goals yet
          </div>
          <div className="mt-1.5 text-sm">
            Click "Add Goal" to set your first financial target
          </div>
        </div>
      ) : (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 16,
        }}
      >
        {goals.map((g) => {
          const pct = Math.min(
            100,
            g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0,
          );
          const remaining = g.targetAmount - g.currentAmount;
          const yearsLeft = g.targetYear - new Date().getFullYear();
          const monthsLeft = yearsLeft * 12;
          const monthlyNeeded =
            monthsLeft > 0 && remaining > 0 ? remaining / monthsLeft : 0;
          const onTrack = g.monthlyAddition >= monthlyNeeded;

          return (
            <div
              key={g.id}
              className="bg-[var(--card)] border border-[var(--border)] rounded-xl py-4 px-[18px]"
            >
              <div className="flex justify-between items-start mb-3.5">
                <div className="flex items-center gap-[10px]">
                  <span className="text-2xl">{g.icon}</span>
                  <div>
                    <div className="text-sm font-semibold text-[var(--text)]">
                      {g.name}
                    </div>
                    <div className="text-[11px] text-[var(--muted)]">
                      Target: {g.targetYear}
                    </div>
                  </div>
                </div>
                <button
                    type="button"
                  onClick={() => deleteGoal(g.id)}
                  className="bg-transparent border-0 cursor-pointer text-[var(--muted)] p-1"
                >
                  <Icon name="trash" size={14} />
                </button>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-xs text-[var(--muted)]">
                  {fmt(g.currentAmount)} saved
                </span>
                <span className="text-xs font-semibold text-[var(--text)] font-[var(--font-mono)]">
                  {pct.toFixed(0)}%
                </span>
              </div>
              <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden mb-3">
                <div
                  className="h-full rounded-full transition-[width] duration-[400ms]"
                  style={{
                    width: `${pct}%`,
                    background: g.color || "var(--accent)",
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-[10px]">
                <div>
                  <div className="text-[10px] text-[var(--muted)]">
                    Target
                  </div>
                  <div className="text-sm font-bold font-[var(--font-mono)] text-[var(--text)]">
                    {fmt(g.targetAmount)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-[var(--muted)]">
                    Remaining
                  </div>
                  <div className="text-sm font-bold font-[var(--font-mono)] text-[var(--text)]">
                    {fmt(remaining)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-[var(--muted)]">
                    Monthly SIP
                  </div>
                  <div className="text-sm font-bold font-[var(--font-mono)] text-[var(--text)]">
                    {fmt(g.monthlyAddition)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-[var(--muted)]">
                    Needed/month
                  </div>
                  <div
                    className={`text-sm font-bold font-[var(--font-mono)] ${onTrack ? "text-[var(--gain)]" : "text-[var(--loss)]"}`}
                  >
                    {fmt(monthlyNeeded)}
                  </div>
                </div>
              </div>
              <div
                className={`mt-[10px] text-xs py-1.5 px-[10px] rounded-md ${onTrack ? "text-[var(--gain)]" : "text-[var(--loss)]"}`}
                style={{
                  background: onTrack
                    ? "rgba(16,185,129,.12)"
                    : "rgba(239,68,68,.12)",
                }}
              >
                {yearsLeft}yr left ·{" "}
                {onTrack
                  ? "✓ On track"
                  : `⚠ Need +${fmt(monthlyNeeded - g.monthlyAddition)}/mo more`}
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
}
