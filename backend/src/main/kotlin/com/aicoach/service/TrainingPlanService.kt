package com.aicoach.service

import com.aicoach.domain.dto.DailyWorkoutDto
import com.aicoach.domain.dto.TrainingPlanDto
import com.aicoach.domain.dto.TrainingPlanSummaryDto
import com.aicoach.domain.dto.WeeklyBlockDto
import com.aicoach.domain.dto.WeeklyBlockSummaryDto
import com.aicoach.domain.dto.CreateTrainingPlanRequest
import com.aicoach.domain.entity.DailyWorkout
import com.aicoach.domain.entity.TrainingPlan
import com.aicoach.domain.entity.WeeklyBlock
import com.aicoach.repository.AthleteRepository
import com.aicoach.repository.DailyWorkoutRepository
import com.aicoach.repository.TrainingPlanRepository
import com.aicoach.repository.WeeklyBlockRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException

@Service
class TrainingPlanService(
    private val planRepository: TrainingPlanRepository,
    private val weeklyBlockRepository: WeeklyBlockRepository,
    private val dailyWorkoutRepository: DailyWorkoutRepository
) {
    fun getFullPlan(): TrainingPlanDto? {
        val plan = planRepository.findFirstByOrderByIdAsc().orElse(null) ?: return null
        val weeks = weeklyBlockRepository.findByTrainingPlanIdOrderByWeekNumberAsc(plan.id)
        return TrainingPlanDto(
            id = plan.id,
            athleteId = plan.athlete?.id ?: 0L,
            name = plan.name,
            raceName = plan.raceName,
            raceDate = plan.raceDate,
            tuneUpRaceName = plan.tuneUpRaceName,
            tuneUpRaceDate = plan.tuneUpRaceDate,
            totalWeeks = plan.totalWeeks,
            weeks = weeks.map { it.toDto() }
        )
    }

    fun getWeek(weekNumber: Int): WeeklyBlockDto? {
        val plan = planRepository.findFirstByOrderByIdAsc().orElse(null) ?: return null
        val week = weeklyBlockRepository.findByTrainingPlanIdAndWeekNumber(plan.id, weekNumber).orElse(null)
            ?: return null
        return week.toDto()
    }

    // ── Athlete-scoped methods ────────────────────────────────────────────────

    fun getPlanForAthlete(athleteId: Long): TrainingPlanDto? {
        val plan = planRepository.findByAthleteId(athleteId).orElse(null) ?: return null
        val weeks = weeklyBlockRepository.findByTrainingPlanIdOrderByWeekNumberAsc(plan.id)
        return TrainingPlanDto(
            id = plan.id,
            athleteId = athleteId,
            name = plan.name,
            raceName = plan.raceName,
            raceDate = plan.raceDate,
            tuneUpRaceName = plan.tuneUpRaceName,
            tuneUpRaceDate = plan.tuneUpRaceDate,
            totalWeeks = plan.totalWeeks,
            weeks = weeks.map { it.toDto() }
        )
    }

    fun getPlanSummaryForAthlete(athleteId: Long): TrainingPlanSummaryDto? {
        val plan = planRepository.findByAthleteId(athleteId).orElse(null) ?: return null
        val weeks = weeklyBlockRepository.findByTrainingPlanIdOrderByWeekNumberAsc(plan.id)
        return TrainingPlanSummaryDto(
            id = plan.id,
            athleteId = athleteId,
            name = plan.name,
            raceName = plan.raceName,
            raceDate = plan.raceDate,
            tuneUpRaceName = plan.tuneUpRaceName,
            tuneUpRaceDate = plan.tuneUpRaceDate,
            totalWeeks = plan.totalWeeks,
            weeks = weeks.map { it.toSummaryDto() }
        )
    }

    fun getWeekForAthlete(athleteId: Long, weekNumber: Int): WeeklyBlockDto? {
        val plan = planRepository.findByAthleteId(athleteId).orElse(null) ?: return null
        val week = weeklyBlockRepository.findByTrainingPlanIdAndWeekNumber(plan.id, weekNumber).orElse(null)
            ?: return null
        return week.toDto()
    }

    @Transactional
    fun createPlanForAthlete(
        athleteId: Long,
        request: CreateTrainingPlanRequest,
        athleteRepository: AthleteRepository
    ): TrainingPlanDto {
        if (planRepository.existsByAthleteId(athleteId)) {
            throw ResponseStatusException(
                HttpStatus.CONFLICT,
                "Athlete $athleteId already has a training plan. Delete it first."
            )
        }
        val athlete = athleteRepository.findById(athleteId).orElseThrow {
            ResponseStatusException(HttpStatus.NOT_FOUND, "Athlete $athleteId not found")
        }
        val plan = TrainingPlan(
            name = request.name,
            raceName = request.raceName,
            raceDate = request.raceDate,
            tuneUpRaceName = request.tuneUpRaceName,
            tuneUpRaceDate = request.tuneUpRaceDate,
            totalWeeks = request.totalWeeks
        )
        plan.athlete = athlete
        val savedPlan = planRepository.save(plan)
        for (weekReq in request.weeks) {
            val week = WeeklyBlock(
                trainingPlan = savedPlan,
                weekNumber = weekReq.weekNumber,
                phase = weekReq.phase,
                startDate = weekReq.startDate,
                endDate = weekReq.endDate,
                plannedKm = weekReq.plannedKm,
                plannedVertM = weekReq.plannedVertM,
                notes = weekReq.notes
            )
            val savedWeek = weeklyBlockRepository.save(week)
            for (workoutReq in weekReq.workouts) {
                val workout = DailyWorkout(
                    weeklyBlock = savedWeek,
                    workoutDate = workoutReq.workoutDate,
                    dayOfWeek = workoutReq.dayOfWeek,
                    workoutType = workoutReq.workoutType,
                    description = workoutReq.description,
                    plannedKm = workoutReq.plannedKm,
                    plannedVertM = workoutReq.plannedVertM,
                    isRestDay = workoutReq.isRestDay,
                    isRaceDay = workoutReq.isRaceDay
                )
                dailyWorkoutRepository.save(workout)
            }
        }
        return getPlanForAthlete(athleteId)!!
    }

    @Transactional
    fun deletePlanForAthlete(athleteId: Long, planId: Long) {
        val plan = planRepository.findByIdAndAthleteId(planId, athleteId).orElseThrow {
            ResponseStatusException(HttpStatus.NOT_FOUND, "Plan $planId not found for athlete $athleteId")
        }
        planRepository.delete(plan)
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private fun WeeklyBlock.toDto(): WeeklyBlockDto {
        val workouts = dailyWorkoutRepository.findByWeeklyBlockIdOrderByWorkoutDateAsc(id)
        return WeeklyBlockDto(
            id = id,
            weekNumber = weekNumber,
            phase = phase,
            startDate = startDate,
            endDate = endDate,
            plannedKm = plannedKm,
            plannedVertM = plannedVertM,
            notes = notes,
            workouts = workouts.map { it.toDto() }
        )
    }

    private fun WeeklyBlock.toSummaryDto() = WeeklyBlockSummaryDto(
        id = id,
        weekNumber = weekNumber,
        phase = phase,
        startDate = startDate,
        endDate = endDate,
        plannedKm = plannedKm,
        plannedVertM = plannedVertM,
        notes = notes
    )

    private fun DailyWorkout.toDto() = DailyWorkoutDto(
        id = id,
        workoutDate = workoutDate,
        dayOfWeek = dayOfWeek,
        workoutType = workoutType,
        description = description,
        plannedKm = plannedKm,
        plannedVertM = plannedVertM,
        isRestDay = isRestDay,
        isRaceDay = isRaceDay
    )
}
