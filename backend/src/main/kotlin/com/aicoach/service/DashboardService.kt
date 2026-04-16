package com.aicoach.service

import com.aicoach.domain.dto.DashboardSummaryDto
import com.aicoach.domain.dto.WeekAdherenceDto
import com.aicoach.repository.StravaActivityRepository
import com.aicoach.repository.TrainingPlanRepository
import com.aicoach.repository.WeeklyBlockRepository
import org.springframework.stereotype.Service
import java.time.LocalDate

@Service
class DashboardService(
    private val planRepository: TrainingPlanRepository,
    private val weeklyBlockRepository: WeeklyBlockRepository,
    private val activityRepository: StravaActivityRepository
) {
    fun getSummary(): DashboardSummaryDto {
        val plan = planRepository.findFirstByOrderByIdAsc().orElse(null)
            ?: return DashboardSummaryDto(emptyList(), null, 0.0, 0.0)

        val weeks = weeklyBlockRepository.findByTrainingPlanIdOrderByWeekNumberAsc(plan.id)
        val today = LocalDate.now()

        val weekAdherences = weeks.map { week ->
            val activities = activityRepository
                .findByActivityDateBetweenOrderByActivityDateAsc(week.startDate, week.endDate)
                .filter { it.sportType in listOf("Run", "TrailRun", "VirtualRun") }

            val actualKm = activities.sumOf { it.distanceKm }
            val actualVertM = activities.sumOf { it.totalElevationM?.toDouble() ?: 0.0 }
            val plannedKm = week.plannedKm ?: 0.0
            val plannedVertM = week.plannedVertM ?: 0

            val adherence = if (plannedKm > 0) (actualKm / plannedKm * 100).coerceAtMost(200.0) else 0.0
            val isCurrentWeek = !today.isBefore(week.startDate) && !today.isAfter(week.endDate)
            val isFutureWeek = today.isBefore(week.startDate)

            WeekAdherenceDto(
                weekNumber = week.weekNumber,
                phase = week.phase,
                startDate = week.startDate,
                endDate = week.endDate,
                plannedKm = plannedKm,
                actualKm = actualKm,
                plannedVertM = plannedVertM,
                actualVertM = actualVertM,
                adherencePercent = adherence,
                activityCount = activities.size,
                isCurrentWeek = isCurrentWeek,
                isFutureWeek = isFutureWeek
            )
        }

        val currentWeekNumber = weekAdherences.find { it.isCurrentWeek }?.weekNumber
        val totalPlannedKm = weekAdherences.filter { !it.isFutureWeek }.sumOf { it.plannedKm }
        val totalActualKm = weekAdherences.sumOf { it.actualKm }

        return DashboardSummaryDto(
            weeks = weekAdherences,
            currentWeekNumber = currentWeekNumber,
            totalPlannedKm = totalPlannedKm,
            totalActualKm = totalActualKm
        )
    }

    fun getSummaryForAthlete(athleteId: Long): DashboardSummaryDto {
        val plan = planRepository.findByAthleteId(athleteId).orElse(null)
            ?: return DashboardSummaryDto(emptyList(), null, 0.0, 0.0)

        val weeks = weeklyBlockRepository.findByTrainingPlanIdOrderByWeekNumberAsc(plan.id)
        val today = LocalDate.now()

        val weekAdherences = weeks.map { week ->
            val activities = activityRepository
                .findByInternalAthleteIdAndActivityDateBetweenOrderByActivityDateAsc(
                    athleteId, week.startDate, week.endDate
                )
                .filter { it.sportType in listOf("Run", "TrailRun", "VirtualRun") }

            val actualKm = activities.sumOf { it.distanceKm }
            val actualVertM = activities.sumOf { it.totalElevationM?.toDouble() ?: 0.0 }
            val plannedKm = week.plannedKm ?: 0.0
            val plannedVertM = week.plannedVertM ?: 0

            val adherence = if (plannedKm > 0) (actualKm / plannedKm * 100).coerceAtMost(200.0) else 0.0
            val isCurrentWeek = !today.isBefore(week.startDate) && !today.isAfter(week.endDate)
            val isFutureWeek = today.isBefore(week.startDate)

            WeekAdherenceDto(
                weekNumber = week.weekNumber,
                phase = week.phase,
                startDate = week.startDate,
                endDate = week.endDate,
                plannedKm = plannedKm,
                actualKm = actualKm,
                plannedVertM = plannedVertM,
                actualVertM = actualVertM,
                adherencePercent = adherence,
                activityCount = activities.size,
                isCurrentWeek = isCurrentWeek,
                isFutureWeek = isFutureWeek
            )
        }

        val currentWeekNumber = weekAdherences.find { it.isCurrentWeek }?.weekNumber
        val totalPlannedKm = weekAdherences.filter { !it.isFutureWeek }.sumOf { it.plannedKm }
        val totalActualKm = weekAdherences.sumOf { it.actualKm }

        return DashboardSummaryDto(
            weeks = weekAdherences,
            currentWeekNumber = currentWeekNumber,
            totalPlannedKm = totalPlannedKm,
            totalActualKm = totalActualKm
        )
    }
}
