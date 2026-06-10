"use client";

import type { Relation, Table } from "@/lib/parser";
import type { Position } from "@/lib/layout";
import { getCardHeight, CARD_WIDTH } from "@/lib/layout";

interface RelationLinesProps {
  relations: Relation[];
  tables: Table[];
  positions: Record<string, Position>;
  width: number;
  height: number;
}

const EMERALD = "#10b981";
const INDIGO = "#6366f1";

export default function RelationLines({
  relations,
  tables,
  positions,
  width,
  height,
}: RelationLinesProps) {
  if (!relations.length) return null;

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={width}
      height={height}
      style={{ zIndex: 1 }}
    >
      <defs>
        <marker
          id="arr-fk"
          markerWidth="8"
          markerHeight="8"
          refX="6"
          refY="3"
          orient="auto"
        >
          <path
            d="M0,0 L6,3 L0,6"
            fill="none"
            stroke={EMERALD}
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </marker>
        <marker
          id="arr-m2m"
          markerWidth="8"
          markerHeight="8"
          refX="6"
          refY="3"
          orient="auto"
        >
          <path
            d="M0,0 L6,3 L0,6"
            fill="none"
            stroke={INDIGO}
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </marker>
      </defs>

      {relations.map((rel, i) => {
        const fromTable = tables.find((t) => t.name === rel.from);
        const toTable = tables.find((t) => t.name === rel.to);
        const fromPos = positions[rel.from];
        const toPos = positions[rel.to];
        if (!fromTable || !toTable || !fromPos || !toPos) return null;

        const fh = getCardHeight(fromTable);
        const th = getCardHeight(toTable);
        const fw = CARD_WIDTH;
        const tw = CARD_WIDTH;

        const fcx = fromPos.x + fw / 2;
        const tcx = toPos.x + tw / 2;

        let x1: number, y1: number, x2: number, y2: number;
        if (tcx > fcx) {
          x1 = fromPos.x + fw;
          y1 = fromPos.y + fh / 2;
          x2 = toPos.x;
          y2 = toPos.y + th / 2;
        } else {
          x1 = fromPos.x;
          y1 = fromPos.y + fh / 2;
          x2 = toPos.x + tw;
          y2 = toPos.y + th / 2;
        }

        const dx = Math.abs(x2 - x1) * 0.5;
        const color = rel.type === "m2m" ? INDIGO : EMERALD;
        const markerId = rel.type === "m2m" ? "arr-m2m" : "arr-fk";
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2 - 8;

        return (
          <g key={i}>
            <path
              d={`M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`}
              fill="none"
              stroke={color}
              strokeWidth="1.5"
              opacity="0.7"
              strokeDasharray={rel.type === "m2m" ? "5 4" : undefined}
              markerEnd={`url(#${markerId})`}
            />
            <text
              x={mx}
              y={my}
              textAnchor="middle"
              fill={color}
              fontSize="9"
              fontFamily="monospace"
              opacity="0.6"
            >
              {rel.fromField}→{rel.toField}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
