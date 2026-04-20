package com.aicoach

import org.springframework.test.context.DynamicPropertyRegistry
import org.springframework.test.context.DynamicPropertySource
import org.testcontainers.containers.PostgreSQLContainer
import org.testcontainers.junit.jupiter.Testcontainers

@Testcontainers
abstract class PostgresTestContainerConfig {
    companion object {
        // Single shared container for all tests in the suite — started once, never stopped
        // until the JVM exits. Using a JVM-level singleton avoids multiple startups when
        // both @DataJpaTest and @SpringBootTest contexts load in the same Gradle test run.
        val postgres: PostgreSQLContainer<Nothing> by lazy {
            PostgreSQLContainer<Nothing>("postgres:16-alpine").apply {
                withDatabaseName("ai_coach_test")
                withUsername("test_user")
                withPassword("test_pass")
                start()
            }
        }

        @JvmStatic
        @DynamicPropertySource
        fun configureProperties(registry: DynamicPropertyRegistry) {
            registry.add("spring.datasource.url", postgres::getJdbcUrl)
            registry.add("spring.datasource.username", postgres::getUsername)
            registry.add("spring.datasource.password", postgres::getPassword)
        }
    }
}
