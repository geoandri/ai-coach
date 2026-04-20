package com.aicoach.service

import com.aicoach.domain.dto.CreateAthleteRequest
import com.aicoach.domain.dto.UpdateAthleteRequest
import com.aicoach.domain.entity.Athlete
import com.aicoach.domain.entity.FitnessLevel
import com.aicoach.domain.entity.GoalType
import com.aicoach.repository.AthleteRepository
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.DescribeSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.springframework.web.server.ResponseStatusException
import java.util.Optional

class AthleteServiceTest : DescribeSpec({

    val athleteRepository = mockk<AthleteRepository>()
    val service = AthleteService(athleteRepository)

    fun makeAthlete(id: Long = 1L, name: String = "Alice") = Athlete(
        id = id,
        name = name,
        email = "alice@example.com",
        fitnessLevel = FitnessLevel.INTERMEDIATE,
        goalType = GoalType.TARGET_TIME,
        currentWeeklyKm = 60.0
    )

    describe("listAthletes") {
        it("returns mapped DTOs for all athletes") {
            val athletes = listOf(makeAthlete(1L, "Alice"), makeAthlete(2L, "Bob"))
            every { athleteRepository.findAll() } returns athletes

            val result = service.listAthletes()

            result.size shouldBe 2
            result[0].name shouldBe "Alice"
            result[1].name shouldBe "Bob"
        }
    }

    describe("getAthlete") {
        it("returns DTO when athlete is found") {
            val athlete = makeAthlete()
            every { athleteRepository.findById(1L) } returns Optional.of(athlete)

            val result = service.getAthlete(1L)

            result.id shouldBe 1L
            result.name shouldBe "Alice"
            result.fitnessLevel shouldBe FitnessLevel.INTERMEDIATE
        }

        it("throws 404 when athlete not found") {
            every { athleteRepository.findById(99L) } returns Optional.empty()

            val ex = shouldThrow<ResponseStatusException> { service.getAthlete(99L) }
            ex.statusCode.value() shouldBe 404
        }
    }

    describe("createAthlete") {
        it("saves entity and returns DTO with all fields set") {
            val request = CreateAthleteRequest(
                name = "Bob",
                email = "bob@example.com",
                fitnessLevel = FitnessLevel.ADVANCED,
                goalType = GoalType.PODIUM,
                currentWeeklyKm = 80.0,
                trainingDaysPerWeek = 5
            )
            val saved = Athlete(
                id = 2L,
                name = request.name,
                email = request.email,
                fitnessLevel = request.fitnessLevel,
                goalType = request.goalType,
                currentWeeklyKm = request.currentWeeklyKm,
                trainingDaysPerWeek = request.trainingDaysPerWeek
            )
            every { athleteRepository.save(any()) } returns saved

            val result = service.createAthlete(request)

            result.id shouldBe 2L
            result.name shouldBe "Bob"
            result.email shouldBe "bob@example.com"
            result.fitnessLevel shouldBe FitnessLevel.ADVANCED
            result.goalType shouldBe GoalType.PODIUM
            verify { athleteRepository.save(any()) }
        }
    }

    describe("updateAthlete") {
        it("applies partial update — only non-null fields") {
            val athlete = makeAthlete()
            every { athleteRepository.findById(1L) } returns Optional.of(athlete)
            every { athleteRepository.save(athlete) } returns athlete

            val request = UpdateAthleteRequest(name = "Alice Updated", currentWeeklyKm = 70.0)
            service.updateAthlete(1L, request)

            athlete.name shouldBe "Alice Updated"
            athlete.currentWeeklyKm shouldBe 70.0
            athlete.email shouldBe "alice@example.com" // unchanged
        }

        it("throws 404 when athlete not found") {
            every { athleteRepository.findById(99L) } returns Optional.empty()

            val ex = shouldThrow<ResponseStatusException> {
                service.updateAthlete(99L, UpdateAthleteRequest(name = "X"))
            }
            ex.statusCode.value() shouldBe 404
        }
    }

    describe("addCoachNote") {
        it("appends note with newline when existing notes present") {
            val athlete = makeAthlete().also { it.coachNotes = "Existing note" }
            every { athleteRepository.findById(1L) } returns Optional.of(athlete)
            every { athleteRepository.save(athlete) } returns athlete

            service.addCoachNote(1L, "New note")

            athlete.coachNotes shouldBe "Existing note\nNew note"
        }

        it("sets note directly when coach notes are blank") {
            val athlete = makeAthlete().also { it.coachNotes = null }
            every { athleteRepository.findById(1L) } returns Optional.of(athlete)
            every { athleteRepository.save(athlete) } returns athlete

            service.addCoachNote(1L, "First note")

            athlete.coachNotes shouldBe "First note"
        }
    }

    describe("linkStravaAthlete") {
        it("sets stravaAthleteId and stravaEnabled = true") {
            val athlete = makeAthlete()
            every { athleteRepository.findById(1L) } returns Optional.of(athlete)
            every { athleteRepository.save(athlete) } returns athlete

            service.linkStravaAthlete(1L, 42L)

            athlete.stravaAthleteId shouldBe 42L
            athlete.stravaEnabled shouldBe true
        }

        it("throws 404 when athlete not found") {
            every { athleteRepository.findById(99L) } returns Optional.empty()

            val ex = shouldThrow<ResponseStatusException> {
                service.linkStravaAthlete(99L, 42L)
            }
            ex.statusCode.value() shouldBe 404
        }
    }
})
