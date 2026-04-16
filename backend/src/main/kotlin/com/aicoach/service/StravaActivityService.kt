package com.aicoach.service

import com.aicoach.config.StravaConfig
import com.aicoach.domain.dto.ActivityDto
import com.aicoach.domain.dto.SyncResultDto
import com.aicoach.domain.entity.StravaActivity
import com.aicoach.repository.AthleteRepository
import com.aicoach.repository.StravaActivityRepository
import org.slf4j.LoggerFactory
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.reactive.function.client.WebClient
import java.math.BigDecimal
import java.time.Instant
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.ZoneOffset
import java.time.format.DateTimeFormatter

@Service
class StravaActivityService(
    private val stravaProps: StravaConfig.StravaProperties,
    private val oauthService: StravaOAuthService,
    private val activityRepository: StravaActivityRepository,
    private val athleteRepository: AthleteRepository,
    private val webClientBuilder: WebClient.Builder
) {
    private val log = LoggerFactory.getLogger(StravaActivityService::class.java)
    private val dtFormatter = DateTimeFormatter.ISO_DATE_TIME

    @Transactional
    fun syncActivities(): SyncResultDto {
        val token = oauthService.getValidToken()
            ?: return SyncResultDto(0, "No Strava token found. Please connect Strava first.")

        val client = webClientBuilder
            .baseUrl(stravaProps.apiBaseUrl)
            .defaultHeader("Authorization", "Bearer ${token.accessToken}")
            .build()

        var page = 1
        var totalSynced = 0

        while (true) {
            @Suppress("UNCHECKED_CAST")
            val activities = client.get()
                .uri("/athlete/activities?per_page=100&page=$page")
                .retrieve()
                .bodyToMono(List::class.java)
                .block() as? List<Map<String, Any>> ?: break

            if (activities.isEmpty()) break

            for (activity in activities) {
                val sportType = activity["sport_type"] as? String ?: activity["type"] as? String ?: ""
                if (sportType !in listOf("Run", "TrailRun")) continue
                val stravaId = (activity["id"] as Number).toLong()
                if (!activityRepository.existsByStravaId(stravaId)) {
                    val saved = saveActivity(activity, token.athleteId)
                    if (saved != null) totalSynced++
                }
            }

            if (activities.size < 100) break
            page++
        }

        log.info("Synced $totalSynced new activities from Strava")
        return SyncResultDto(totalSynced, "Successfully synced $totalSynced new activities")
    }

    @Transactional
    fun syncActivitiesForAthlete(internalAthleteId: Long, afterDate: LocalDate? = null): SyncResultDto {
        val token = oauthService.getValidTokenForAthlete(internalAthleteId)
        if (token == null) {
            log.warn("sync: no token found for internal athlete $internalAthleteId")
            return SyncResultDto(0, "No Strava token found for athlete $internalAthleteId. Please connect Strava first.")
        }
        log.info("sync: found token for internal athlete $internalAthleteId (stravaAthleteId=${token.athleteId}, expiresAt=${token.expiresAt}, internalAthlete=${token.internalAthlete?.id})")

        val client = webClientBuilder
            .baseUrl(stravaProps.apiBaseUrl)
            .defaultHeader("Authorization", "Bearer ${token.accessToken}")
            .build()

        val afterEpoch: Long? = afterDate?.atStartOfDay(ZoneOffset.UTC)?.toEpochSecond()
        log.info("sync: afterDate=$afterDate afterEpoch=$afterEpoch")

        var page = 1
        var totalSynced = 0
        var totalFetched = 0
        var totalSkippedType = 0
        var totalAlreadyExists = 0

        while (true) {
            val uri = buildString {
                append("/athlete/activities?per_page=100&page=$page")
                if (afterEpoch != null) append("&after=$afterEpoch")
            }
            log.info("sync: fetching page $page — $uri")

            val rawResponse = client.get()
                .uri(uri)
                .retrieve()
                .bodyToMono(Any::class.java)
                .block()

            log.info("sync: page $page raw response type=${rawResponse?.javaClass?.simpleName}")

            @Suppress("UNCHECKED_CAST")
            val activities = rawResponse as? List<Map<String, Any>>
            if (activities == null) {
                log.warn("sync: page $page did not return a list — response=$rawResponse")
                break
            }

            log.info("sync: page $page returned ${activities.size} activities")
            if (activities.isEmpty()) break
            totalFetched += activities.size

            for (activity in activities) {
                val sportType = activity["sport_type"] as? String ?: activity["type"] as? String ?: ""
                if (sportType !in listOf("Run", "TrailRun")) {
                    totalSkippedType++
                    continue
                }
                val stravaId = (activity["id"] as Number).toLong()
                val existing = activityRepository.findByStravaId(stravaId).orElse(null)
                if (existing == null) {
                    val saved = saveActivityForInternalAthlete(activity, token.athleteId, internalAthleteId)
                    if (saved != null) totalSynced++
                } else if (existing.internalAthlete?.id != internalAthleteId) {
                    existing.internalAthlete = athleteRepository.findById(internalAthleteId).orElse(null)
                    activityRepository.save(existing)
                    totalSynced++
                } else {
                    totalAlreadyExists++
                }
            }

            if (activities.size < 100) break
            page++
        }

        log.info("sync complete: fetched=$totalFetched skippedType=$totalSkippedType alreadyExists=$totalAlreadyExists newlySaved=$totalSynced")
        return SyncResultDto(totalSynced, "Successfully synced $totalSynced new activities")
    }

    fun getActivities(pageable: Pageable): Page<ActivityDto> {
        return activityRepository
            .findBySportTypeInOrderByActivityDateDesc(
                listOf("Run", "TrailRun", "VirtualRun"),
                pageable
            )
            .map { it.toDto() }
    }

    fun getActivitiesForAthlete(internalAthleteId: Long, pageable: Pageable): Page<ActivityDto> {
        return activityRepository
            .findByInternalAthleteIdAndSportTypeInOrderByActivityDateDesc(
                internalAthleteId,
                listOf("Run", "TrailRun", "VirtualRun"),
                pageable
            )
            .map { it.toDto() }
    }

    private fun saveActivity(data: Map<String, Any>, athleteId: Long): StravaActivity? {
        return try {
            val sportType = data["sport_type"] as? String ?: data["type"] as? String ?: "Run"
            val startDateStr = data["start_date_local"] as? String ?: data["start_date"] as? String ?: return null
            val startDt = LocalDateTime.parse(startDateStr.replace("Z", ""), dtFormatter)

            val activity = StravaActivity(
                stravaId = (data["id"] as Number).toLong(),
                athleteId = athleteId,
                name = data["name"] as? String,
                sportType = sportType,
                activityDate = startDt.toLocalDate(),
                startDatetime = startDt,
                distanceM = (data["distance"] as? Number)?.let { BigDecimal(it.toString()) },
                movingTimeS = (data["moving_time"] as? Number)?.toInt(),
                elapsedTimeS = (data["elapsed_time"] as? Number)?.toInt(),
                totalElevationM = (data["total_elevation_gain"] as? Number)?.let { BigDecimal(it.toString()) },
                averageSpeed = (data["average_speed"] as? Number)?.let { BigDecimal(it.toString()) },
                maxSpeed = (data["max_speed"] as? Number)?.let { BigDecimal(it.toString()) },
                averageHeartrate = (data["average_heartrate"] as? Number)?.let { BigDecimal(it.toString()) },
                maxHeartrate = (data["max_heartrate"] as? Number)?.let { BigDecimal(it.toString()) },
                trainer = data["trainer"] as? Boolean ?: false,
                manual = data["manual"] as? Boolean ?: false
            )
            activityRepository.save(activity)
        } catch (e: Exception) {
            log.warn("Failed to save activity ${data["id"]}: ${e.message}")
            null
        }
    }

    private fun saveActivityForInternalAthlete(
        data: Map<String, Any>,
        stravaAthleteId: Long,
        internalAthleteId: Long
    ): StravaActivity? {
        return try {
            val sportType = data["sport_type"] as? String ?: data["type"] as? String ?: "Run"
            val startDateStr = data["start_date_local"] as? String ?: data["start_date"] as? String ?: return null
            val startDt = LocalDateTime.parse(startDateStr.replace("Z", ""), dtFormatter)

            val activity = StravaActivity(
                stravaId = (data["id"] as Number).toLong(),
                athleteId = stravaAthleteId,
                name = data["name"] as? String,
                sportType = sportType,
                activityDate = startDt.toLocalDate(),
                startDatetime = startDt,
                distanceM = (data["distance"] as? Number)?.let { BigDecimal(it.toString()) },
                movingTimeS = (data["moving_time"] as? Number)?.toInt(),
                elapsedTimeS = (data["elapsed_time"] as? Number)?.toInt(),
                totalElevationM = (data["total_elevation_gain"] as? Number)?.let { BigDecimal(it.toString()) },
                averageSpeed = (data["average_speed"] as? Number)?.let { BigDecimal(it.toString()) },
                maxSpeed = (data["max_speed"] as? Number)?.let { BigDecimal(it.toString()) },
                averageHeartrate = (data["average_heartrate"] as? Number)?.let { BigDecimal(it.toString()) },
                maxHeartrate = (data["max_heartrate"] as? Number)?.let { BigDecimal(it.toString()) },
                trainer = data["trainer"] as? Boolean ?: false,
                manual = data["manual"] as? Boolean ?: false
            )
            activity.internalAthlete = athleteRepository.findById(internalAthleteId).orElse(null)
            activityRepository.save(activity)
        } catch (e: Exception) {
            log.warn("Failed to save activity ${data["id"]}: ${e.message}")
            null
        }
    }

    private fun StravaActivity.toDto() = ActivityDto(
        id = id,
        stravaId = stravaId,
        name = name,
        sportType = sportType,
        activityDate = activityDate,
        startDatetime = startDatetime,
        distanceKm = distanceKm,
        movingTimeS = movingTimeS,
        totalElevationM = totalElevationM,
        averageHeartrate = averageHeartrate
    )
}
