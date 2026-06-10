"use client";

import type { Table } from "@/lib/parser";

interface TableCardProps {
  table: Table;
  x: number;
  y: number;
  onMouseDown: (e: React.MouseEvent, tableName: string) => void;
  isDragging: boolean;
}

function FieldBadge({ field }: { field: Table["fields"][number] }) {
  if (field.pk) {
    return (
      <span
        className="text-[9px] font-mono font-bold px-1 py-0.5 rounded min-w-[26px] text-center"
        style={{
          background: "rgba(245,158,11,0.15)",
          color: "var(--amber)",
          border: "1px solid rgba(245,158,11,0.3)",
        }}
      >
        PK
      </span>
    );
  }
  if (field.fk) {
    return (
      <span
        className="text-[9px] font-mono font-bold px-1 py-0.5 rounded min-w-[26px] text-center"
        style={{
          background: "rgba(16,185,129,0.12)",
          color: "var(--emerald)",
          border: "1px solid rgba(16,185,129,0.25)",
        }}
      >
        FK
      </span>
    );
  }
  if (field.unique) {
    return (
      <span
        className="text-[9px] font-mono font-bold px-1 py-0.5 rounded min-w-[26px] text-center"
        style={{
          background: "rgba(56,189,248,0.1)",
          color: "var(--sky)",
          border: "1px solid rgba(56,189,248,0.2)",
        }}
      >
        UQ
      </span>
    );
  }
  return (
    <span
      className="text-[9px] font-mono font-bold px-1 py-0.5 rounded min-w-[26px] text-center"
      style={{
        background: "rgba(148,163,184,0.08)",
        color: "var(--muted)",
        border: "1px solid rgba(148,163,184,0.15)",
      }}
    >
      &nbsp;
    </span>
  );
}

export default function TableCard({
  table,
  x,
  y,
  onMouseDown,
  isDragging,
}: TableCardProps) {
  return (
    <div
      className="absolute table-card select-none"
      style={{
        left: x,
        top: y,
        minWidth: 220,
        background: "var(--surface)",
        border: `1px solid ${isDragging ? "var(--border2)" : "var(--border)"}`,
        borderRadius: 12,
        boxShadow: isDragging
          ? "0 16px 48px rgba(99,102,241,0.25), 0 8px 32px rgba(0,0,0,0.5)"
          : "0 4px 24px rgba(0,0,0,0.4)",
        zIndex: isDragging ? 99 : 2,
        transition: "box-shadow 0.15s, border-color 0.15s",
      }}
      onMouseDown={(e) => onMouseDown(e, table.name)}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 rounded-t-xl"
        style={{
          background: "var(--surface2)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div
          className="flex items-center justify-center rounded-md text-[10px] flex-shrink-0"
          style={{
            width: 20,
            height: 20,
            background: "linear-gradient(135deg, var(--indigo), var(--sky))",
          }}
        >
          ⬡
        </div>
        <span
          className="text-sm font-bold font-mono truncate"
          style={{ color: "var(--text)" }}
        >
          {table.name}
        </span>
        <span
          className="text-[10px] ml-auto px-1.5 py-0.5 rounded-full font-mono"
          style={{ background: "var(--surface3)", color: "var(--muted)" }}
        >
          {table.fields.length}
        </span>
      </div>

      {/* Fields */}
      {table.fields.map((field, i) => (
        <div
          key={field.name}
          className="flex items-center gap-2 px-3"
          style={{
            height: 31,
            borderBottom:
              i < table.fields.length - 1
                ? "1px solid rgba(99,102,241,0.07)"
                : "none",
            borderRadius:
              i === table.fields.length - 1 ? "0 0 12px 12px" : undefined,
          }}
        >
          <FieldBadge field={field} />
          <span
            className="text-xs font-mono flex-1 truncate"
            style={{ color: "var(--text)" }}
          >
            {field.name}
          </span>
          <span
            className="text-[10px] font-mono"
            style={{ color: "#5a6688" }}
          >
            {field.type}
          </span>
        </div>
      ))}
    </div>
  );
}
