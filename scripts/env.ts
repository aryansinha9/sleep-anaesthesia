// Loads .env.local / .env for the CLI scripts (Next.js loads them itself for the app).
import { existsSync, readFileSync } from 'node:fs'

for (const file of ['.env.local', '.env']) {
  if (!existsSync(file)) continue
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '')
  }
}

export function need(name: string): string {
  const v = process.env[name]
  if (!v) {
    console.error(`Missing ${name}. Add it to .env.local (see .env.example).`)
    process.exit(1)
  }
  return v
}
