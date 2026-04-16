package com.aicoach.domain.dto

import com.aicoach.domain.entity.FitnessLevel
import com.aicoach.domain.entity.GoalType
import java.time.Instant
import java.time.LocalDate

data class AthleteDto(
    val id: Long,
    val name: String,
    val email: String?,
    val experienceYears: Int?,
    val fitnessLevel: FitnessLevel?,
    val currentWeeklyKm: Double?,
    val longestRecentRunKm: Double?,
    val recentRaces: String?,
    val trainingDaysPerWeek: Int?,
    val preferredLongRunDay: String?,
    val injuries: String?,
    val strengthTrainingFrequency: String?,
    val goalType: GoalType?,
    val targetFinishTime: String?,
    val trailAccess: Boolean,
    val coachNotes: String?,
    val athleteSummary: String?,
    val raceName: String?,
    val raceDate: LocalDate?,
    val raceDistanceKm: Double?,
    val raceElevationM: Int?,
    val stravaEnabled: Boolean,
    val stravaAthleteId: Long?,
    val createdAt: Instant,
    val updatedAt: Instant
)

data class CreateAthleteRequest(
    val name: String,
    val email: String? = null,
    val experienceYears: Int? = null,
    val fitnessLevel: FitnessLevel? = null,
    val currentWeeklyKm: Double? = null,
    val longestRecentRunKm: Double? = null,
    val recentRaces: String? = null,
    val trainingDaysPerWeek: Int? = null,
    val preferredLongRunDay: String? = null,
    val injuries: String? = null,
    val strengthTrainingFrequency: String? = null,
    val goalType: GoalType? = null,
    val targetFinishTime: String? = null,
    val trailAccess: Boolean = false,
    val coachNotes: String? = null,
    val athleteSummary: String? = null,
    val raceName: String? = null,
    val raceDate: LocalDate? = null,
    val raceDistanceKm: Double? = null,
    val raceElevationM: Int? = null
)

data class UpdateAthleteRequest(
    val name: String? = null,
    val email: String? = null,
    val experienceYears: Int? = null,
    val fitnessLevel: FitnessLevel? = null,
    val currentWeeklyKm: Double? = null,
    val longestRecentRunKm: Double? = null,
    val recentRaces: String? = null,
    val trainingDaysPerWeek: Int? = null,
    val preferredLongRunDay: String? = null,
    val injuries: String? = null,
    val strengthTrainingFrequency: String? = null,
    val goalType: GoalType? = null,
    val targetFinishTime: String? = null,
    val trailAccess: Boolean? = null,
    val coachNotes: String? = null,
    val athleteSummary: String? = null,
    val raceName: String? = null,
    val raceDate: LocalDate? = null,
    val raceDistanceKm: Double? = null,
    val raceElevationM: Int? = null
)

data class AddCoachNoteRequest(
    val note: String
)

