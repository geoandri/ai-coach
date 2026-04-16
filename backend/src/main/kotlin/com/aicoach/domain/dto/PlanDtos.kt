package com.aicoach.domain.dto

import java.time.LocalDate

data class TrainingPlanDto(
    val id: Long,
    val athleteId: Long,
    val name: String,
    val raceName: String?,
    val raceDate: LocalDate?,
    val tuneUpRaceName: String?,
    val tuneUpRaceDate: LocalDate?,
    val totalWeeks: Int,
    val weeks: List<WeeklyBlockDto>
)

data class WeeklyBlockDto(
    val id: Long,
    val weekNumber: Int,
    val phase: String?,
    val startDate: LocalDate,
    val endDate: LocalDate,
    val plannedKm: Double?,
    val plannedVertM: Int?,
    val notes: String?,
    val workouts: List<DailyWorkoutDto>
)

data class DailyWorkoutDto(
    val id: Long,
    val workoutDate: LocalDate,
    val dayOfWeek: String?,
    val workoutType: String?,
    val description: String?,
    val plannedKm: Double?,
    val plannedVertM: Int?,
    val isRestDay: Boolean,
    val isRaceDay: Boolean
)

data class CreateTrainingPlanRequest(
    val name: String,
    val raceName: String? = null,
    val raceDate: java.time.LocalDate? = null,
    val tuneUpRaceName: String? = null,
    val tuneUpRaceDate: java.time.LocalDate? = null,
    val totalWeeks: Int,
    val weeks: List<CreateWeeklyBlockRequest> = emptyList()
)

data class CreateWeeklyBlockRequest(
    val weekNumber: Int,
    val phase: String? = null,
    val startDate: java.time.LocalDate,
    val endDate: java.time.LocalDate,
    val plannedKm: Double? = null,
    val plannedVertM: Int? = null,
    val notes: String? = null,
    val workouts: List<CreateDailyWorkoutRequest> = emptyList()
)

data class CreateDailyWorkoutRequest(
    val workoutDate: java.time.LocalDate,
    val dayOfWeek: String? = null,
    val workoutType: String? = null,
    val description: String? = null,
    val plannedKm: Double? = null,
    val plannedVertM: Int? = null,
    val isRestDay: Boolean = false,
    val isRaceDay: Boolean = false
)
