package com.aicoach.controller

import com.aicoach.domain.dto.DashboardSummaryDto
import com.aicoach.service.DashboardService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/dashboard")
class DashboardController(
    private val dashboardService: DashboardService
) {
    @GetMapping("/summary")
    fun summary(): DashboardSummaryDto = dashboardService.getSummary()
}
