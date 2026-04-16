package com.aicoach.domain.entity

import jakarta.persistence.*
import java.time.Instant

@Entity
@Table(name = "strava_tokens")
class StravaToken(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "athlete_id", nullable = false, unique = true)
    val athleteId: Long,

    @Column(name = "access_token", nullable = false, columnDefinition = "TEXT")
    var accessToken: String,

    @Column(name = "refresh_token", nullable = false, columnDefinition = "TEXT")
    var refreshToken: String,

    @Column(name = "expires_at", nullable = false)
    var expiresAt: Long,

    @Column(name = "scope")
    var scope: String? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "internal_athlete_id")
    var internalAthlete: Athlete? = null,

    @Column(name = "created_at", nullable = false)
    val createdAt: Instant = Instant.now(),

    @Column(name = "updated_at", nullable = false)
    var updatedAt: Instant = Instant.now()
) {
    fun isExpired(): Boolean {
        // Consider expired if within 5 minutes of expiry
        return Instant.now().epochSecond >= (expiresAt - 300)
    }
}
