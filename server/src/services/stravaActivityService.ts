import axios from 'axios'
import { db } from '../db/client.js'
import { stravaActivities, athletes } from '../db/schema.js'
import { eq, and, inArray, gte, lte } from 'drizzle-orm'
import { getValidToken, getValidTokenForAthlete } from './stravaOAuthService.js'
import type { ActivityDto, SyncResultDto, PagedResponse } from '../types/index.js'

const STRAVA_API_BASE = 'https://www.strava.com/api/v3'
const RUNNING_SPORT_TYPES = ['Run', 'TrailRun', 'VirtualRun']

function toDistanceKm(distanceM: number | null | undefined): number {
  if (!distanceM) return 0
  return Math.round((distanceM / 1000) * 100) / 100
}

function toDto(row: typeof stravaActivities.$inferSelect): ActivityDto {
  return {
    id: row.id,
    stravaId: row.stravaId,
    name: row.name ?? null,
    sportType: row.sportType ?? null,
    activityDate: row.activityDate,
    startDatetime: row.startDatetime ?? null,
    distanceKm: toDistanceKm(row.distanceM),
    movingTimeS: row.movingTimeS ?? null,
    totalElevationM: row.totalElevationM ?? null,
    averageHeartrate: row.averageHeartrate ?? null,
  }
}

function parseActivity(data: Record<string, unknown>, stravaAthleteId: number, internalAthleteId?: number) {
  const startDateStr =
    (data.start_date_local as string | undefined) ??
    (data.start_date as string | undefined) ?? ''
  const startDt = startDateStr.replace('Z', '')
  const activityDate = startDt.substring(0, 10)

  return {
    stravaId: Number(data.id),
    athleteId: stravaAthleteId,
    internalAthleteId: internalAthleteId ?? null,
    name: (data.name as string | undefined) ?? null,
    sportType: (data.sport_type as string | undefined) ?? (data.type as string | undefined) ?? null,
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
    trainer: (data.trainer as boolean | undefined) ?? false,
    manual: (data.manual as boolean | undefined) ?? false,
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
      { headers: { Authorization: `Bearer ${token.accessToken}` } }
    )
    const activities = resp.data as Record<string, unknown>[]
    if (!activities || activities.length === 0) break

    for (const activity of activities) {
      const sportType =
        (activity.sport_type as string | undefined) ??
        (activity.type as string | undefined) ?? ''
      if (!RUNNING_SPORT_TYPES.slice(0, 2).includes(sportType)) continue

      const stravaId = Number(activity.id)
      const existing = db
        .select()
        .from(stravaActivities)
        .where(eq(stravaActivities.stravaId, stravaId))
        .get()
      if (!existing) {
        try {
          db.insert(stravaActivities)
            .values(parseActivity(activity, token.athleteId))
            .run()
          totalSynced++
        } catch {
          // skip duplicates
        }
      }
    }

    if (activities.length < 100) break
    page++
  }

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
      headers: { Authorization: `Bearer ${token.accessToken}` },
    })
    const activities = resp.data as Record<string, unknown>[]
    if (!activities || activities.length === 0) break

    for (const activity of activities) {
      const sportType =
        (activity.sport_type as string | undefined) ??
        (activity.type as string | undefined) ?? ''
      if (!['Run', 'TrailRun'].includes(sportType)) continue

      const stravaId = Number(activity.id)
      const existing = db
        .select()
        .from(stravaActivities)
        .where(eq(stravaActivities.stravaId, stravaId))
        .get()

      if (!existing) {
        try {
          db.insert(stravaActivities)
            .values(parseActivity(activity, token.athleteId, internalAthleteId))
            .run()
          totalSynced++
        } catch {
          // skip
        }
      } else if (existing.internalAthleteId !== internalAthleteId) {
        db.update(stravaActivities)
          .set({ internalAthleteId })
          .where(eq(stravaActivities.id, existing.id))
          .run()
        totalSynced++
      }
    }

    if (activities.length < 100) break
    page++
  }

  return { syncedCount: totalSynced, message: `Successfully synced ${totalSynced} new activities` }
}

export function getActivities(page: number, size: number): PagedResponse<ActivityDto> {
  const all = db
    .select()
    .from(stravaActivities)
    .where(inArray(stravaActivities.sportType, RUNNING_SPORT_TYPES))
    .all()
    .sort((a, b) => b.activityDate.localeCompare(a.activityDate))

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
  const all = db
    .select()
    .from(stravaActivities)
    .where(
      and(
        eq(stravaActivities.internalAthleteId, internalAthleteId),
        inArray(stravaActivities.sportType, RUNNING_SPORT_TYPES)
      )
    )
    .all()
    .sort((a, b) => b.activityDate.localeCompare(a.activityDate))

  const totalElements = all.length
  const totalPages = Math.ceil(totalElements / size)
  const content = all.slice(page * size, page * size + size).map(toDto)

  return { content, totalElements, totalPages, number: page, size }
}

export function getActivitiesByDateRange(
  internalAthleteId: number,
  startDate: string,
  endDate: string
): typeof stravaActivities.$inferSelect[] {
  return db
    .select()
    .from(stravaActivities)
    .where(
      and(
        eq(stravaActivities.internalAthleteId, internalAthleteId),
        gte(stravaActivities.activityDate, startDate),
        lte(stravaActivities.activityDate, endDate)
      )
    )
    .all()
    .filter((a) => RUNNING_SPORT_TYPES.includes(a.sportType ?? ''))
    .sort((a, b) => a.activityDate.localeCompare(b.activityDate))
}
