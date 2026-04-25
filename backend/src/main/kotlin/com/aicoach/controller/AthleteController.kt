package com.aicoach.controller

import com.aicoach.domain.dto.*
import com.aicoach.repository.AthleteRepository
import com.aicoach.service.*
import org.springframework.data.domain.PageRequest
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.LocalDate

@RestController
@RequestMapping("/api/athletes")
class AthleteController(
    private val athleteService: AthleteService,
    private val trainingPlanService: TrainingPlanService,
    private val planDiffService: PlanDiffService,
    private val pdfExportService: PdfExportService,
    private val stravaOAuthService: StravaOAuthService,
    private val stravaActivityService: StravaActivityService,
    private val dashboardService: DashboardService,
    private val athleteRepository: AthleteRepository
) {
    // ── CRUD ────────────────────────────────────────────────────────────────
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun createAthlete(@RequestBody request: CreateAthleteRequest): AthleteDto =
        athleteService.createAthlete(request)

    @GetMapping
    fun listAthletes(): List<AthleteDto> = athleteService.listAthletes()

    @GetMapping("/{id}")
    fun getAthlete(@PathVariable id: Long): AthleteDto = athleteService.getAthlete(id)

    @PutMapping("/{id}")
    fun updateAthlete(@PathVariable id: Long, @RequestBody request: UpdateAthleteRequest): AthleteDto =
        athleteService.updateAthlete(id, request)

    // ── Coach Notes ──────────────────────────────────────────────────────────
    @PostMapping("/{id}/coach-notes")
    fun addCoachNote(@PathVariable id: Long, @RequestBody request: AddCoachNoteRequest): AthleteDto =
        athleteService.addCoachNote(id, request.note)

    // ── Training Plan ────────────────────────────────────────────────────────
    @PostMapping("/{id}/training-plan")
    @ResponseStatus(HttpStatus.CREATED)
    fun createPlan(@PathVariable id: Long, @RequestBody request: CreateTrainingPlanRequest): TrainingPlanDto =
        trainingPlanService.createPlanForAthlete(id, request, athleteRepository)

    @GetMapping("/{id}/training-plan")
    fun getPlan(@PathVariable id: Long): ResponseEntity<TrainingPlanDto> {
        val plan = trainingPlanService.getPlanForAthlete(id)
            ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(plan)
    }

    @GetMapping("/{id}/training-plan/summary")
    fun getPlanSummary(@PathVariable id: Long): ResponseEntity<TrainingPlanSummaryDto> {
        val plan = trainingPlanService.getPlanSummaryForAthlete(id)
            ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(plan)
    }

    @DeleteMapping("/{id}/training-plans/{planId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deletePlan(@PathVariable id: Long, @PathVariable planId: Long) =
        trainingPlanService.deletePlanForAthlete(id, planId)

    @GetMapping("/{id}/training-plan/week/{weekNumber}")
    fun getWeek(@PathVariable id: Long, @PathVariable weekNumber: Int): ResponseEntity<WeeklyBlockDto> {
        val week = trainingPlanService.getWeekForAthlete(id, weekNumber)
            ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(week)
    }

    @PatchMapping("/{id}/training-plan/weeks/{weekNumber}")
    fun updateWeek(
        @PathVariable id: Long,
        @PathVariable weekNumber: Int,
        @RequestBody request: UpdateWeekRequest
    ): WeeklyBlockDto = trainingPlanService.updateWeekForAthlete(id, weekNumber, request)

    // ── PDF Export ───────────────────────────────────────────────────────────
    @GetMapping("/{id}/training-plans/{planId}/export/pdf/quick")
    fun exportQuickPdf(@PathVariable id: Long, @PathVariable planId: Long): ResponseEntity<ByteArray> {
        val pdf = pdfExportService.generateQuickReferencePdf(id, planId)
        return ResponseEntity.ok()
            .contentType(MediaType.APPLICATION_PDF)
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"training-plan-quick.pdf\"")
            .body(pdf)
    }

    @GetMapping("/{id}/training-plans/{planId}/export/pdf/full")
    fun exportFullPdf(@PathVariable id: Long, @PathVariable planId: Long): ResponseEntity<ByteArray> {
        val pdf = pdfExportService.generateFullPdf(id, planId)
        return ResponseEntity.ok()
            .contentType(MediaType.APPLICATION_PDF)
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"training-plan-full.pdf\"")
            .body(pdf)
    }

    // ── Plan vs Actual ───────────────────────────────────────────────────────
    @GetMapping("/{id}/plan-vs-actual")
    fun planVsActual(
        @PathVariable id: Long,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) startDate: LocalDate,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) endDate: LocalDate
    ): PlanVsActualDto = planDiffService.getPlanVsActual(id, startDate, endDate)

    // ── Strava ───────────────────────────────────────────────────────────────
    @GetMapping("/{id}/auth/strava")
    fun stravaAuth(@PathVariable id: Long): ResponseEntity<Void> {
        val url = stravaOAuthService.buildAuthorizationUrl(id)
        return ResponseEntity.status(HttpStatus.FOUND)
            .header(HttpHeaders.LOCATION, url)
            .build()
    }

    @GetMapping("/{id}/auth/strava/status")
    fun stravaStatus(@PathVariable id: Long): Map<String, Any> {
        val hasToken = stravaOAuthService.hasTokenForAthlete(id)
        return if (hasToken) {
            val token = stravaOAuthService.getValidTokenForAthlete(id)
            mapOf("connected" to true, "stravaAthleteId" to (token?.athleteId ?: 0))
        } else {
            mapOf("connected" to false)
        }
    }

    @GetMapping("/{id}/activities/sync")
    fun syncActivities(
        @PathVariable id: Long,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) afterDate: LocalDate?
    ): SyncResultDto = stravaActivityService.syncActivitiesForAthlete(id, afterDate)

    @GetMapping("/{id}/activities")
    fun listActivities(
        @PathVariable id: Long,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int
    ) = stravaActivityService.getActivitiesForAthlete(id, PageRequest.of(page, size))

    // ── Dashboard ────────────────────────────────────────────────────────────
    @GetMapping("/{id}/dashboard/summary")
    fun dashboardSummary(@PathVariable id: Long) = dashboardService.getSummaryForAthlete(id)
}
