"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Canvas from "@/components/Canvas";
import { parseSchema, type Dialect, type Table, type Relation } from "@/lib/parser";

export default function Home() {
  const [tables, setTables] = useState<Table[]>([]);
  const [relations, setRelations] = useState<Relation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    tables: number;
    fields: number;
    relations: number;
  } | null>(null);

  function handleParse(text: string, dialect: Dialect) {
    setError(null);
    if (!text.trim()) {
      setError("Paste a schema first");
      return;
    }
    const result = parseSchema(text, dialect);
    if (!result || !result.tables.length) {
      setError(
        "Could not parse schema. Check the format or try a different dialect tab."
      );
      return;
    }
    setTables(result.tables);
    setRelations(result.relations);
    setStats({
      tables: result.tables.length,
      fields: result.tables.reduce((s, t) => s + t.fields.length, 0),
      relations: result.relations.length,
    });
  }

  return (
    <div className="flex" style={{ height: "100vh", overflow: "hidden" }}>
      <Sidebar onParse={handleParse} stats={stats} error={error} />
      <Canvas tables={tables} relations={relations} />
    </div>
  );
}
