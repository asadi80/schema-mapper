export type Dialect = "sql" | "mongo" | "prisma" | "django";

export interface Field {
  name: string;
  type: string;
  pk: boolean;
  fk: boolean;
  unique: boolean;
}

export interface Table {
  name: string;
  fields: Field[];
}

export interface Relation {
  from: string;
  fromField: string;
  to: string;
  toField: string;
  type: "fk" | "m2m";
}

export interface ParseResult {
  tables: Table[];
  relations: Relation[];
}

// ── SQL ──────────────────────────────────────────────────────────────────────
function parseSQL(text: string): ParseResult {
  const tables: Table[] = [];
  const relations: Relation[] = [];

  const blocks = text.matchAll(
    /CREATE\s+TABLE\s+[`"']?(\w+)[`"']?\s*\(([^;]+)\)/gi
  );

  for (const block of blocks) {
    const name = block[1];
    const body = block[2];
    const fields: Field[] = [];

    const lines = body
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("--"));

    for (const line of lines) {
      if (/^PRIMARY\s+KEY\s*\(/i.test(line)) continue;
      if (/^UNIQUE\s*\(/i.test(line)) continue;
      if (/^INDEX/i.test(line)) continue;

      const fkMatch = line.match(
        /FOREIGN\s+KEY\s*\(([^)]+)\)\s*REFERENCES\s+[`"']?(\w+)[`"']?\s*\(([^)]+)\)/i
      );
      if (fkMatch) {
        const fromField = fkMatch[1].replace(/[`"']/g, "").trim();
        relations.push({
          from: name,
          fromField,
          to: fkMatch[2],
          toField: fkMatch[3].replace(/[`"']/g, "").trim(),
          type: "fk",
        });
        const existing = fields.find((f) => f.name === fromField);
        if (existing) existing.fk = true;
        continue;
      }

      const colMatch = line.match(
        /^[`"']?(\w+)[`"']?\s+(\w+(?:\([^)]*\))?)/i
      );
      if (colMatch) {
        const fname = colMatch[1];
        const ftype = colMatch[2];
        const isPK =
          /PRIMARY\s+KEY/i.test(line) ||
          fname.toLowerCase() === "id";
        const isUniq = /UNIQUE/i.test(line);
        fields.push({
          name: fname,
          type: ftype.toUpperCase(),
          pk: isPK,
          unique: isUniq,
          fk: false,
        });
      }
    }

    tables.push({ name, fields });
  }

  return { tables, relations };
}

// ── Prisma ────────────────────────────────────────────────────────────────────
function parsePrisma(text: string): ParseResult {
  const tables: Table[] = [];
  const relations: Relation[] = [];

  const SCALAR_TYPES = new Set([
    "String", "Int", "Boolean", "Float", "DateTime", "Json",
    "BigInt", "Decimal", "Bytes",
  ]);

  const models = text.matchAll(/model\s+(\w+)\s*\{([^}]+)\}/g);

  for (const m of models) {
    const name = m[1];
    const body = m[2];
    const fields: Field[] = [];

    for (const line of body
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)) {
      if (line.startsWith("//") || line.startsWith("@@")) continue;
      const parts = line.split(/\s+/);
      const fname = parts[0];
      const ftype = parts[1] ?? "";
      if (!fname || fname.startsWith("@")) continue;

      const isPK = line.includes("@id");
      const relMatch = line.match(
        /@relation\s*\(\s*fields:\s*\[([^\]]+)\]\s*,\s*references:\s*\[([^\]]+)\]/
      );
      const baseType = ftype.replace(/[?\[\]]/g, "");
      const isModel = !SCALAR_TYPES.has(baseType);
      const isArray = ftype.includes("[]");

      if (relMatch) {
        const fromField = relMatch[1].trim();
        relations.push({
          from: name,
          fromField,
          to: baseType,
          toField: relMatch[2].trim(),
          type: "fk",
        });
      }

      if (!isModel || isPK) {
        fields.push({
          name: fname,
          type: ftype.replace("?", ""),
          pk: isPK,
          unique: line.includes("@unique"),
          fk: false,
        });
      } else if (isModel && isArray) {
        // back-relation array — skip rendering as a field
      }
    }

    tables.push({ name, fields });
  }

  // Mark FK fields
  relations.forEach((r) => {
    const t = tables.find((t) => t.name === r.from);
    if (t) {
      const f = t.fields.find((f) => f.name === r.fromField);
      if (f) f.fk = true;
    }
  });

  return { tables, relations };
}

