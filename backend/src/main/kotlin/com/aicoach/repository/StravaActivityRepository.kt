package com.aicoach.repository

import com.aicoach.domain.entity.StravaActivity
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.time.LocalDate
import java.util.Optional

@Repository
interface StravaActivityRepository : JpaRepository<StravaActivity, Long> {
    fun findByStravaId(stravaId: Long): Optional<StravaActivity>
    fun existsByStravaId(stravaId: Long): Boolean
    fun findByActivityDateBetweenOrderByActivityDateAsc(start: LocalDate, end: LocalDate): List<StravaActivity>
    fun findBySportTypeInOrderByActivityDateDesc(sportTypes: List<String>, pageable: Pageable): Page<StravaActivity>

    @Query("SELECT COALESCE(MAX(a.startDatetime), NULL) FROM StravaActivity a WHERE a.athleteId = :athleteId")
    fun findLatestStartDatetime(athleteId: Long): java.time.LocalDateTime?

    fun findByInternalAthleteIdAndActivityDateBetweenOrderByActivityDateAsc(
        internalAthleteId: Long,
        startDate: java.time.LocalDate,
        endDate: java.time.LocalDate
    ): List<StravaActivity>

    fun findByInternalAthleteIdAndSportTypeInOrderByActivityDateDesc(
        internalAthleteId: Long,
        sportTypes: List<String>,
        pageable: Pageable
    ): Page<StravaActivity>
}
