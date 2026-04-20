package com.aicoach.service

import com.aicoach.domain.entity.DailyWorkout
import com.aicoach.domain.entity.StravaActivity
import com.aicoach.domain.entity.TrainingPlan
import com.aicoach.domain.entity.WeeklyBlock
import com.aicoach.repository.DailyWorkoutRepository
import com.aicoach.repository.StravaActivityRepository
import io.kotest.core.spec.style.DescribeSpec
import io.kotest.matchers.shouldBe
import io.mockk.every
import io.mockk.mockk
import java.math.BigDecimal
import java.time.LocalDate

class PlanDiffServiceTest : DescribeSpec({

    val dailyWorkoutRepository = mockk<DailyWorkoutRepository>()
    val activityRepository = mockk<StravaActivityRepository>()
    val service = PlanDiffService(dailyWorkoutRepository, activityRepository)

    val athleteId = 1L
    val startDate = LocalDate.of(2025, 3, 3) // Monday
    val endDate = LocalDate.of(2025, 3, 7)   // Friday (5 days)

    fun makeWeeklyBlock() = WeeklyBlock(
        id = 1L,
        trainingPlan = TrainingPlan(id = 1L, name = "Test Plan", totalWeeks = 1),
        weekNumber = 1,
        startDate = startDate,
        endDate = endDate
    )

    fun makeWorkout(date: LocalDate, plannedKm: Double? = 10.0, isRestDay: Boolean = false) = DailyWorkout(
        id = 1L,
        weeklyBlock = makeWeeklyBlock(),
        workoutDate = date,
        dayOfWeek = "MONDAY",
        workoutType = "Easy Run",
        description = "Easy run",
        plannedKm = plannedKm,
        plannedVertM = 100,
        isRestDay = isRestDay
    )

    fun makeActivity(
        id: Long,
        date: LocalDate,
        distanceM: Double = 10000.0,
        elevationM: Double = 100.0,
        sportType: String = "Run"
    ) = StravaActivity(
        id = id,
        stravaId = id * 100,
        athleteId = athleteId,
        activityDate = date,
        distanceM = BigDecimal.valueOf(distanceM),
        totalElevationM = BigDecimal.valueOf(elevationM),
        sportType = sportType
    )

    describe("getPlanVsActual") {
        it("iterates correctly through date range — correct number of days") {
            every { dailyWorkoutRepository.findByAthleteIdAndDateRange(athleteId, startDate, endDate) } returns emptyList()
            every {
                activityRepository.findByInternalAthleteIdAndActivityDateBetweenOrderByActivityDateAsc(athleteId, startDate, endDate)
            } returns emptyList()

            val result = service.getPlanVsActual(athleteId, startDate, endDate)

            result.days.size shouldBe 5 // Mon–Fri inclusive
            result.days[0].date shouldBe startDate
            result.days[4].date shouldBe endDate
        }

        it("maps planned workout fields per day when workout exists") {
            val workout = makeWorkout(startDate, plannedKm = 12.0)
            every { dailyWorkoutRepository.findByAthleteIdAndDateRange(athleteId, startDate, endDate) } returns listOf(workout)
            every {
                activityRepository.findByInternalAthleteIdAndActivityDateBetweenOrderByActivityDateAsc(athleteId, startDate, endDate)
            } returns emptyList()

            val result = service.getPlanVsActual(athleteId, startDate, endDate)

            val day = result.days[0]
            day.plannedKm shouldBe 12.0
            day.plannedWorkoutType shouldBe "Easy Run"
            day.plannedDescription shouldBe "Easy run"
        }

        it("handles day with no planned workout") {
            every { dailyWorkoutRepository.findByAthleteIdAndDateRange(athleteId, startDate, endDate) } returns emptyList()
            every {
                activityRepository.findByInternalAthleteIdAndActivityDateBetweenOrderByActivityDateAsc(athleteId, startDate, endDate)
            } returns emptyList()

            val result = service.getPlanVsActual(athleteId, startDate, endDate)

            val day = result.days[0]
            day.plannedKm shouldBe null
            day.isRestDay shouldBe false
            day.actualKm shouldBe 0.0
        }

        it("handles multiple activities on same day — sums km and elevation") {
            every { dailyWorkoutRepository.findByAthleteIdAndDateRange(athleteId, startDate, endDate) } returns emptyList()
            every {
                activityRepository.findByInternalAthleteIdAndActivityDateBetweenOrderByActivityDateAsc(athleteId, startDate, endDate)
            } returns listOf(
                makeActivity(1L, startDate, distanceM = 8000.0, elevationM = 80.0),
                makeActivity(2L, startDate, distanceM = 5000.0, elevationM = 50.0)
            )

            val result = service.getPlanVsActual(athleteId, startDate, endDate)

            val day = result.days[0]
            day.actualKm shouldBe 13.0 // 8 + 5
            day.actualVertM shouldBe 130.0 // 80 + 50
            day.activities.size shouldBe 2
        }

        it("calculates kmDiff correctly (actualKm - plannedKm)") {
            val workout = makeWorkout(startDate, plannedKm = 10.0)
            every { dailyWorkoutRepository.findByAthleteIdAndDateRange(athleteId, startDate, endDate) } returns listOf(workout)
            every {
                activityRepository.findByInternalAthleteIdAndActivityDateBetweenOrderByActivityDateAsc(athleteId, startDate, endDate)
            } returns listOf(makeActivity(1L, startDate, distanceM = 12000.0))

            val result = service.getPlanVsActual(athleteId, startDate, endDate)

            result.days[0].kmDiff shouldBe 2.0 // 12 - 10
        }

        it("caps adherencePercent at 200.0") {
            val workout = makeWorkout(startDate, plannedKm = 5.0)
            every { dailyWorkoutRepository.findByAthleteIdAndDateRange(athleteId, startDate, endDate) } returns listOf(workout)
            every {
                activityRepository.findByInternalAthleteIdAndActivityDateBetweenOrderByActivityDateAsc(athleteId, startDate, endDate)
            } returns listOf(makeActivity(1L, startDate, distanceM = 50000.0)) // 50 km vs 5 planned

            val result = service.getPlanVsActual(athleteId, startDate, endDate)

            result.adherencePercent shouldBe 200.0
        }

        it("filters non-running sport types") {
            every { dailyWorkoutRepository.findByAthleteIdAndDateRange(athleteId, startDate, endDate) } returns emptyList()
            every {
                activityRepository.findByInternalAthleteIdAndActivityDateBetweenOrderByActivityDateAsc(athleteId, startDate, endDate)
            } returns listOf(
                makeActivity(1L, startDate, distanceM = 10000.0, sportType = "Run"),
                makeActivity(2L, startDate, distanceM = 30000.0, sportType = "Ride") // should be filtered
            )

            val result = service.getPlanVsActual(athleteId, startDate, endDate)

            result.days[0].actualKm shouldBe 10.0
            result.days[0].activities.size shouldBe 1
        }
    }
})
