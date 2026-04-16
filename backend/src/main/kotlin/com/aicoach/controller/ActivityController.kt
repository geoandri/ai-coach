package com.aicoach.controller

import com.aicoach.domain.dto.ActivityDto
import com.aicoach.domain.dto.SyncResultDto
import com.aicoach.service.StravaActivityService
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/activities")
class ActivityController(
    private val activityService: StravaActivityService
) {
    @GetMapping("/sync")
    fun sync(): SyncResultDto = activityService.syncActivities()

    @GetMapping
    fun list(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int
    ): Page<ActivityDto> = activityService.getActivities(PageRequest.of(page, size))
}
