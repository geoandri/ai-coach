package com.aicoach.service

import com.aicoach.domain.dto.*
import com.aicoach.repository.DailyWorkoutRepository
import com.aicoach.repository.StravaActivityRepository
import org.springframework.stereotype.Service
import java.time.LocalDate

@Service
class PlanDiffService(
    private val dailyWorkoutRepository: DailyWorkoutRepository,
    private val activityRepository: StravaActivityRepository
) {
    fun getPlanVsActual(athleteId: Long, startDate: LocalDate, endDate: LocalDate): PlanVsActualDto {
        val plannedWorkouts = dailyWorkoutRepository
            .findByAthleteIdAndDateRange(athleteId, startDate, endDate)
            .associateBy { it.workoutDate }

        val activities = activityRepository
            .findByInternalAthleteIdAndActivityDateBetweenOrderByActivityDateAsc(athleteId, startDate, endDate)
            .filter { it.sportType in listOf("Run", "TrailRun", "VirtualRun") }
            .groupBy { it.activityDate }

        val days = mutableListOf<DayComparisonDto>()
        var current = startDate
        while (!current.isAfter(endDate)) {
            val workout = plannedWorkouts[current]
            val dayActivities = activities[current] ?: emptyList()
            val actualKm = dayActivities.sumOf { it.distanceKm }
            val actualVertM = dayActivities.sumOf { it.totalElevationM?.toDouble() ?: 0.0 }
            val plannedKm = workout?.plannedKm ?: 0.0

            days.add(DayComparisonDto(
                date = current,
                dayOfWeek = workout?.dayOfWeek,
                plannedWorkoutType = workout?.workoutType,
                plannedDescription = workout?.description,
                plannedKm = workout?.plannedKm,
                plannedVertM = workout?.plannedVertM,
                isRestDay = workout?.isRestDay ?: false,
                activities = dayActivities.map { act ->
                    ActualActivitySummary(
                        id = act.id,
                        stravaId = act.stravaId,
                        name = act.name,
                        sportType = act.sportType,
                        distanceKm = act.distanceKm,
                        movingTimeS = act.movingTimeS,
                        totalElevationM = act.totalElevationM?.toDouble()
                    )
                },
                actualKm = actualKm,
                actualVertM = actualVertM,
                kmDiff = actualKm - plannedKm,
                hasActivity = dayActivities.isNotEmpty()
            ))
            current = current.plusDays(1)
        }

        val totalPlannedKm = days.sumOf { it.plannedKm ?: 0.0 }
        val totalActualKm = days.sumOf { it.actualKm }
        val adherencePercent = if (totalPlannedKm > 0) (totalActualKm / totalPlannedKm * 100).coerceAtMost(200.0) else 0.0

        return PlanVsActualDto(
            athleteId = athleteId,
            startDate = startDate,
            endDate = endDate,
            days = days,
            totalPlannedKm = totalPlannedKm,
            totalActualKm = totalActualKm,
            adherencePercent = adherencePercent
        )
    }
}
