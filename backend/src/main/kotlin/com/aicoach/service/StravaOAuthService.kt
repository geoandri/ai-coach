package com.aicoach.service

import com.aicoach.config.StravaConfig
import com.aicoach.domain.entity.StravaToken
import com.aicoach.repository.StravaTokenRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.reactive.function.BodyInserters
import java.time.Instant

@Service
class StravaOAuthService(
    private val stravaProps: StravaConfig.StravaProperties,
    private val tokenRepository: StravaTokenRepository,
    private val webClientBuilder: WebClient.Builder
) {
    private val log = LoggerFactory.getLogger(StravaOAuthService::class.java)

    fun buildAuthorizationUrl(): String {
        return "${stravaProps.authUrl}?" +
            "client_id=${stravaProps.clientId}" +
            "&redirect_uri=${stravaProps.redirectUri}" +
            "&response_type=code" +
            "&approval_prompt=auto" +
            "&scope=read,activity:read_all"
    }

    fun buildAuthorizationUrl(internalAthleteId: Long): String {
        return "${stravaProps.authUrl}?" +
            "client_id=${stravaProps.clientId}" +
            "&redirect_uri=${stravaProps.redirectUri}" +
            "&response_type=code" +
            "&approval_prompt=auto" +
            "&scope=read,activity:read_all" +
            "&state=$internalAthleteId"
    }

    @Transactional
    fun exchangeCodeForToken(code: String): StravaToken {
        val client = webClientBuilder.build()
        val response = client.post()
            .uri(stravaProps.tokenUrl)
            .body(BodyInserters.fromFormData("client_id", stravaProps.clientId)
                .with("client_secret", stravaProps.clientSecret)
                .with("code", code)
                .with("grant_type", "authorization_code"))
            .retrieve()
            .bodyToMono(Map::class.java)
            .block() ?: throw RuntimeException("No response from Strava token endpoint")

        return upsertToken(response)
    }

    @Transactional
    fun refreshToken(token: StravaToken): StravaToken {
        log.info("Refreshing Strava token for athlete ${token.athleteId}")
        val client = webClientBuilder.build()
        val response = client.post()
            .uri(stravaProps.tokenUrl)
            .body(BodyInserters.fromFormData("client_id", stravaProps.clientId)
                .with("client_secret", stravaProps.clientSecret)
                .with("refresh_token", token.refreshToken)
                .with("grant_type", "refresh_token"))
            .retrieve()
            .bodyToMono(Map::class.java)
            .block() ?: throw RuntimeException("No response from Strava refresh endpoint")

        token.accessToken = response["access_token"] as String
        token.refreshToken = (response["refresh_token"] as? String) ?: token.refreshToken
        token.expiresAt = (response["expires_at"] as Number).toLong()
        token.updatedAt = Instant.now()
        return tokenRepository.save(token)
    }

    fun getValidToken(): StravaToken? {
        val token = tokenRepository.findFirstByOrderByIdAsc().orElse(null) ?: return null
        return if (token.isExpired()) refreshToken(token) else token
    }

    fun hasToken(): Boolean = tokenRepository.findFirstByOrderByIdAsc().isPresent

    fun getValidTokenForAthlete(internalAthleteId: Long): StravaToken? {
        val token = tokenRepository.findByInternalAthleteId(internalAthleteId).orElse(null)
        if (token == null) {
            log.warn("getValidTokenForAthlete: no token row found for internalAthleteId=$internalAthleteId")
            // Log all tokens to help diagnose linkage issues
            val all = tokenRepository.findAll()
            all.forEach { t -> log.warn("  existing token: id=${t.id} stravaAthleteId=${t.athleteId} internalAthleteId=${t.internalAthlete?.id}") }
            return null
        }
        log.info("getValidTokenForAthlete: found token id=${token.id} stravaAthleteId=${token.athleteId} expired=${token.isExpired()}")
        return if (token.isExpired()) refreshToken(token) else token
    }

    fun hasTokenForAthlete(internalAthleteId: Long): Boolean =
        tokenRepository.findByInternalAthleteId(internalAthleteId).isPresent

    @Suppress("UNCHECKED_CAST")
    private fun upsertToken(response: Map<*, *>): StravaToken {
        val athlete = response["athlete"] as? Map<String, Any>
        val athleteId = (athlete?.get("id") as? Number)?.toLong()
            ?: throw RuntimeException("No athlete id in Strava response")

        val existing = tokenRepository.findByAthleteId(athleteId).orElse(null)
        val token = if (existing != null) {
            existing.accessToken = response["access_token"] as String
            existing.refreshToken = response["refresh_token"] as String
            existing.expiresAt = (response["expires_at"] as Number).toLong()
            existing.scope = response["scope"] as? String
            existing.internalAthlete = null  // cleared so the callback can re-link to the requesting athlete
            existing.updatedAt = Instant.now()
            existing
        } else {
            StravaToken(
                athleteId = athleteId,
                accessToken = response["access_token"] as String,
                refreshToken = response["refresh_token"] as String,
                expiresAt = (response["expires_at"] as Number).toLong(),
                scope = response["scope"] as? String
            )
        }
        return tokenRepository.save(token)
    }
}
