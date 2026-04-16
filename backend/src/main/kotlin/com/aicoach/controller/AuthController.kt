package com.aicoach.controller

import com.aicoach.repository.AthleteRepository
import com.aicoach.repository.StravaTokenRepository
import com.aicoach.service.AthleteService
import com.aicoach.service.StravaOAuthService
import org.springframework.beans.factory.annotation.Value
import org.springframework.web.bind.annotation.*
import org.springframework.web.servlet.view.RedirectView

@RestController
@RequestMapping("/api/auth/strava")
class AuthController(
    private val oauthService: StravaOAuthService,
    private val athleteService: AthleteService,
    private val athleteRepository: AthleteRepository,
    private val tokenRepository: StravaTokenRepository,
    @Value("\${app.frontend-base-url}") private val frontendBaseUrl: String
) {
    @GetMapping
    fun redirectToStrava(): RedirectView {
        val authUrl = oauthService.buildAuthorizationUrl()
        return RedirectView(authUrl)
    }

    @GetMapping("/callback")
    fun handleCallback(
        @RequestParam code: String?,
        @RequestParam error: String?,
        @RequestParam(required = false) state: String?
    ): RedirectView {
        val internalAthleteId = state?.toLongOrNull()
        val baseRedirect = if (internalAthleteId != null) {
            "$frontendBaseUrl/athletes/$internalAthleteId"
        } else {
            "$frontendBaseUrl/settings"
        }

        if (error != null || code == null) {
            return RedirectView("$baseRedirect?error=strava_denied")
        }
        return try {
            val token = oauthService.exchangeCodeForToken(code)
            if (internalAthleteId != null) {
                athleteService.linkStravaAthlete(internalAthleteId, token.athleteId)
                val athlete = athleteRepository.findById(internalAthleteId).orElse(null)
                if (athlete != null) {
                    token.internalAthlete = athlete
                    tokenRepository.save(token)
                }
            }
            RedirectView("$baseRedirect?connected=true")
        } catch (e: Exception) {
            RedirectView("$baseRedirect?error=token_exchange_failed")
        }
    }

    @PostMapping("/refresh")
    fun refreshToken(): Map<String, Any> {
        val token = oauthService.getValidToken()
            ?: return mapOf("success" to false, "message" to "No token found")
        return mapOf(
            "success" to true,
            "athleteId" to token.athleteId,
            "expiresAt" to token.expiresAt
        )
    }

    @GetMapping("/status")
    fun status(): Map<String, Any> {
        val hasToken = oauthService.hasToken()
        return if (hasToken) {
            val token = oauthService.getValidToken()
            mapOf(
                "connected" to true,
                "athleteId" to (token?.athleteId ?: 0),
                "expired" to (token == null)
            )
        } else {
            mapOf("connected" to false)
        }
    }
}
