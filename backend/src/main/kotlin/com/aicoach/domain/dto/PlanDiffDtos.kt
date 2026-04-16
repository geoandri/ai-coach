package com.aicoach.domain.dto

import java.time.LocalDate

data class PlanVsActualDto(
    val athleteId: Long,
    val startDate: LocalDate,
    val endDate: LocalDate,
    val days: List<DayComparisonDto>,
    val totalPlannedKm: Double,
    val totalActualKm: Double,
    val adherencePercent: Double
)

data class DayComparisonDto(
    val date: LocalDate,
    val dayOfWeek: String?,
    val plannedWorkoutType: String?,
    val plannedDescription: String?,
    val plannedKm: Double?,
    val plannedVertM: Int?,
    val isRestDay: Boolean,
    val activities: List<ActualActivitySummary>,
    val actualKm: Double,
    val actualVertM: Double,
    val kmDiff: Double,
    val hasActivity: Boolean
)

data class ActualActivitySummary(
    val id: Long,
    val stravaId: Long,
    val name: String?,
    val sportType: String?,
    val distanceKm: Double,
    val movingTimeS: Int?,
    val totalElevationM: Double?
)
