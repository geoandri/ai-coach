package com.aicoach.service

import com.aicoach.domain.dto.WeekAdherenceDto
import com.aicoach.domain.entity.StravaActivity
import com.aicoach.domain.entity.TrainingPlan
import com.aicoach.domain.entity.WeeklyBlock
import com.aicoach.repository.StravaActivityRepository
import com.aicoach.repository.TrainingPlanRepository
import com.aicoach.repository.WeeklyBlockRepository
import io.kotest.core.spec.style.DescribeSpec
import io.kotest.matchers.shouldBe
import io.mockk.every
import io.mockk.mockk
import java.math.BigDecimal
import java.time.LocalDate
import java.util.Optional

class DashboardServiceTest : DescribeSpec({

    val planRepository = mockk<TrainingPlanRepository>()
    val weeklyBlockRepository = mockk<WeeklyBlockRepository>()
    val activityRepository = mockk<StravaActivityRepository>()
    val service = DashboardService(planRepository, weeklyBlockRepository, activityRepository)

    fun makePlan(id: Long = 1L) = TrainingPlan(id = id, name = "Test Plan", totalWeeks = 2)

    fun makeWeek(
        planId: Long = 1L,
        weekNumber: Int = 1,
        start: LocalDate = LocalDate.of(2025, 1, 6),
        end: LocalDate = LocalDate.of(2025, 1, 12),
        plannedKm: Double? = 50.0,
        plannedVertM: Int? = 500
    ): WeeklyBlock {
        val plan = TrainingPlan(id = planId, name = "Test Plan", totalWeeks = 2)
        return WeeklyBlock(
            id = weekNumber.toLong(),
            trainingPlan = plan,
            weekNumber = weekNumber,
            startDate = start,
            endDate = end,
            plannedKm = plannedKm,
            plannedVertM = plannedVertM
        )
    }

    fun makeActivity(
        id: Long = 1L,
        athleteId: Long = 0L,
        date: LocalDate = LocalDate.of(2025, 1, 7),
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

    describe("getSummary") {
        it("returns empty DTO when no plan exists") {
            every { planRepository.findFirstByOrderByIdAsc() } returns Optional.empty()

            val result = service.getSummary()

            result.weeks shouldBe emptyList()
            result.currentWeekNumber shouldBe null
            result.totalPlannedKm shouldBe 0.0
            result.totalActualKm shouldBe 0.0
        }

        it("calculates adherence percent correctly") {
            val plan = makePlan()
            val week = makeWeek(plannedKm = 50.0)
            val activities = listOf(makeActivity(distanceM = 40000.0)) // 40 km

            every { planRepository.findFirstByOrderByIdAsc() } returns Optional.of(plan)
            every { weeklyBlockRepository.findByTrainingPlanIdOrderByWeekNumberAsc(1L) } returns listOf(week)
            every {
                activityRepository.findByActivityDateBetweenOrderByActivityDateAsc(any(), any())
            } returns activities

            val result = service.getSummary()

            result.weeks[0].adherencePercent shouldBe 80.0 // 40/50 * 100
            result.weeks[0].actualKm shouldBe 40.0
        }

        it("caps adherence at 200.0") {
            val plan = makePlan()
            val week = makeWeek(plannedKm = 10.0)
            val activities = listOf(makeActivity(distanceM = 25000.0)) // 25 km

            every { planRepository.findFirstByOrderByIdAsc() } returns Optional.of(plan)
            every { weeklyBlockRepository.findByTrainingPlanIdOrderByWeekNumberAsc(1L) } returns listOf(week)
            every {
                activityRepository.findByActivityDateBetweenOrderByActivityDateAsc(any(), any())
            } returns activities

            val result = service.getSummary()

            result.weeks[0].adherencePercent shouldBe 200.0
        }

        it("filters out non-Run sport types") {
            val plan = makePlan()
            val week = makeWeek(plannedKm = 50.0)
            val activities = listOf(
                makeActivity(id = 1L, distanceM = 20000.0, sportType = "Run"),
                makeActivity(id = 2L, distanceM = 30000.0, sportType = "Ride"), // should be filtered
                makeActivity(id = 3L, distanceM = 10000.0, sportType = "TrailRun")
            )

            every { planRepository.findFirstByOrderByIdAsc() } returns Optional.of(plan)
            every { weeklyBlockRepository.findByTrainingPlanIdOrderByWeekNumberAsc(1L) } returns listOf(week)
            every {
                activityRepository.findByActivityDateBetweenOrderByActivityDateAsc(any(), any())
            } returns activities

            val result = service.getSummary()

            result.weeks[0].actualKm shouldBe 30.0 // 20 + 10, Ride excluded
            result.weeks[0].activityCount shouldBe 2
        }

        it("correctly identifies isCurrentWeek and isFutureWeek") {
            val today = LocalDate.now()
            val plan = makePlan()
            val currentWeek = makeWeek(
                weekNumber = 1,
                start = today.minusDays(2),
                end = today.plusDays(4)
            )
            val futureWeek = makeWeek(
                weekNumber = 2,
                start = today.plusDays(7),
                end = today.plusDays(13)
            )

            every { planRepository.findFirstByOrderByIdAsc() } returns Optional.of(plan)
            every { weeklyBlockRepository.findByTrainingPlanIdOrderByWeekNumberAsc(1L) } returns listOf(currentWeek, futureWeek)
            every {
                activityRepository.findByActivityDateBetweenOrderByActivityDateAsc(any(), any())
            } returns emptyList()

            val result = service.getSummary()

            result.weeks[0].isCurrentWeek shouldBe true
            result.weeks[0].isFutureWeek shouldBe false
            result.weeks[1].isCurrentWeek shouldBe false
            result.weeks[1].isFutureWeek shouldBe true
        }
    }

    describe("getSummaryForAthlete") {
        it("returns empty DTO when athlete has no plan") {
            every { planRepository.findByAthleteId(5L) } returns Optional.empty()

            val result = service.getSummaryForAthlete(5L)

            result.weeks shouldBe emptyList()
            result.currentWeekNumber shouldBe null
        }

        it("calculates adherence for specific athlete activities") {
            val plan = makePlan()
            val week = makeWeek(plannedKm = 60.0)
            val activities = listOf(
                makeActivity(id = 1L, athleteId = 5L, distanceM = 30000.0),
                makeActivity(id = 2L, athleteId = 5L, distanceM = 30000.0)
            )

            every { planRepository.findByAthleteId(5L) } returns Optional.of(plan)
            every { weeklyBlockRepository.findByTrainingPlanIdOrderByWeekNumberAsc(1L) } returns listOf(week)
            every {
                activityRepository.findByInternalAthleteIdAndActivityDateBetweenOrderByActivityDateAsc(5L, any(), any())
            } returns activities

            val result = service.getSummaryForAthlete(5L)

            result.weeks[0].actualKm shouldBe 60.0
            result.weeks[0].adherencePercent shouldBe 100.0
        }
    }
})
