package com.aicoach.repository

import com.aicoach.PostgresTestContainerConfig
import com.aicoach.domain.entity.Athlete
import com.aicoach.domain.entity.DailyWorkout
import com.aicoach.domain.entity.TrainingPlan
import com.aicoach.domain.entity.WeeklyBlock
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import org.springframework.test.context.ActiveProfiles
import java.time.LocalDate
import org.assertj.core.api.Assertions.assertThat

@DataJpaTest
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class DailyWorkoutRepositoryTest : PostgresTestContainerConfig() {

    @Autowired
    lateinit var em: TestEntityManager

    @Autowired
    lateinit var workoutRepository: DailyWorkoutRepository

    private fun setupAthleteWithPlanAndWorkouts(
        athleteName: String = "Workout Athlete"
    ): Triple<Athlete, TrainingPlan, WeeklyBlock> {
        val athlete = em.persistAndFlush(Athlete(name = athleteName))

        val plan = em.persistAndFlush(
            TrainingPlan(
                name = "Test Plan",
                totalWeeks = 1
            ).also { it.athlete = athlete }
        )

        val week = em.persistAndFlush(
            WeeklyBlock(
                trainingPlan = plan,
                weekNumber = 1,
                startDate = LocalDate.of(2025, 3, 3),
                endDate = LocalDate.of(2025, 3, 9)
            )
        )

        return Triple(athlete, plan, week)
    }

    @Test
    fun `findByAthleteIdAndDateRange returns correct workouts for athlete in range`() {
        val (athlete, _, week) = setupAthleteWithPlanAndWorkouts()

        em.persistAndFlush(
            DailyWorkout(
                weeklyBlock = week,
                workoutDate = LocalDate.of(2025, 3, 4),
                workoutType = "Easy Run",
                plannedKm = 10.0
            )
        )
        em.persistAndFlush(
            DailyWorkout(
                weeklyBlock = week,
                workoutDate = LocalDate.of(2025, 3, 5),
                workoutType = "Tempo",
                plannedKm = 12.0
            )
        )
        // Outside range
        em.persistAndFlush(
            DailyWorkout(
                weeklyBlock = week,
                workoutDate = LocalDate.of(2025, 3, 15),
                workoutType = "Long Run",
                plannedKm = 25.0
            )
        )

        val results = workoutRepository.findByAthleteIdAndDateRange(
            athlete.id,
            LocalDate.of(2025, 3, 3),
            LocalDate.of(2025, 3, 9)
        )

        assertThat(results).hasSize(2)
        assertThat(results.map { it.workoutType }).containsExactlyInAnyOrder("Easy Run", "Tempo")
    }

    @Test
    fun `findByAthleteIdAndDateRange returns empty when athlete has no workouts in range`() {
        val (athlete, _, _) = setupAthleteWithPlanAndWorkouts("Empty Athlete")

        val results = workoutRepository.findByAthleteIdAndDateRange(
            athlete.id,
            LocalDate.of(2025, 3, 3),
            LocalDate.of(2025, 3, 9)
        )

        assertThat(results).isEmpty()
    }
}
