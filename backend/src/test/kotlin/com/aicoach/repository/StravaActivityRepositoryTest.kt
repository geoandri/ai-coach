package com.aicoach.repository

import com.aicoach.PostgresTestContainerConfig
import com.aicoach.domain.entity.Athlete
import com.aicoach.domain.entity.StravaActivity
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import org.springframework.test.context.ActiveProfiles
import java.math.BigDecimal
import java.time.LocalDate
import org.assertj.core.api.Assertions.assertThat

@DataJpaTest
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class StravaActivityRepositoryTest : PostgresTestContainerConfig() {

    @Autowired
    lateinit var em: TestEntityManager

    @Autowired
    lateinit var activityRepository: StravaActivityRepository

    @Autowired
    lateinit var athleteRepository: AthleteRepository

    private fun persistAthlete(name: String = "Test Athlete"): Athlete {
        return em.persistAndFlush(Athlete(name = name))
    }

    private fun persistActivity(
        stravaId: Long,
        athlete: Athlete,
        date: LocalDate = LocalDate.of(2025, 3, 5),
        distanceM: Double = 10000.0,
        sportType: String = "Run"
    ): StravaActivity {
        return em.persistAndFlush(
            StravaActivity(
                stravaId = stravaId,
                athleteId = athlete.stravaAthleteId ?: 0L,
                activityDate = date,
                distanceM = BigDecimal.valueOf(distanceM),
                sportType = sportType,
                internalAthlete = athlete
            )
        )
    }

    @Test
    fun `existsByStravaId returns false when not found`() {
        assertThat(activityRepository.existsByStravaId(99999L)).isFalse()
    }

    @Test
    fun `existsByStravaId returns true after save`() {
        val athlete = persistAthlete()
        persistActivity(stravaId = 111L, athlete = athlete)

        assertThat(activityRepository.existsByStravaId(111L)).isTrue()
    }

    @Test
    fun `findByActivityDateBetweenOrderByActivityDateAsc returns only activities in range`() {
        val athlete = persistAthlete()
        persistActivity(stravaId = 201L, athlete = athlete, date = LocalDate.of(2025, 3, 1))
        persistActivity(stravaId = 202L, athlete = athlete, date = LocalDate.of(2025, 3, 5))
        persistActivity(stravaId = 203L, athlete = athlete, date = LocalDate.of(2025, 3, 10))

        val results = activityRepository.findByActivityDateBetweenOrderByActivityDateAsc(
            LocalDate.of(2025, 3, 3),
            LocalDate.of(2025, 3, 7)
        )

        assertThat(results).hasSize(1)
        assertThat(results[0].stravaId).isEqualTo(202L)
    }

    @Test
    fun `findByInternalAthleteIdAndActivityDateBetween scoped to athlete`() {
        val athleteA = persistAthlete("Athlete A")
        val athleteB = persistAthlete("Athlete B")

        persistActivity(stravaId = 301L, athlete = athleteA, date = LocalDate.of(2025, 3, 5))
        persistActivity(stravaId = 302L, athlete = athleteB, date = LocalDate.of(2025, 3, 5))

        val results = activityRepository.findByInternalAthleteIdAndActivityDateBetweenOrderByActivityDateAsc(
            athleteA.id,
            LocalDate.of(2025, 3, 1),
            LocalDate.of(2025, 3, 31)
        )

        assertThat(results).hasSize(1)
        assertThat(results[0].stravaId).isEqualTo(301L)
    }
}
