package com.aicoach.domain

import com.aicoach.domain.entity.StravaToken
import io.kotest.core.spec.style.DescribeSpec
import io.kotest.matchers.shouldBe
import java.time.Instant

class StravaTokenTest : DescribeSpec({

    fun makeToken(expiresAt: Long) = StravaToken(
        id = 1L,
        athleteId = 100L,
        accessToken = "access",
        refreshToken = "refresh",
        expiresAt = expiresAt
    )

    describe("isExpired") {
        it("returns true when expiresAt is less than now + 5 minutes") {
            val pastExpiry = Instant.now().epochSecond - 1L // already expired
            val token = makeToken(pastExpiry)

            token.isExpired() shouldBe true
        }

        it("returns false when expiresAt is well beyond now + 5 minutes") {
            val futureExpiry = Instant.now().epochSecond + 600L // 10 minutes from now
            val token = makeToken(futureExpiry)

            token.isExpired() shouldBe false
        }

        it("returns true at the exact boundary (within 300 seconds of expiry)") {
            // 299 seconds from now — within the 300s buffer → should be expired
            val nearExpiry = Instant.now().epochSecond + 299L
            val token = makeToken(nearExpiry)

            token.isExpired() shouldBe true
        }

        it("returns false when expiresAt is exactly 301 seconds from now") {
            val safeExpiry = Instant.now().epochSecond + 301L
            val token = makeToken(safeExpiry)

            token.isExpired() shouldBe false
        }
    }
})
