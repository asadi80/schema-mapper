"use client";

import { useState } from "react";
import type { Dialect } from "@/lib/parser";
import { SAMPLES } from "@/lib/samples";

interface SidebarProps {
  onParse: (text: string, dialect: Dialect) => void;
  stats: { tables: number; fields: number; relations: number } | null;
  error: string | null;
}

const TABS: { id: Dialect; label: string }[] = [
  { id: "sql", label: "SQL" },
  { id: "mongo", label: "Mongo" },
  { id: "prisma", label: "Prisma" },
  { id: "django", label: "Django" },
];

export default function Sidebar({ onParse, stats, error }: SidebarProps) {
  const [dialect, setDialectState] = useState<Dialect>("sql");
  const [text, setText] = useState(SAMPLES.sql);

  function handleDialect(d: Dialect) {
    setDialectState(d);
    setText(SAMPLES[d]);
  }

  return (
    <aside
      className="flex flex-col overflow-hidden"
      style={{
        width: 340,
        minWidth: 340,
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-4"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div
          className="flex items-center justify-center rounded-lg text-white text-sm font-bold"
          style={{
            width: 30,
            height: 30,
            background: "linear-gradient(135deg, var(--indigo), var(--sky))",
          }}
        >
          ⬡
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>
            Schema Mapper
          </p>
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            Paste any database schema
          </p>
        </div>
      </div>

      {/* Dialect tabs */}
      <div className="flex gap-1.5 px-3 pt-3">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleDialect(tab.id)}
            className="flex-1 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all"
            style={
              dialect === tab.id
                ? {
                    background: "var(--indigo)",
                    border: "1px solid var(--indigo)",
                    color: "#fff",
                  }
                : {
                    background: "var(--surface2)",
                    border: "1px solid var(--border)",
                    color: "var(--muted)",
                    cursor: "pointer",
                  }
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Schema input */}
      <div className="flex flex-col gap-2 px-3 pt-3 pb-3 flex-1 overflow-hidden">
        <p
          className="text-xs font-mono tracking-wider"
          style={{ color: "var(--muted)" }}
        >
          // PASTE YOUR SCHEMA
        </p>
        <textarea
          className="flex-1 w-full"
          value={text}
          onChange={(e) => setText(e.target.value)}
          spellCheck={false}
          placeholder={`-- Paste your ${dialect.toUpperCase()} schema here...`}
        />

        {error && (
          <div
            className="text-xs font-mono px-3 py-2 rounded-lg"
            style={{
              color: "var(--rose)",
              background: "rgba(244,63,94,0.08)",
              border: "1px solid rgba(244,63,94,0.2)",
            }}
          >
            ⚠ {error}
          </div>
        )}

        <button
          onClick={() => onParse(text, dialect)}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all hover:-translate-y-px active:translate-y-0"
          style={{ background: "var(--indigo)" }}
        >
          <span>⬡</span> Map Schema
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div
          className="flex gap-2 px-3 py-3"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          {[
            { num: stats.tables, label: "TABLES" },
            { num: stats.fields, label: "FIELDS" },
            { num: stats.relations, label: "RELATIONS" },
          ].map((s) => (
            <div
              key={s.label}
              className="flex-1 rounded-lg py-2 text-center"
              style={{ background: "var(--surface2)" }}
            >
              <p
                className="text-lg font-bold font-mono"
                style={{ color: "var(--indigo2)" }}
              >
                {s.num}
              </p>
              <p className="text-xs tracking-wider mt-0.5" style={{ color: "var(--muted)" }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}
