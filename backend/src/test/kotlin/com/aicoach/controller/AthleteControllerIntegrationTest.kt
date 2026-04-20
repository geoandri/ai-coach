package com.aicoach.controller

import com.aicoach.PostgresTestContainerConfig
import com.aicoach.domain.dto.*
import org.junit.jupiter.api.TestMethodOrder
import org.junit.jupiter.api.MethodOrderer
import org.junit.jupiter.api.Order
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.web.client.TestRestTemplate
import org.springframework.http.HttpEntity
import org.springframework.http.HttpMethod
import org.springframework.http.HttpStatus
import org.springframework.test.context.ActiveProfiles
import java.time.LocalDate
import org.assertj.core.api.Assertions.assertThat

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation::class)
class AthleteControllerIntegrationTest : PostgresTestContainerConfig() {

    @Autowired
    lateinit var rest: TestRestTemplate

    companion object {
        var createdAthleteId: Long = 0L
        var createdPlanId: Long = 0L
    }

    @Test
    @Order(1)
    fun `POST athletes - 201 Created with correct name`() {
        val request = CreateAthleteRequest(name = "Integration Tester", email = "it@test.com")
        val response = rest.postForEntity("/api/athletes", request, AthleteDto::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.CREATED)
        assertThat(response.body?.name).isEqualTo("Integration Tester")
        assertThat(response.body?.id).isGreaterThan(0L)

        createdAthleteId = response.body!!.id
    }

    @Test
    @Order(2)
    fun `GET athletes - 200 returns list with at least one athlete`() {
        val response = rest.getForEntity("/api/athletes", Array<AthleteDto>::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
        assertThat(response.body).isNotEmpty
    }

    @Test
    @Order(3)
    fun `GET athletes id - 200 when exists`() {
        val response = rest.getForEntity("/api/athletes/$createdAthleteId", AthleteDto::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
        assertThat(response.body?.name).isEqualTo("Integration Tester")
    }

    @Test
    @Order(4)
    fun `GET athletes id - 404 when not found`() {
        val response = rest.getForEntity("/api/athletes/999999", Map::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.NOT_FOUND)
    }

    @Test
    @Order(5)
    fun `PUT athletes id - 200 partial update applied`() {
        val update = UpdateAthleteRequest(currentWeeklyKm = 75.0)
        val response = rest.exchange(
            "/api/athletes/$createdAthleteId",
            HttpMethod.PUT,
            HttpEntity(update),
            AthleteDto::class.java
        )

        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
        assertThat(response.body?.currentWeeklyKm).isEqualTo(75.0)
        assertThat(response.body?.name).isEqualTo("Integration Tester") // unchanged
    }

    @Test
    @Order(6)
    fun `POST athletes id coach-notes - 200 note appended`() {
        val request = AddCoachNoteRequest(note = "Good progress")
        val response = rest.postForEntity(
            "/api/athletes/$createdAthleteId/coach-notes",
            request,
            AthleteDto::class.java
        )

        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
        assertThat(response.body?.coachNotes).contains("Good progress")
    }

    @Test
    @Order(7)
    fun `POST athletes id training-plan - 201 plan with weeks stored`() {
        val request = CreateTrainingPlanRequest(
            name = "Test Plan",
            totalWeeks = 2,
            raceName = "Test Race",
            raceDate = LocalDate.of(2025, 6, 1),
            weeks = listOf(
                CreateWeeklyBlockRequest(
                    weekNumber = 1,
                    phase = "Base",
                    startDate = LocalDate.of(2025, 3, 3),
                    endDate = LocalDate.of(2025, 3, 9),
                    plannedKm = 50.0,
                    workouts = listOf(
                        CreateDailyWorkoutRequest(
                            workoutDate = LocalDate.of(2025, 3, 3),
                            dayOfWeek = "Monday",
                            workoutType = "Easy Run",
                            plannedKm = 10.0
                        )
                    )
                ),
                CreateWeeklyBlockRequest(
                    weekNumber = 2,
                    phase = "Build",
                    startDate = LocalDate.of(2025, 3, 10),
                    endDate = LocalDate.of(2025, 3, 16),
                    plannedKm = 60.0,
                    workouts = emptyList()
                )
            )
        )
        // Use String response to avoid ObjectMapper Kotlin deserialization issues in test context
        val rawResponse = rest.postForEntity(
            "/api/athletes/$createdAthleteId/training-plan",
            request,
            String::class.java
        )

        assertThat(rawResponse.statusCode).isEqualTo(HttpStatus.CREATED)
        assertThat(rawResponse.body).contains("Test Plan")
        assertThat(rawResponse.body).contains("\"totalWeeks\":2")

        // Parse plan ID from raw JSON for use in later tests
        val idMatch = Regex(""""id"\s*:\s*(\d+)""").find(rawResponse.body!!)
        createdPlanId = idMatch?.groupValues?.get(1)?.toLongOrNull() ?: 0L
        assertThat(createdPlanId).isGreaterThan(0L)
    }

    @Test
    @Order(8)
    fun `GET athletes id training-plan - 200 when plan exists`() {
        val response = rest.getForEntity(
            "/api/athletes/$createdAthleteId/training-plan",
            String::class.java
        )

        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
        assertThat(response.body).contains("\"totalWeeks\":2")
        assertThat(response.body).contains("\"weekNumber\":1")
    }

    @Test
    @Order(9)
    fun `GET athletes id training-plan week n - 200 when week exists`() {
        val response = rest.getForEntity(
            "/api/athletes/$createdAthleteId/training-plan/week/1",
            String::class.java
        )

        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
        assertThat(response.body).contains("\"weekNumber\":1")
    }

    @Test
    @Order(10)
    fun `GET athletes id dashboard summary - 200 returns summary`() {
        val response = rest.getForEntity(
            "/api/athletes/$createdAthleteId/dashboard/summary",
            String::class.java
        )

        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
        assertThat(response.body).contains("\"weeks\"")
    }

    @Test
    @Order(11)
    fun `GET athletes id plan-vs-actual - 200 returns comparison`() {
        val response = rest.getForEntity(
            "/api/athletes/$createdAthleteId/plan-vs-actual?startDate=2025-03-03&endDate=2025-03-09",
            String::class.java
        )

        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
        assertThat(response.body).contains("\"days\"")
    }

    @Test
    @Order(12)
    fun `DELETE athletes id training-plans planId - 204`() {
        val response = rest.exchange(
            "/api/athletes/$createdAthleteId/training-plans/$createdPlanId",
            HttpMethod.DELETE,
            null,
            Void::class.java
        )

        assertThat(response.statusCode).isEqualTo(HttpStatus.NO_CONTENT)
    }

    @Test
    @Order(13)
    fun `GET athletes id training-plan - 404 when no plan`() {
        val response = rest.getForEntity(
            "/api/athletes/$createdAthleteId/training-plan",
            Map::class.java
        )

        assertThat(response.statusCode).isEqualTo(HttpStatus.NOT_FOUND)
    }
}
