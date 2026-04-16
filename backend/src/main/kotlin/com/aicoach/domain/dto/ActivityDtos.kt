package com.aicoach.domain.dto

import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

data class ActivityDto(
    val id: Long,
    val stravaId: Long,
    val name: String?,
    val sportType: String?,
    val activityDate: LocalDate,
    val startDatetime: LocalDateTime?,
    val distanceKm: Double,
    val movingTimeS: Int?,
    val totalElevationM: BigDecimal?,
    val averageHeartrate: BigDecimal?
)

data class SyncResultDto(
    val syncedCount: Int,
    val message: String
)
