# Schema Mapper

A visual database schema explorer built with Next.js 15 and Tailwind CSS v4. Paste any database schema and see your tables, fields, and relationships mapped on an interactive canvas.

## Features

- **4 Dialects**: SQL, Prisma, MongoDB, Django ORM
- **Visual canvas**: Draggable table cards with relationship lines
- **Field badges**: PK / FK / UQ annotations per field
- **Auto-layout**: Smart grid placement based on table count
- **Dark theme**: Designed for developers

## Getting Started

### Prerequisites

- Node.js 18+
- npm / yarn / pnpm

### Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/
│   ├── globals.css       # Global styles + CSS variables
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Main page (state root)
├── components/
│   ├── Sidebar.tsx       # Schema input panel
│   ├── Canvas.tsx        # Drag canvas + toolbar
│   ├── TableCard.tsx     # Individual table card
│   └── RelationLines.tsx # SVG relationship lines
└── lib/
    ├── parser.ts         # Schema parsers for all dialects
    ├── layout.ts         # Auto-layout algorithm
    └── samples.ts        # Sample schemas per dialect
```

## Supported Schema Formats

### SQL
Standard `CREATE TABLE` with `FOREIGN KEY ... REFERENCES` constraints.

### Prisma
`model` blocks with `@id`, `@unique`, `@relation(fields: [...], references: [...])`.

### MongoDB
Comment-annotated collection schemas using `// CollectionName collection` headers with `ObjectId` refs via `// ref: CollectionName`.

### Django
`models.Model` subclasses with `ForeignKey`, `ManyToManyField`, and standard field types.

## Extending

To add a new dialect, add a parser function in `src/lib/parser.ts` returning `{ tables, relations }` and register it in `parseSchema()`. Add a sample in `src/lib/samples.ts` and a tab entry in `Sidebar.tsx`.
