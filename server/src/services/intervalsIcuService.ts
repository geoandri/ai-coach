import axios from 'axios'
import { queryRows, queryOne, run, saveDb } from '../db/client.js'
import type { ActivityDto, SyncResultDto, PagedResponse } from '../types/index.js'

const INTERVALS_API_BASE = 'https://intervals.icu/api/v1'
const RUNNING_SPORT_TYPES = ['Run', 'TrailRun', 'VirtualRun']
// intervals.icu rate limit is 10 req/s — stay well under it
const REQUEST_DELAY_MS = 150

function log(msg: string) {
  console.log(`[intervals.icu] ${msg}`)
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function authHeader(apiKey: string): string {
  return `Basic ${Buffer.from(`API_KEY:${apiKey}`).toString('base64')}`
}

function toDistanceKm(distanceM: number | null | undefined): number {
  if (!distanceM) return 0
  return Math.round((distanceM / 1000) * 100) / 100
}

function toDto(row: Record<string, unknown>): ActivityDto {
  return {
    id: row.id as number,
    stravaId: row.intervals_id as number,
    name: (row.name as string | null) ?? null,
    sportType: (row.sport_type as string | null) ?? null,
    activityDate: row.activity_date as string,
    startDatetime: (row.start_datetime as string | null) ?? null,
    distanceKm: toDistanceKm(row.distance_m as number | null),
    movingTimeS: (row.moving_time_s as number | null) ?? null,
    totalElevationM: (row.total_elevation_m as number | null) ?? null,
    averageHeartrate: (row.average_heartrate as number | null) ?? null,
  }
}

function parseActivity(
  data: Record<string, unknown>,
  intervalsAthleteId: string,
  internalAthleteId?: number
) {
  const startDateStr = (data.start_date_local as string | undefined) ?? ''
  const startDt = startDateStr.replace('Z', '')
  const activityDate = startDt.substring(0, 10)

  return {
    intervalsId: String(data.id).replace(/^i/, ''),
    athleteId: intervalsAthleteId,
    internalAthleteId: internalAthleteId ?? null,
    name: (data.name as string | undefined) ?? null,
    sportType: (data.type as string | undefined) ?? null,
    activityDate,
    startDatetime: startDt || null,
    distanceM: (data.distance as number | undefined) ?? null,
    movingTimeS: (data.moving_time as number | undefined) ?? null,
    elapsedTimeS: (data.elapsed_time as number | undefined) ?? null,
    totalElevationM: (data.total_elevation_gain as number | undefined) ?? null,
    averageSpeed: (data.average_speed as number | undefined) ?? null,
    maxSpeed: (data.max_speed as number | undefined) ?? null,
    averageHeartrate: (data.average_heartrate as number | undefined) ?? null,
    maxHeartrate: (data.max_heartrate as number | undefined) ?? null,
    trainer: (data.trainer as boolean | undefined) ? 1 : 0,
    manual: (data.manual as boolean | undefined) ? 1 : 0,
  }
}

export async function validateCredentials(athleteId: string, apiKey: string): Promise<boolean> {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const oldest = thirtyDaysAgo.toISOString().substring(0, 10)
  log(`Validating credentials for athlete ${athleteId}`)
  try {
    await axios.get(
      `${INTERVALS_API_BASE}/athlete/${athleteId}/activities?oldest=${oldest}&limit=1`,
      { headers: { Authorization: authHeader(apiKey) }, timeout: 10000 }
    )
    log(`Credentials valid for athlete ${athleteId}`)
    return true
  } catch (err) {
    if (axios.isAxiosError(err) && err.response && [401, 403].includes(err.response.status)) {
      log(`Credentials invalid for athlete ${athleteId} (HTTP ${err.response.status})`)
      return false
    }
    log(`Credential check failed for athlete ${athleteId}: ${err instanceof Error ? err.message : String(err)}`)
    throw err
  }
}

export function upsertToken(
  athleteId: string,
  apiKey: string,
  internalAthleteId: number
): void {
  run(
    `INSERT INTO intervals_icu_tokens (athlete_id, internal_athlete_id, api_key, updated_at)
     VALUES (?, ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
     ON CONFLICT(athlete_id) DO UPDATE SET
       internal_athlete_id = excluded.internal_athlete_id,
       api_key = excluded.api_key,
       updated_at = excluded.updated_at`,
    [athleteId, internalAthleteId, apiKey]
  )
  saveDb()
}

export function removeToken(internalAthleteId: number): void {
  run('DELETE FROM intervals_icu_tokens WHERE internal_athlete_id = ?', [internalAthleteId])
  saveDb()
}

export function getEnvCredentials(): { athleteId: string; apiKey: string } | null {
  const athleteId = process.env.INTERVALS_ICU_ATHLETE_ID
  const apiKey = process.env.INTERVALS_ICU_API_KEY
  if (athleteId && apiKey) return { athleteId, apiKey }
  return null
}

export function hasEnvCredentials(): boolean {
  return getEnvCredentials() !== null
}

export function hasTokenForAthlete(internalAthleteId: number): boolean {
  const row = queryOne('SELECT id FROM intervals_icu_tokens WHERE internal_athlete_id = ?', [internalAthleteId])
  return row !== null
}

export function getTokenForAthlete(
  internalAthleteId: number
): Record<string, unknown> | null {
  return queryOne('SELECT * FROM intervals_icu_tokens WHERE internal_athlete_id = ?', [internalAthleteId])
}

function defaultOldest(): string {
  const d = new Date()
  d.setMonth(d.getMonth() - 6)
  return d.toISOString().substring(0, 10)
}

async function syncWithCredentials(
  intervalsAthleteId: string,
  apiKey: string,
  internalAthleteId: number,
  afterDate?: string
): Promise<SyncResultDto> {
  const oldest = afterDate ?? defaultOldest()
  let pageNum = 0
  const perPage = 100
  let totalSynced = 0
  let newest: string | null = null  // walk backwards using newest param

  log(`Starting sync for athlete ${intervalsAthleteId} (internal: ${internalAthleteId}), oldest=${oldest}`)

  while (true) {
    pageNum++
    const url = newest
      ? `${INTERVALS_API_BASE}/athlete/${intervalsAthleteId}/activities?oldest=${oldest}&newest=${newest}&limit=${perPage}`
      : `${INTERVALS_API_BASE}/athlete/${intervalsAthleteId}/activities?oldest=${oldest}&limit=${perPage}`

    log(`Fetching page ${pageNum}${newest ? ` (newest=${newest})` : ''}`)

    if (pageNum > 1) await sleep(REQUEST_DELAY_MS)

    const resp = await axios.get<unknown[]>(url, {
      headers: { Authorization: authHeader(apiKey) },
      timeout: 15000,
    })
    const activities = resp.data as Record<string, unknown>[]
    if (!activities || activities.length === 0) {
      log(`Page ${pageNum} returned 0 activities — sync complete`)
      break
    }

    log(`Page ${pageNum}: ${activities.length} activities received`)
    let pageInserted = 0

    for (const activity of activities) {
      const sportType = (activity.type as string | undefined) ?? ''
      if (!RUNNING_SPORT_TYPES.includes(sportType)) continue

      const rawId = activity.id as string | number
      const intervalsId = typeof rawId === 'string' ? rawId.replace(/^i/, '') : String(rawId)
      const existing = queryRows(
        'SELECT id, internal_athlete_id FROM intervals_icu_activities WHERE intervals_id = ?',
        [intervalsId]
      )

      if (existing.length === 0) {
        try {
          const p = parseActivity(activity, intervalsAthleteId, internalAthleteId)
          run(
            `INSERT INTO intervals_icu_activities
               (intervals_id, athlete_id, internal_athlete_id, name, sport_type, activity_date, start_datetime,
                distance_m, moving_time_s, elapsed_time_s, total_elevation_m, average_speed, max_speed,
                average_heartrate, max_heartrate, trainer, manual)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
              p.intervalsId, p.athleteId, p.internalAthleteId, p.name, p.sportType,
              p.activityDate, p.startDatetime, p.distanceM, p.movingTimeS,
              p.elapsedTimeS, p.totalElevationM, p.averageSpeed, p.maxSpeed,
              p.averageHeartrate, p.maxHeartrate, p.trainer, p.manual,
            ]
          )
          totalSynced++
          pageInserted++
        } catch {
          // skip duplicates
        }
      } else if ((existing[0].internal_athlete_id as number | null) !== internalAthleteId) {
        run(
          'UPDATE intervals_icu_activities SET internal_athlete_id = ? WHERE id = ?',
          [internalAthleteId, existing[0].id as number]
        )
        totalSynced++
        pageInserted++
      }
    }

    log(`Page ${pageNum}: inserted/updated ${pageInserted} running activities`)

    if (activities.length < perPage) {
      log('Last page reached — sync complete')
      break
    }

    // Set newest to just before the last activity's date to paginate backwards.
    // start_date_local is already local time — manipulate it as a string to avoid UTC conversion.
    const lastDate = (activities[activities.length - 1].start_date_local as string | undefined) ?? ''
    if (!lastDate) {
      log('No date on last activity — stopping')
      break
    }
    // Trim to seconds precision and use directly — it's local time already
    newest = lastDate.replace('Z', '').substring(0, 19)
  }

  saveDb()
  log(`Sync finished: ${totalSynced} new activities saved`)
  return { syncedCount: totalSynced, message: `Successfully synced ${totalSynced} new activities` }
}

export async function syncActivitiesForAthlete(
  internalAthleteId: number,
  afterDate?: string
): Promise<SyncResultDto> {
  const token = getTokenForAthlete(internalAthleteId)
  if (token) {
    return syncWithCredentials(token.athlete_id as string, token.api_key as string, internalAthleteId, afterDate)
  }
  const env = getEnvCredentials()
  if (env) {
    return syncWithCredentials(env.athleteId, env.apiKey, internalAthleteId, afterDate)
  }
  return {
    syncedCount: 0,
    message: 'No intervals.icu credentials found. Connect via Settings or set INTERVALS_ICU_ATHLETE_ID / INTERVALS_ICU_API_KEY in .env.',
  }
}

export function getActivitiesForAthlete(
  internalAthleteId: number,
  page: number,
  size: number
): PagedResponse<ActivityDto> {
  const placeholders = RUNNING_SPORT_TYPES.map(() => '?').join(',')
  const all = queryRows(
    `SELECT * FROM intervals_icu_activities WHERE internal_athlete_id = ? AND sport_type IN (${placeholders}) ORDER BY activity_date DESC`,
    [internalAthleteId, ...RUNNING_SPORT_TYPES]
  )
  const totalElements = all.length
  const totalPages = Math.ceil(totalElements / size)
  const content = all.slice(page * size, page * size + size).map(toDto)
  return { content, totalElements, totalPages, number: page, size }
}

export function getActivitiesByDateRange(
  internalAthleteId: number,
  startDate: string,
  endDate: string
): Record<string, unknown>[] {
  const placeholders = RUNNING_SPORT_TYPES.map(() => '?').join(',')
  const rows = queryRows(
    `SELECT * FROM intervals_icu_activities
     WHERE internal_athlete_id = ?
       AND activity_date >= ?
       AND activity_date <= ?
       AND sport_type IN (${placeholders})
     ORDER BY activity_date`,
    [internalAthleteId, startDate, endDate, ...RUNNING_SPORT_TYPES]
  )
  // Normalize intervals_id → strava_id for downstream DTO compatibility
  return rows.map(r => ({ ...r, strava_id: r.intervals_id }))
}
