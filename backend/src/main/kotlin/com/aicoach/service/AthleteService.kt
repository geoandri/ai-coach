package com.aicoach.service

import com.aicoach.domain.dto.*
import com.aicoach.domain.entity.Athlete
import com.aicoach.repository.AthleteRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.time.Instant

@Service
class AthleteService(
    private val athleteRepository: AthleteRepository
) {
    fun listAthletes(): List<AthleteDto> =
        athleteRepository.findAll().map { it.toDto() }

    fun getAthlete(id: Long): AthleteDto =
        athleteRepository.findById(id).orElseThrow {
            ResponseStatusException(HttpStatus.NOT_FOUND, "Athlete $id not found")
        }.toDto()

    @Transactional
    fun createAthlete(request: CreateAthleteRequest): AthleteDto {
        val athlete = Athlete(
            name = request.name,
            email = request.email,
            experienceYears = request.experienceYears,
            fitnessLevel = request.fitnessLevel,
            currentWeeklyKm = request.currentWeeklyKm,
            longestRecentRunKm = request.longestRecentRunKm,
            recentRaces = request.recentRaces,
            trainingDaysPerWeek = request.trainingDaysPerWeek,
            preferredLongRunDay = request.preferredLongRunDay,
            injuries = request.injuries,
            strengthTrainingFrequency = request.strengthTrainingFrequency,
            goalType = request.goalType,
            targetFinishTime = request.targetFinishTime,
            trailAccess = request.trailAccess,
            coachNotes = request.coachNotes,
            athleteSummary = request.athleteSummary,
            raceName = request.raceName,
            raceDate = request.raceDate,
            raceDistanceKm = request.raceDistanceKm,
            raceElevationM = request.raceElevationM
        )
        return athleteRepository.save(athlete).toDto()
    }

    @Transactional
    fun updateAthlete(id: Long, request: UpdateAthleteRequest): AthleteDto {
        val athlete = athleteRepository.findById(id).orElseThrow {
            ResponseStatusException(HttpStatus.NOT_FOUND, "Athlete $id not found")
        }
        request.name?.let { athlete.name = it }
        request.email?.let { athlete.email = it }
        request.experienceYears?.let { athlete.experienceYears = it }
        request.fitnessLevel?.let { athlete.fitnessLevel = it }
        request.currentWeeklyKm?.let { athlete.currentWeeklyKm = it }
        request.longestRecentRunKm?.let { athlete.longestRecentRunKm = it }
        request.recentRaces?.let { athlete.recentRaces = it }
        request.trainingDaysPerWeek?.let { athlete.trainingDaysPerWeek = it }
        request.preferredLongRunDay?.let { athlete.preferredLongRunDay = it }
        request.injuries?.let { athlete.injuries = it }
        request.strengthTrainingFrequency?.let { athlete.strengthTrainingFrequency = it }
        request.goalType?.let { athlete.goalType = it }
        request.targetFinishTime?.let { athlete.targetFinishTime = it }
        request.trailAccess?.let { athlete.trailAccess = it }
        request.coachNotes?.let { athlete.coachNotes = it }
        request.athleteSummary?.let { athlete.athleteSummary = it }
        request.raceName?.let { athlete.raceName = it }
        request.raceDate?.let { athlete.raceDate = it }
        request.raceDistanceKm?.let { athlete.raceDistanceKm = it }
        request.raceElevationM?.let { athlete.raceElevationM = it }
        athlete.updatedAt = Instant.now()
        return athleteRepository.save(athlete).toDto()
    }

    @Transactional
    fun addCoachNote(id: Long, note: String): AthleteDto {
        val athlete = athleteRepository.findById(id).orElseThrow {
            ResponseStatusException(HttpStatus.NOT_FOUND, "Athlete $id not found")
        }
        val existing = athlete.coachNotes
        athlete.coachNotes = if (existing.isNullOrBlank()) note else "$existing\n$note"
        athlete.updatedAt = Instant.now()
        return athleteRepository.save(athlete).toDto()
    }

    @Transactional
    fun linkStravaAthlete(internalAthleteId: Long, stravaAthleteId: Long) {
        val athlete = athleteRepository.findById(internalAthleteId).orElseThrow {
            ResponseStatusException(HttpStatus.NOT_FOUND, "Athlete $internalAthleteId not found")
        }
        athlete.stravaAthleteId = stravaAthleteId
        athlete.stravaEnabled = true
        athlete.updatedAt = Instant.now()
        athleteRepository.save(athlete)
    }

    private fun Athlete.toDto() = AthleteDto(
        id = id, name = name, email = email,
        experienceYears = experienceYears, fitnessLevel = fitnessLevel,
        currentWeeklyKm = currentWeeklyKm, longestRecentRunKm = longestRecentRunKm,
        recentRaces = recentRaces, trainingDaysPerWeek = trainingDaysPerWeek,
        preferredLongRunDay = preferredLongRunDay, injuries = injuries,
        strengthTrainingFrequency = strengthTrainingFrequency,
        goalType = goalType, targetFinishTime = targetFinishTime,
        trailAccess = trailAccess, coachNotes = coachNotes,
        athleteSummary = athleteSummary,
        raceName = raceName, raceDate = raceDate,
        raceDistanceKm = raceDistanceKm, raceElevationM = raceElevationM,
        stravaEnabled = stravaEnabled, stravaAthleteId = stravaAthleteId,
        createdAt = createdAt, updatedAt = updatedAt
    )
}
