"use client";
import { useState } from "react";
import { fmt } from "@/lib/formatters";
import { Icon } from "@/components/ui";
import type { PhoenixData } from "@/lib/data";

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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
          Financial Goals
        </div>
        <button
          onClick={() => setShowAdd(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 14px",
            background: "var(--accent)",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            color: "#fff",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          <Icon name="plus" size={14} color="#fff" />
          Add Goal
        </button>
      </div>

      {showAdd && (
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "16px 20px",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--text)",
              marginBottom: 14,
            }}
          >
            New Goal
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 12,
              marginBottom: 12,
            }}
          >
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
                <label
                  style={{
                    fontSize: 11,
                    color: "var(--muted)",
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  {f.label}
                </label>
                <input
                  type={f.type}
                  value={(newGoal as Record<string, string>)[f.key]}
                  onChange={(e) =>
                    setNewGoal((prev) => ({ ...prev, [f.key]: e.target.value }))
                  }
                  placeholder={f.placeholder}
                  style={{
                    width: "100%",
                    padding: "7px 10px",
                    background: "var(--bg)",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    color: "var(--text)",
                    fontSize: 12,
                    boxSizing: "border-box",
                  }}
                />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={addGoal}
              style={{
                padding: "7px 18px",
                background: "var(--accent)",
                border: "none",
                borderRadius: 6,
                color: "#fff",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              Save
            </button>
            <button
              onClick={() => setShowAdd(false)}
              style={{
                padding: "7px 14px",
                background: "var(--surface2)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                color: "var(--muted)",
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {goals.length === 0 ? (
        <div
          style={{
            padding: 60,
            textAlign: "center",
            color: "var(--muted)",
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
          }}
        >
          <div style={{ fontSize: 40 }}>🎯</div>
          <div
            style={{
              marginTop: 14,
              fontSize: 15,
              fontWeight: 600,
              color: "var(--text)",
            }}
          >
            No financial goals yet
          </div>
          <div style={{ marginTop: 6, fontSize: 13 }}>
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
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: "16px 18px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 14,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 24 }}>{g.icon}</span>
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "var(--text)",
                      }}
                    >
                      {g.name}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>
                      Target: {g.targetYear}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => deleteGoal(g.id)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--muted)",
                    padding: 4,
                  }}
                >
                  <Icon name="trash" size={14} />
                </button>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <span style={{ fontSize: 12, color: "var(--muted)" }}>
                  {fmt(g.currentAmount)} saved
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--text)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {pct.toFixed(0)}%
                </span>
              </div>
              <div
                style={{
                  height: 8,
                  background: "var(--border)",
                  borderRadius: 99,
                  overflow: "hidden",
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    width: `${pct}%`,
                    height: "100%",
                    background: g.color || "var(--accent)",
                    borderRadius: 99,
                    transition: "width .4s",
                  }}
                />
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                <div>
                  <div style={{ fontSize: 10, color: "var(--muted)" }}>
                    Target
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      fontFamily: "var(--font-mono)",
                      color: "var(--text)",
                    }}
                  >
                    {fmt(g.targetAmount)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "var(--muted)" }}>
                    Remaining
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      fontFamily: "var(--font-mono)",
                      color: "var(--text)",
                    }}
                  >
                    {fmt(remaining)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "var(--muted)" }}>
                    Monthly SIP
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      fontFamily: "var(--font-mono)",
                      color: "var(--text)",
                    }}
                  >
                    {fmt(g.monthlyAddition)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "var(--muted)" }}>
                    Needed/month
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      fontFamily: "var(--font-mono)",
                      color: onTrack ? "var(--gain)" : "var(--loss)",
                    }}
                  >
                    {fmt(monthlyNeeded)}
                  </div>
                </div>
              </div>
              <div
                style={{
                  marginTop: 10,
                  fontSize: 12,
                  padding: "6px 10px",
                  borderRadius: 6,
                  background: onTrack
                    ? "rgba(16,185,129,.12)"
                    : "rgba(239,68,68,.12)",
                  color: onTrack ? "var(--gain)" : "var(--loss)",
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
