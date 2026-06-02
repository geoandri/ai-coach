import axios from 'axios'
import { queryRows, queryOne, run, saveDb } from '../db/client.js'
import type { ActivityDto, SyncResultDto, PagedResponse } from '../types/index.js'

const INTERVALS_API_BASE = 'https://intervals.icu/api/v1'
const RUNNING_SPORT_TYPES = ['Run', 'TrailRun', 'VirtualRun']

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
    intervalsId: Number(data.id),
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
  try {
    await axios.get(
      `${INTERVALS_API_BASE}/athlete/${athleteId}/activities?oldest=${oldest}&limit=1`,
      { headers: { Authorization: authHeader(apiKey) } }
    )
    return true
  } catch (err) {
    if (axios.isAxiosError(err) && err.response && [401, 403].includes(err.response.status)) {
      return false
    }
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

export function hasTokenForAthlete(internalAthleteId: number): boolean {
  const row = queryOne('SELECT id FROM intervals_icu_tokens WHERE internal_athlete_id = ?', [internalAthleteId])
  return row !== null
}

export function getTokenForAthlete(
  internalAthleteId: number
): Record<string, unknown> | null {
  return queryOne('SELECT * FROM intervals_icu_tokens WHERE internal_athlete_id = ?', [internalAthleteId])
}

export async function syncActivitiesForAthlete(
  internalAthleteId: number,
  afterDate?: string
): Promise<SyncResultDto> {
  const token = getTokenForAthlete(internalAthleteId)
  if (!token) {
    return {
      syncedCount: 0,
      message: `No intervals.icu token found for athlete ${internalAthleteId}. Please connect intervals.icu first.`,
    }
  }

  const athleteId = token.athlete_id as string
  const apiKey = token.api_key as string

  const oldest = afterDate ?? '2000-01-01'
  let page = 0
  const perPage = 100
  let totalSynced = 0

  while (true) {
    const resp = await axios.get<unknown[]>(
      `${INTERVALS_API_BASE}/athlete/${athleteId}/activities?oldest=${oldest}&limit=${perPage}&skip=${page * perPage}`,
      { headers: { Authorization: authHeader(apiKey) } }
    )
    const activities = resp.data as Record<string, unknown>[]
    if (!activities || activities.length === 0) break

    for (const activity of activities) {
      const sportType = (activity.type as string | undefined) ?? ''
      if (!RUNNING_SPORT_TYPES.includes(sportType)) continue

      const intervalsId = Number(activity.id)
      const existing = queryRows(
        'SELECT id, internal_athlete_id FROM intervals_icu_activities WHERE intervals_id = ?',
        [intervalsId]
      )

      if (existing.length === 0) {
        try {
          const p = parseActivity(activity, athleteId, internalAthleteId)
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
        } catch {
          // skip duplicates
        }
      } else if ((existing[0].internal_athlete_id as number | null) !== internalAthleteId) {
        run(
          'UPDATE intervals_icu_activities SET internal_athlete_id = ? WHERE id = ?',
          [internalAthleteId, existing[0].id as number]
        )
        totalSynced++
      }
    }

    if (activities.length < perPage) break
    page++
  }

  saveDb()
  return { syncedCount: totalSynced, message: `Successfully synced ${totalSynced} new activities` }
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
