import { describe, it, expect, beforeAll, afterEach } from 'vitest'
import { createTestDb, resetDb } from '../test/dbHelper.js'
import {
  listAthletes,
  getAthlete,
  createAthlete,
  updateAthlete,
  addCoachNote,
  deleteAthlete,
} from './athleteService.js'

beforeAll(async () => {
  await createTestDb()
})

afterEach(() => {
  resetDb()
})

describe('createAthlete', () => {
  it('creates athlete with name only; all optional fields null', () => {
    const athlete = createAthlete({ name: 'Alice' })
    expect(athlete.name).toBe('Alice')
    expect(athlete.email).toBeNull()
    expect(athlete.fitnessLevel).toBeNull()
    expect(athlete.experienceYears).toBeNull()
    expect(athlete.currentWeeklyKm).toBeNull()
    expect(athlete.trailAccess).toBe(false)
    expect(athlete.id).toBeGreaterThan(0)
  })

  it('trailAccess=true stored and returned as true', () => {
    const athlete = createAthlete({ name: 'Bob', trailAccess: true })
    expect(athlete.trailAccess).toBe(true)
  })

  it('trailAccess=false stored and returned as false', () => {
    const athlete = createAthlete({ name: 'Carol', trailAccess: false })
    expect(athlete.trailAccess).toBe(false)
  })

  it('nullable fields round-trip as null, not undefined', () => {
    const athlete = createAthlete({ name: 'Dave' })
    expect(athlete.email).toBeNull()
    expect(athlete.injuries).toBeNull()
    expect(athlete.recentRaces).toBeNull()
    expect(athlete.coachNotes).toBeNull()
    expect(athlete.raceName).toBeNull()
    expect(athlete.raceDate).toBeNull()
  })
})

describe('getAthlete', () => {
  it('returns null for non-existent id', () => {
    expect(getAthlete(99999)).toBeNull()
  })

  it('returns the athlete for an existing id', () => {
    const created = createAthlete({ name: 'Eve' })
    const fetched = getAthlete(created.id)
    expect(fetched).not.toBeNull()
    expect(fetched!.name).toBe('Eve')
  })
})

describe('listAthletes', () => {
  it('returns empty array when no athletes', () => {
    expect(listAthletes()).toEqual([])
  })

  it('returns all created athletes', () => {
    createAthlete({ name: 'Alice' })
    createAthlete({ name: 'Bob' })
    const athletes = listAthletes()
    expect(athletes).toHaveLength(2)
    expect(athletes.map(a => a.name)).toContain('Alice')
    expect(athletes.map(a => a.name)).toContain('Bob')
  })
})

describe('updateAthlete', () => {
  it('partial update changes only specified fields', () => {
    const athlete = createAthlete({ name: 'Frank', email: 'frank@example.com' })
    const updated = updateAthlete(athlete.id, { name: 'Frank Updated' })
    expect(updated).not.toBeNull()
    expect(updated!.name).toBe('Frank Updated')
    expect(updated!.email).toBe('frank@example.com')
  })

  it('trailAccess false→true persists correctly', () => {
    const athlete = createAthlete({ name: 'Grace', trailAccess: false })
    const updated = updateAthlete(athlete.id, { trailAccess: true })
    expect(updated!.trailAccess).toBe(true)
  })

  it('returns null for missing id', () => {
    expect(updateAthlete(99999, { name: 'Nobody' })).toBeNull()
  })
})

describe('addCoachNote', () => {
  it('sets note directly when coachNotes is null', () => {
    const athlete = createAthlete({ name: 'Henry' })
    expect(athlete.coachNotes).toBeNull()
    const updated = addCoachNote(athlete.id, 'First note')
    expect(updated!.coachNotes).toBe('First note')
  })

  it('appends with newline separator when notes exist', () => {
    const athlete = createAthlete({ name: 'Irene', coachNotes: 'Note 1' })
    const updated = addCoachNote(athlete.id, 'Note 2')
    expect(updated!.coachNotes).toBe('Note 1\nNote 2')
  })

  it('returns null for missing id', () => {
    expect(addCoachNote(99999, 'note')).toBeNull()
  })
})

describe('deleteAthlete', () => {
  it('returns false for non-existent id', () => {
    expect(deleteAthlete(99999)).toBe(false)
  })

  it('returns true and removes row for existing athlete', () => {
    const athlete = createAthlete({ name: 'Jack' })
    expect(deleteAthlete(athlete.id)).toBe(true)
    expect(getAthlete(athlete.id)).toBeNull()
  })
})

describe('toDto boolean conversion', () => {
  it('trail_access=1 → trailAccess=true', () => {
    const athlete = createAthlete({ name: 'Karen', trailAccess: true })
    const fetched = getAthlete(athlete.id)
    expect(fetched!.trailAccess).toBe(true)
  })

  it('trail_access=0 → trailAccess=false', () => {
    const athlete = createAthlete({ name: 'Leo', trailAccess: false })
    const fetched = getAthlete(athlete.id)
    expect(fetched!.trailAccess).toBe(false)
  })
})
