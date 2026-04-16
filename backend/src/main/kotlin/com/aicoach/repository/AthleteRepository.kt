package com.aicoach.repository

import com.aicoach.domain.entity.Athlete
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
interface AthleteRepository : JpaRepository<Athlete, Long> {
    fun findByStravaAthleteId(stravaAthleteId: Long): Optional<Athlete>
}
