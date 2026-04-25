package com.aicoach.service

import com.aicoach.domain.dto.DailyWorkoutDto
import com.aicoach.domain.dto.TrainingPlanDto
import com.aicoach.domain.dto.TrainingPlanSummaryDto
import com.aicoach.domain.dto.WeeklyBlockDto
import com.aicoach.domain.dto.WeeklyBlockSummaryDto
import com.aicoach.domain.dto.CreateTrainingPlanRequest
import com.aicoach.domain.dto.UpdateWeekRequest
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
    fun updateWeekForAthlete(athleteId: Long, weekNumber: Int, request: UpdateWeekRequest): WeeklyBlockDto {
        val plan = planRepository.findByAthleteId(athleteId).orElseThrow {
            ResponseStatusException(HttpStatus.NOT_FOUND, "No training plan found for athlete $athleteId")
        }
        val existing = weeklyBlockRepository.findByTrainingPlanIdAndWeekNumber(plan.id, weekNumber).orElseThrow {
            ResponseStatusException(HttpStatus.NOT_FOUND, "Week $weekNumber not found")
        }
        val updated = WeeklyBlock(
            id = existing.id,
            trainingPlan = existing.trainingPlan,
            weekNumber = existing.weekNumber,
            phase = if (request.phase != null) request.phase else existing.phase,
            startDate = existing.startDate,
            endDate = existing.endDate,
            plannedKm = if (request.plannedKm != null) request.plannedKm else existing.plannedKm,
            plannedVertM = if (request.plannedVertM != null) request.plannedVertM else existing.plannedVertM,
            notes = if (request.notes != null) request.notes else existing.notes
        )
        weeklyBlockRepository.save(updated)
        if (request.workouts != null) {
            val existingWorkouts = dailyWorkoutRepository.findByWeeklyBlockIdOrderByWorkoutDateAsc(existing.id)
                .associateBy { it.workoutDate }
            for (workoutReq in request.workouts) {
                val existingWorkout = existingWorkouts[workoutReq.workoutDate]
                    ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "No workout on ${workoutReq.workoutDate} in week $weekNumber")
                val updatedWorkout = DailyWorkout(
                    id = existingWorkout.id,
                    weeklyBlock = updated,
                    workoutDate = existingWorkout.workoutDate,
                    dayOfWeek = if (workoutReq.dayOfWeek != null) workoutReq.dayOfWeek else existingWorkout.dayOfWeek,
                    workoutType = if (workoutReq.workoutType != null) workoutReq.workoutType else existingWorkout.workoutType,
                    description = if (workoutReq.description != null) workoutReq.description else existingWorkout.description,
                    plannedKm = if (workoutReq.plannedKm != null) workoutReq.plannedKm else existingWorkout.plannedKm,
                    plannedVertM = if (workoutReq.plannedVertM != null) workoutReq.plannedVertM else existingWorkout.plannedVertM,
                    isRestDay = workoutReq.isRestDay ?: existingWorkout.isRestDay,
                    isRaceDay = workoutReq.isRaceDay ?: existingWorkout.isRaceDay
                )
                dailyWorkoutRepository.save(updatedWorkout)
            }
        }
        return getWeekForAthlete(athleteId, weekNumber)!!
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