// ── MongoDB ───────────────────────────────────────────────────────────────────
function parseMongo(text: string): ParseResult {
  const tables: Table[] = [];
  const relations: Relation[] = [];

  const collBlocks = text.split(/\/\/\s+(\w+)\s+collection/i);
  let collName: string | null = null;

  for (let i = 0; i < collBlocks.length; i++) {
    const seg = collBlocks[i];
    if (/^\w+$/.test(seg.trim())) {
      collName = seg.trim();
      continue;
    }
    if (!collName) continue;

    const fields: Field[] = [];
    for (const line of seg
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)) {
      if (line === "{" || line === "}") continue;

      const refMatch = line.match(
        /(\w+)\s*:\s*ObjectId[,\s]*(?:\/\/\s*ref:\s*(\w+))?/
      );
      if (refMatch) {
        fields.push({
          name: refMatch[1],
          type: "ObjectId",
          pk: refMatch[1] === "_id",
          unique: refMatch[1] === "_id",
          fk: !!refMatch[2],
        });
        if (refMatch[2])
          relations.push({
            from: collName,
            fromField: refMatch[1],
            to: refMatch[2],
            toField: "_id",
            type: "fk",
          });
        continue;
      }

      const fieldMatch = line.match(/(\w+)\s*:\s*([A-Za-z]+|\[[^\]]*\]|\{)/);
      if (fieldMatch && fieldMatch[1] !== "ref") {
        fields.push({
          name: fieldMatch[1],
          type: fieldMatch[2].replace("{", "Object"),
          pk: fieldMatch[1] === "_id",
          unique: fieldMatch[1] === "_id",
          fk: false,
        });
      }
    }

    if (fields.length) tables.push({ name: collName, fields });
    collName = null;
  }

  return { tables, relations };
}

// ── Django ────────────────────────────────────────────────────────────────────
function parseDjango(text: string): ParseResult {
  const tables: Table[] = [];
  const relations: Relation[] = [];

  const classes = text.matchAll(
    /class\s+(\w+)\s*\([^)]*Model[^)]*\)\s*:\s*\n((?:[ \t]+[^\n]+\n?)*)/g
  );

  for (const cls of classes) {
    const name = cls[1];
    const body = cls[2];
    const fields: Field[] = [];

    for (const line of body
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)) {
      if (
        line.startsWith("def ") ||
        line.startsWith("class ") ||
        line.startsWith("#") ||
        line.startsWith("Meta")
      )
        continue;

      const eqIdx = line.indexOf("=");
      if (eqIdx < 0) continue;

      const fname = line.substring(0, eqIdx).trim();
      const fdef = line.substring(eqIdx + 1).trim();
      const isPK = fname === "id" || /AutoField|BigAutoField/.test(fdef);
      const fkMatch = fdef.match(/ForeignKey\((\w+)/);
      const m2mMatch = fdef.match(/ManyToManyField\((\w+)/);
      const typeMatch = fdef.match(/models\.(\w+)Field/);
      const ftype = typeMatch ? typeMatch[1] : "Field";

      if (fkMatch) {
        fields.push({ name: fname + "_id", type: "FK", pk: false, unique: false, fk: true });
        relations.push({
          from: name,
          fromField: fname + "_id",
          to: fkMatch[1],
          toField: "id",
          type: "fk",
        });
      } else if (m2mMatch) {
        relations.push({
          from: name,
          fromField: fname,
          to: m2mMatch[1],
          toField: "id",
          type: "m2m",
        });
      } else {
        fields.push({
          name: fname,
          type: ftype.toUpperCase(),
          pk: isPK,
          unique: /unique=True/.test(fdef),
          fk: false,
        });
      }
    }

    tables.push({ name, fields });
  }

  return { tables, relations };
}

// ── Auto-detect + dispatch ────────────────────────────────────────────────────
export function parseSchema(text: string, dialect: Dialect): ParseResult | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  try {
    if (dialect === "prisma" || /\bmodel\s+\w+\s*\{/.test(trimmed))
      return parsePrisma(trimmed);
    if (dialect === "mongo" || /ObjectId|collection/.test(trimmed))
      return parseMongo(trimmed);
    if (dialect === "django" || /models\.Model/.test(trimmed))
      return parseDjango(trimmed);
    return parseSQL(trimmed);
  } catch {
    return null;
  }
}
