package com.aicoach.domain.entity

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

@Entity
@Table(name = "strava_activities")
class StravaActivity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "strava_id", nullable = false, unique = true)
    val stravaId: Long,

    @Column(name = "athlete_id", nullable = false)
    val athleteId: Long,

    @Column(name = "name")
    val name: String? = null,

    @Column(name = "sport_type")
    val sportType: String? = null,

    @Column(name = "activity_date", nullable = false)
    val activityDate: LocalDate,

    @Column(name = "start_datetime")
    val startDatetime: LocalDateTime? = null,

    @Column(name = "distance_m")
    val distanceM: BigDecimal? = null,

    @Column(name = "moving_time_s")
    val movingTimeS: Int? = null,

    @Column(name = "elapsed_time_s")
    val elapsedTimeS: Int? = null,

    @Column(name = "total_elevation_m")
    val totalElevationM: BigDecimal? = null,

    @Column(name = "average_speed")
    val averageSpeed: BigDecimal? = null,

    @Column(name = "max_speed")
    val maxSpeed: BigDecimal? = null,

    @Column(name = "average_heartrate")
    val averageHeartrate: BigDecimal? = null,

    @Column(name = "max_heartrate")
    val maxHeartrate: BigDecimal? = null,

    @Column(name = "trainer")
    val trainer: Boolean = false,

    @Column(name = "manual")
    val manual: Boolean = false,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "internal_athlete_id")
    var internalAthlete: Athlete? = null,

    @Column(name = "synced_at", nullable = false)
    val syncedAt: LocalDateTime = LocalDateTime.now()
) {
    val distanceKm: Double get() = distanceM?.toDouble()?.div(1000.0) ?: 0.0
}
