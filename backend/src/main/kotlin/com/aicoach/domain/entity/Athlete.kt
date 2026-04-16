package com.aicoach.domain.entity

import jakarta.persistence.*
import java.time.Instant
import java.time.LocalDate

enum class FitnessLevel { BEGINNER, INTERMEDIATE, ADVANCED, ELITE }
enum class GoalType { FINISH_COMFORTABLY, TARGET_TIME, PODIUM }

@Entity
@Table(name = "athletes")
class Athlete(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "name", nullable = false)
    var name: String,

    @Column(name = "email")
    var email: String? = null,

    @Column(name = "experience_years")
    var experienceYears: Int? = null,

    @Enumerated(EnumType.STRING)
    @Column(name = "fitness_level", length = 20)
    var fitnessLevel: FitnessLevel? = null,

    @Column(name = "current_weekly_km", columnDefinition = "NUMERIC(6,1)")
    var currentWeeklyKm: Double? = null,

    @Column(name = "longest_recent_run_km", columnDefinition = "NUMERIC(5,1)")
    var longestRecentRunKm: Double? = null,

    @Column(name = "recent_races", columnDefinition = "TEXT")
    var recentRaces: String? = null,

    @Column(name = "training_days_per_week")
    var trainingDaysPerWeek: Int? = null,

    @Column(name = "preferred_long_run_day", length = 20)
    var preferredLongRunDay: String? = null,

    @Column(name = "injuries", columnDefinition = "TEXT")
    var injuries: String? = null,

    @Column(name = "strength_training_frequency", length = 50)
    var strengthTrainingFrequency: String? = null,

    @Enumerated(EnumType.STRING)
    @Column(name = "goal_type", length = 30)
    var goalType: GoalType? = null,

    @Column(name = "target_finish_time", length = 50)
    var targetFinishTime: String? = null,

    @Column(name = "trail_access")
    var trailAccess: Boolean = false,

    @Column(name = "coach_notes", columnDefinition = "TEXT")
    var coachNotes: String? = null,

    @Column(name = "athlete_summary", columnDefinition = "TEXT")
    var athleteSummary: String? = null,

    @Column(name = "race_name")
    var raceName: String? = null,

    @Column(name = "race_date")
    var raceDate: LocalDate? = null,

    @Column(name = "race_distance_km", columnDefinition = "NUMERIC(6,1)")
    var raceDistanceKm: Double? = null,

    @Column(name = "race_elevation_m")
    var raceElevationM: Int? = null,

    @Column(name = "strava_enabled")
    var stravaEnabled: Boolean = false,

    @Column(name = "strava_athlete_id")
    var stravaAthleteId: Long? = null,

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: Instant = Instant.now(),

    @Column(name = "updated_at", nullable = false)
    var updatedAt: Instant = Instant.now()
)

