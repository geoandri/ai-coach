package com.aicoach.config

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.context.annotation.Configuration

@Configuration
@EnableConfigurationProperties(StravaConfig.StravaProperties::class)
class StravaConfig {

    @ConfigurationProperties(prefix = "strava")
    data class StravaProperties(
        val clientId: String = "",
        val clientSecret: String = "",
        val redirectUri: String = "http://localhost:8080/api/auth/strava/callback",
        val authUrl: String = "https://www.strava.com/oauth/authorize",
        val tokenUrl: String = "https://www.strava.com/oauth/token",
        val apiBaseUrl: String = "https://www.strava.com/api/v3"
    )
}
