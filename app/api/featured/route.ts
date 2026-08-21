import { NextResponse } from "next/server"
import { loadHistoricalFigures, loadJsonFallback } from "@/lib/historical-figures"

export const dynamic = "force-dynamic"

export async function GET() {
  let figures
  let source = "database"

  try {
    figures = await loadHistoricalFigures()
  } catch (error) {
    console.error("Database query failed, falling back to JSON:", error)
    figures = loadJsonFallback()
    source = "json-fallback"
  }

  if (figures.length === 0) {
    figures = loadJsonFallback()
    source = "json-fallback"
  }

  return NextResponse.json({
    figures,
    total: figures.length,
    source,
  })
}
