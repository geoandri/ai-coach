package com.aicoach.domain.dto

import java.time.LocalDate

data class DashboardSummaryDto(
    val weeks: List<WeekAdherenceDto>,
    val currentWeekNumber: Int?,
    val totalPlannedKm: Double,
    val totalActualKm: Double
)

data class WeekAdherenceDto(
    val weekNumber: Int,
    val phase: String?,
    val startDate: LocalDate,
    val endDate: LocalDate,
    val plannedKm: Double,
    val actualKm: Double,
    val plannedVertM: Int,
    val actualVertM: Double,
    val adherencePercent: Double,
    val activityCount: Int,
    val isCurrentWeek: Boolean,
    val isFutureWeek: Boolean
)
