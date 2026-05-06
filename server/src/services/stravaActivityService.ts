import axios from 'axios'
import { queryRows, run, saveDb } from '../db/client.js'
import { getValidToken, getValidTokenForAthlete } from './stravaOAuthService.js'
import type { ActivityDto, SyncResultDto, PagedResponse } from '../types/index.js'

const STRAVA_API_BASE = 'https://www.strava.com/api/v3'
const RUNNING_SPORT_TYPES = ['Run', 'TrailRun', 'VirtualRun']

function toDistanceKm(distanceM: number | null | undefined): number {
  if (!distanceM) return 0
  return Math.round((distanceM / 1000) * 100) / 100
}

function toDto(row: Record<string, unknown>): ActivityDto {
  return {
    id: row.id as number,
    stravaId: row.strava_id as number,
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
  stravaAthleteId: number,
  internalAthleteId?: number
) {
  const startDateStr =
    (data.start_date_local as string | undefined) ??
    (data.start_date as string | undefined) ??
    ''
  const startDt = startDateStr.replace('Z', '')
  const activityDate = startDt.substring(0, 10)

  return {
    stravaId: Number(data.id),
    athleteId: stravaAthleteId,
    internalAthleteId: internalAthleteId ?? null,
    name: (data.name as string | undefined) ?? null,
    sportType:
      (data.sport_type as string | undefined) ?? (data.type as string | undefined) ?? null,
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

export async function syncActivities(): Promise<SyncResultDto> {
  const token = await getValidToken()
  if (!token) {
    return { syncedCount: 0, message: 'No Strava token found. Please connect Strava first.' }
  }

  let page = 1
  let totalSynced = 0

  while (true) {
    const resp = await axios.get<unknown[]>(
      `${STRAVA_API_BASE}/athlete/activities?per_page=100&page=${page}`,
      { headers: { Authorization: `Bearer ${token.access_token}` } }
    )
    const activities = resp.data as Record<string, unknown>[]
    if (!activities || activities.length === 0) break

    for (const activity of activities) {
      const sportType =
        (activity.sport_type as string | undefined) ??
        (activity.type as string | undefined) ??
        ''
      if (!['Run', 'TrailRun'].includes(sportType)) continue

      const stravaId = Number(activity.id)
      const existing = queryRows(
        'SELECT id FROM strava_activities WHERE strava_id = ?',
        [stravaId]
      )
      if (existing.length === 0) {
        try {
          const p = parseActivity(activity, token.athlete_id)
          run(
            `INSERT INTO strava_activities (strava_id, athlete_id, internal_athlete_id, name, sport_type, activity_date, start_datetime, distance_m, moving_time_s, elapsed_time_s, total_elevation_m, average_speed, max_speed, average_heartrate, max_heartrate, trainer, manual)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
              p.stravaId, p.athleteId, p.internalAthleteId, p.name, p.sportType,
              p.activityDate, p.startDatetime, p.distanceM, p.movingTimeS,
              p.elapsedTimeS, p.totalElevationM, p.averageSpeed, p.maxSpeed,
              p.averageHeartrate, p.maxHeartrate, p.trainer, p.manual,
            ]
          )
          totalSynced++
        } catch {
          // skip duplicates
        }
      }
    }

    if (activities.length < 100) break
    page++
  }

  saveDb()
  return { syncedCount: totalSynced, message: `Successfully synced ${totalSynced} new activities` }
}

export async function syncActivitiesForAthlete(
  internalAthleteId: number,
  afterDate?: string
): Promise<SyncResultDto> {
  const token = await getValidTokenForAthlete(internalAthleteId)
  if (!token) {
    return {
      syncedCount: 0,
      message: `No Strava token found for athlete ${internalAthleteId}. Please connect Strava first.`,
    }
  }

  const afterEpoch = afterDate
    ? Math.floor(new Date(afterDate).getTime() / 1000)
    : undefined

  let page = 1
  let totalSynced = 0

  while (true) {
    const url = afterEpoch
      ? `${STRAVA_API_BASE}/athlete/activities?per_page=100&page=${page}&after=${afterEpoch}`
      : `${STRAVA_API_BASE}/athlete/activities?per_page=100&page=${page}`

    const resp = await axios.get<unknown[]>(url, {
      headers: { Authorization: `Bearer ${token.access_token}` },
    })
    const activities = resp.data as Record<string, unknown>[]
    if (!activities || activities.length === 0) break

    for (const activity of activities) {
      const sportType =
        (activity.sport_type as string | undefined) ??
        (activity.type as string | undefined) ??
        ''
      if (!['Run', 'TrailRun'].includes(sportType)) continue

      const stravaId = Number(activity.id)
      const existing = queryRows(
        'SELECT id, internal_athlete_id FROM strava_activities WHERE strava_id = ?',
        [stravaId]
      )

      if (existing.length === 0) {
        try {
          const p = parseActivity(activity, token.athlete_id, internalAthleteId)
          run(
            `INSERT INTO strava_activities (strava_id, athlete_id, internal_athlete_id, name, sport_type, activity_date, start_datetime, distance_m, moving_time_s, elapsed_time_s, total_elevation_m, average_speed, max_speed, average_heartrate, max_heartrate, trainer, manual)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
              p.stravaId, p.athleteId, p.internalAthleteId, p.name, p.sportType,
              p.activityDate, p.startDatetime, p.distanceM, p.movingTimeS,
              p.elapsedTimeS, p.totalElevationM, p.averageSpeed, p.maxSpeed,
              p.averageHeartrate, p.maxHeartrate, p.trainer, p.manual,
            ]
          )
          totalSynced++
        } catch {
          // skip
        }
      } else if ((existing[0].internal_athlete_id as number | null) !== internalAthleteId) {
        run(
          'UPDATE strava_activities SET internal_athlete_id = ? WHERE id = ?',
          [internalAthleteId, existing[0].id as number]
        )
        totalSynced++
      }
    }

    if (activities.length < 100) break
    page++
  }

  saveDb()
  return { syncedCount: totalSynced, message: `Successfully synced ${totalSynced} new activities` }
}

export function getActivities(page: number, size: number): PagedResponse<ActivityDto> {
  const placeholders = RUNNING_SPORT_TYPES.map(() => '?').join(',')
  const all = queryRows(
    `SELECT * FROM strava_activities WHERE sport_type IN (${placeholders}) ORDER BY activity_date DESC`,
    RUNNING_SPORT_TYPES
  )
  const totalElements = all.length
  const totalPages = Math.ceil(totalElements / size)
  const content = all.slice(page * size, page * size + size).map(toDto)
  return { content, totalElements, totalPages, number: page, size }
}

export function getActivitiesForAthlete(
  internalAthleteId: number,
  page: number,
  size: number
): PagedResponse<ActivityDto> {
  const placeholders = RUNNING_SPORT_TYPES.map(() => '?').join(',')
  const all = queryRows(
    `SELECT * FROM strava_activities WHERE internal_athlete_id = ? AND sport_type IN (${placeholders}) ORDER BY activity_date DESC`,
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
  return queryRows(
    `SELECT * FROM strava_activities
     WHERE internal_athlete_id = ?
       AND activity_date >= ?
       AND activity_date <= ?
       AND sport_type IN (${placeholders})
     ORDER BY activity_date`,
    [internalAthleteId, startDate, endDate, ...RUNNING_SPORT_TYPES]
  )
}
