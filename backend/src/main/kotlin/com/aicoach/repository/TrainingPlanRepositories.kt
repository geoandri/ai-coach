package com.aicoach.repository

import com.aicoach.domain.entity.TrainingPlan
import com.aicoach.domain.entity.WeeklyBlock
import com.aicoach.domain.entity.DailyWorkout
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.time.LocalDate
import java.util.Optional

@Repository
interface TrainingPlanRepository : JpaRepository<TrainingPlan, Long> {
    fun findFirstByOrderByIdAsc(): Optional<TrainingPlan>
    fun findByAthleteId(athleteId: Long): Optional<TrainingPlan>
    fun findByIdAndAthleteId(id: Long, athleteId: Long): Optional<TrainingPlan>
    fun existsByAthleteId(athleteId: Long): Boolean
}

@Repository
interface WeeklyBlockRepository : JpaRepository<WeeklyBlock, Long> {
    fun findByTrainingPlanIdOrderByWeekNumberAsc(planId: Long): List<WeeklyBlock>
    fun findByTrainingPlanIdAndWeekNumber(planId: Long, weekNumber: Int): Optional<WeeklyBlock>

    @Query("""
        SELECT wb FROM WeeklyBlock wb
        WHERE wb.trainingPlan.id = :planId
        AND wb.startDate <= :date AND wb.endDate >= :date
    """)
    fun findByTrainingPlanIdAndDateInRange(planId: Long, date: LocalDate): Optional<WeeklyBlock>
}

@Repository
interface DailyWorkoutRepository : JpaRepository<DailyWorkout, Long> {
    fun findByWeeklyBlockIdOrderByWorkoutDateAsc(weeklyBlockId: Long): List<DailyWorkout>

    @Query("""
        SELECT dw FROM DailyWorkout dw
        WHERE dw.weeklyBlock.trainingPlan.athlete.id = :athleteId
        AND dw.workoutDate >= :startDate
        AND dw.workoutDate <= :endDate
        ORDER BY dw.workoutDate ASC
    """)
    fun findByAthleteIdAndDateRange(
        @Param("athleteId") athleteId: Long,
        @Param("startDate") startDate: java.time.LocalDate,
        @Param("endDate") endDate: java.time.LocalDate
    ): List<DailyWorkout>
}
