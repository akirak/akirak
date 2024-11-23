export const DATABASE = 'github-stars.duckdb'

export async function queryDuckdb<T>(database: string, sql: string): Promise<T[]> {
  const proc = Bun.spawn(['duckdb', '-json', '-no-stdin', database, sql])
  return await new Response(proc.stdout).json()
}
