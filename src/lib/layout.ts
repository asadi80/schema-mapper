import type { Table } from "./parser";

export interface Position {
  x: number;
  y: number;
}

export const CARD_WIDTH = 220;
export const FIELD_ROW_HEIGHT = 31;
export const CARD_HEAD_HEIGHT = 44;

export function getCardHeight(table: Table): number {
  return CARD_HEAD_HEIGHT + table.fields.length * FIELD_ROW_HEIGHT;
}

export function computeLayout(tables: Table[]): Record<string, Position> {
  const positions: Record<string, Position> = {};
  const cols = Math.ceil(Math.sqrt(tables.length)) || 1;
  const colGap = 280;
  const rowGap = 60;
  const startX = 48;
  const startY = 48;

  tables.forEach((t, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    // compute row height based on tallest card in that row
    let rowOffset = startY;
    for (let r = 0; r < row; r++) {
      let maxH = 0;
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        if (idx < tables.length) {
          maxH = Math.max(maxH, getCardHeight(tables[idx]));
        }
      }
      rowOffset += maxH + rowGap;
    }
    positions[t.name] = { x: startX + col * colGap, y: rowOffset };
  });

  return positions;
}
