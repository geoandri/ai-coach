package com.aicoach.repository

import com.aicoach.domain.entity.StravaToken
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
interface StravaTokenRepository : JpaRepository<StravaToken, Long> {
    fun findByAthleteId(athleteId: Long): Optional<StravaToken>
    fun findFirstByOrderByIdAsc(): Optional<StravaToken>
    fun findByInternalAthleteId(internalAthleteId: Long): Optional<StravaToken>
}
