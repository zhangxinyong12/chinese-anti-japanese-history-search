import fs from "fs"
import path from "path"
import { neon } from "@neondatabase/serverless"

export interface HistoricalFigureRecord {
  id: number
  name: string
  period: string
  identity: string
  activities: string
  note: string | null
  year: number | null
  punishment: string | null
  deathPlace: string | null
}

interface DatabaseHistoricalFigureRow {
  id: number
  name: string
  period: string
  identity: string
  activities: string
  note: string | null
  year: number | null
  punishment: string | null
  death_place: string | null
}

export function loadJsonFallback(): HistoricalFigureRecord[] {
  try {
    const dataPath = path.join(process.cwd(), "data", "historical-figures.json")
    const { traitors = [] } = JSON.parse(fs.readFileSync(dataPath, "utf8")) as {
      traitors?: Partial<HistoricalFigureRecord>[]
    }

    return traitors.map((figure, index) => ({
      id: Number(figure.id ?? index + 1),
      name: figure.name ?? "",
      period: figure.period ?? "1931-1945",
      identity: figure.identity ?? "",
      activities: figure.activities ?? "",
      note: figure.note ?? null,
      year: figure.year ?? null,
      punishment: figure.punishment ?? null,
      deathPlace: figure.deathPlace ?? null,
    }))
  } catch {
    return []
  }
}

export async function loadHistoricalFigures(): Promise<HistoricalFigureRecord[]> {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error("DATABASE_URL is not set")

  const sql = neon(url)
  const rows = await sql`
    SELECT id, name, period, identity, activities, note, year, punishment, death_place
    FROM historical_figures
    WHERE is_deleted = false
    ORDER BY id
  `

  return rows.map((row) => {
    const typedRow = row as unknown as DatabaseHistoricalFigureRow

    return {
      id: Number(typedRow.id),
      name: typedRow.name,
      period: typedRow.period,
      identity: typedRow.identity,
      activities: typedRow.activities,
      note: typedRow.note,
      year: typedRow.year,
      punishment: typedRow.punishment,
      deathPlace: typedRow.death_place,
    }
  })
}
