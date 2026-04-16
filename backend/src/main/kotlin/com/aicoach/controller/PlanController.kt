package com.aicoach.controller

import com.aicoach.domain.dto.TrainingPlanDto
import com.aicoach.domain.dto.WeeklyBlockDto
import com.aicoach.service.TrainingPlanService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/plan")
class PlanController(
    private val planService: TrainingPlanService
) {
    @GetMapping
    fun getPlan(): ResponseEntity<TrainingPlanDto> {
        val plan = planService.getFullPlan()
            ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(plan)
    }

    @GetMapping("/week/{n}")
    fun getWeek(@PathVariable n: Int): ResponseEntity<WeeklyBlockDto> {
        val week = planService.getWeek(n)
            ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(week)
    }
}
