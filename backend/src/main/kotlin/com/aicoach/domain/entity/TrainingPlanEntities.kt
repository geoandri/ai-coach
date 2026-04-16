package com.aicoach.domain.entity

import jakarta.persistence.*
import java.time.LocalDate

@Entity
@Table(name = "training_plans")
class TrainingPlan(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "athlete_id", nullable = false)
    var athlete: Athlete? = null,

    @Column(name = "name", nullable = false)
    val name: String,

    @Column(name = "race_name")
    val raceName: String? = null,

    @Column(name = "race_date")
    val raceDate: LocalDate? = null,

    @Column(name = "tune_up_race_name")
    val tuneUpRaceName: String? = null,

    @Column(name = "tune_up_race_date")
    val tuneUpRaceDate: LocalDate? = null,

    @Column(name = "total_weeks", nullable = false)
    val totalWeeks: Int,

    @OneToMany(mappedBy = "trainingPlan", fetch = FetchType.LAZY, cascade = [CascadeType.ALL])
    val weeklyBlocks: MutableList<WeeklyBlock> = mutableListOf()
)

@Entity
@Table(name = "weekly_blocks")
class WeeklyBlock(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "training_plan_id", nullable = false)
    val trainingPlan: TrainingPlan,

    @Column(name = "week_number", nullable = false)
    val weekNumber: Int,

    @Column(name = "phase")
    val phase: String? = null,

    @Column(name = "start_date", nullable = false)
    val startDate: LocalDate,

    @Column(name = "end_date", nullable = false)
    val endDate: LocalDate,

    @Column(name = "planned_km", columnDefinition = "NUMERIC(6,1)")
    val plannedKm: Double? = null,

    @Column(name = "planned_vert_m")
    val plannedVertM: Int? = null,

    @Column(name = "notes", columnDefinition = "TEXT")
    val notes: String? = null,

    @OneToMany(mappedBy = "weeklyBlock", fetch = FetchType.LAZY, cascade = [CascadeType.ALL])
    val dailyWorkouts: MutableList<DailyWorkout> = mutableListOf()
)

@Entity
@Table(name = "daily_workouts")
class DailyWorkout(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "weekly_block_id", nullable = false)
    val weeklyBlock: WeeklyBlock,

    @Column(name = "workout_date", nullable = false)
    val workoutDate: LocalDate,

    @Column(name = "day_of_week")
    val dayOfWeek: String? = null,

    @Column(name = "workout_type")
    val workoutType: String? = null,

    @Column(name = "description", columnDefinition = "TEXT")
    val description: String? = null,

    @Column(name = "planned_km", columnDefinition = "NUMERIC(5,1)")
    val plannedKm: Double? = null,

    @Column(name = "planned_vert_m")
    val plannedVertM: Int? = null,

    @Column(name = "is_rest_day", nullable = false)
    val isRestDay: Boolean = false,

    @Column(name = "is_race_day", nullable = false)
    val isRaceDay: Boolean = false
)
