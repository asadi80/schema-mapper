"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Table, Relation } from "@/lib/parser";
import type { Position } from "@/lib/layout";
import { computeLayout } from "@/lib/layout";
import TableCard from "./TableCard";
import RelationLines from "./RelationLines";

interface CanvasProps {
  tables: Table[];
  relations: Relation[];
}

interface DragState {
  tableName: string;
  startMouseX: number;
  startMouseY: number;
  startX: number;
  startY: number;
}

export default function Canvas({ tables, relations }: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 800, h: 600 });
  const [positions, setPositions] = useState<Record<string, Position>>({});
  const [dragging, setDragging] = useState<string | null>(null);
  const dragRef = useRef<DragState | null>(null);

  // Recompute layout when tables change
  useEffect(() => {
    if (tables.length) setPositions(computeLayout(tables));
  }, [tables]);

  // Track canvas size
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setSize({ w: el.offsetWidth, h: el.offsetHeight });
    });
    ro.observe(el);
    setSize({ w: el.offsetWidth, h: el.offsetHeight });
    return () => ro.disconnect();
  }, []);

  // Mouse events for drag
  const handleMouseDown = useCallback(
    (e: React.MouseEvent, tableName: string) => {
      if (e.button !== 0) return;
      e.preventDefault();
      const pos = positions[tableName];
      dragRef.current = {
        tableName,
        startMouseX: e.clientX,
        startMouseY: e.clientY,
        startX: pos?.x ?? 0,
        startY: pos?.y ?? 0,
      };
      setDragging(tableName);
    },
    [positions]
  );

  useEffect(() => {
    function onMove(e: MouseEvent) {
      const d = dragRef.current;
      if (!d) return;
      const dx = e.clientX - d.startMouseX;
      const dy = e.clientY - d.startMouseY;
      setPositions((prev) => ({
        ...prev,
        [d.tableName]: { x: d.startX + dx, y: d.startY + dy },
      }));
    }
    function onUp() {
      dragRef.current = null;
      setDragging(null);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  function autoLayout() {
    if (tables.length) setPositions(computeLayout(tables));
  }

  const isEmpty = tables.length === 0;

  return (
    <div
      ref={containerRef}
      className="flex-1 relative overflow-hidden canvas-grid"
      style={{ background: "var(--navy)", opacity: 0.99 }}
    >
      {/* SVG relations layer */}
      <RelationLines
        relations={relations}
        tables={tables}
        positions={positions}
        width={size.w}
        height={size.h}
      />

      {/* Table cards */}
      {tables.map((t) => {
        const pos = positions[t.name];
        if (!pos) return null;
        return (
          <TableCard
            key={t.name}
            table={t}
            x={pos.x}
            y={pos.y}
            onMouseDown={handleMouseDown}
            isDragging={dragging === t.name}
          />
        );
      })}

      {/* Empty state */}
      {isEmpty && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none">
          <span style={{ fontSize: 56, opacity: 0.08 }}>⬡</span>
          <p
            className="text-sm text-center leading-relaxed"
            style={{ color: "var(--muted)", opacity: 0.5 }}
          >
            Paste a schema and click Map Schema
            <br />
            to visualize your database structure
          </p>
        </div>
      )}

      {/* Toolbar */}
      <div className="absolute top-3.5 right-3.5 flex gap-2" style={{ zIndex: 10 }}>
        {[
          { icon: "⊞", title: "Auto Layout", onClick: autoLayout },
          {
            icon: "⤢",
            title: "Fit View",
            onClick: autoLayout,
          },
        ].map((btn) => (
          <button
            key={btn.title}
            title={btn.title}
            onClick={btn.onClick}
            className="flex items-center justify-center w-9 h-9 rounded-lg text-sm transition-all"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              color: "var(--muted)",
              cursor: "pointer",
            }}
          >
            {btn.icon}
          </button>
        ))}
      </div>

      {/* Legend */}
      {!isEmpty && (
        <div
          className="absolute bottom-3.5 left-3.5 flex gap-4 items-center px-3.5 py-2.5 rounded-xl"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            zIndex: 10,
          }}
        >
          <div className="flex items-center gap-2">
            <div
              className="rounded-sm"
              style={{ width: 20, height: 2, background: "var(--emerald)" }}
            />
            <span className="text-xs font-mono" style={{ color: "var(--muted)" }}>
              FK relation
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="rounded-sm"
              style={{
                width: 20,
                height: 1,
                background: "var(--indigo)",
                borderTop: "1px dashed var(--indigo)",
              }}
            />
            <span className="text-xs font-mono" style={{ color: "var(--muted)" }}>
              M2M / index ref
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
