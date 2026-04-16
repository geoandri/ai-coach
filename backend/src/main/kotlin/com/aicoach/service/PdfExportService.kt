package com.aicoach.service

import com.aicoach.domain.entity.TrainingPlan
import com.aicoach.domain.entity.WeeklyBlock
import com.aicoach.domain.entity.DailyWorkout
import com.aicoach.repository.TrainingPlanRepository
import com.aicoach.repository.WeeklyBlockRepository
import com.aicoach.repository.DailyWorkoutRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import org.xhtmlrenderer.pdf.ITextRenderer
import java.io.ByteArrayOutputStream

@Service
class PdfExportService(
    private val planRepository: TrainingPlanRepository,
    private val weeklyBlockRepository: WeeklyBlockRepository,
    private val dailyWorkoutRepository: DailyWorkoutRepository
) {
    fun generateQuickReferencePdf(athleteId: Long, planId: Long): ByteArray {
        val plan = planRepository.findByIdAndAthleteId(planId, athleteId).orElseThrow {
            ResponseStatusException(HttpStatus.NOT_FOUND, "Plan not found for athlete")
        }
        val weeks = weeklyBlockRepository.findByTrainingPlanIdOrderByWeekNumberAsc(plan.id)
        val html = buildQuickReferenceHtml(plan, weeks.map { week ->
            Pair(week, dailyWorkoutRepository.findByWeeklyBlockIdOrderByWorkoutDateAsc(week.id))
        })
        return renderHtmlToPdf(html)
    }

    fun generateFullPdf(athleteId: Long, planId: Long): ByteArray {
        val plan = planRepository.findByIdAndAthleteId(planId, athleteId).orElseThrow {
            ResponseStatusException(HttpStatus.NOT_FOUND, "Plan not found for athlete")
        }
        val weeks = weeklyBlockRepository.findByTrainingPlanIdOrderByWeekNumberAsc(plan.id)
        val html = buildFullPlanHtml(plan, weeks.map { week ->
            Pair(week, dailyWorkoutRepository.findByWeeklyBlockIdOrderByWorkoutDateAsc(week.id))
        })
        return renderHtmlToPdf(html)
    }

    private fun renderHtmlToPdf(html: String): ByteArray {
        val baos = ByteArrayOutputStream()
        val renderer = ITextRenderer()
        renderer.setDocumentFromString(html)
        renderer.layout()
        renderer.createPDF(baos)
        return baos.toByteArray()
    }

    private fun buildQuickReferenceHtml(
        plan: TrainingPlan,
        weekData: List<Pair<WeeklyBlock, List<DailyWorkout>>>
    ): String {
        val sb = StringBuilder()
        sb.append("""<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
<title>${escapeHtml(plan.name)}</title>
<style>
  body { font-family: Arial, sans-serif; font-size: 9pt; margin: 20px; color: #333; }
  h1 { font-size: 14pt; color: #e65100; margin-bottom: 4px; }
  h2 { font-size: 10pt; color: #555; margin-bottom: 12px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
  th { background: #e65100; color: white; padding: 6px 4px; text-align: left; font-size: 8pt; }
  td { padding: 4px; border-bottom: 1px solid #eee; font-size: 8pt; vertical-align: top; }
  tr:nth-child(even) td { background: #f9f9f9; }
  .phase { color: #e65100; font-weight: bold; }
  .km { text-align: right; }
</style>
</head>
<body>
<h1>${escapeHtml(plan.name)}</h1>
<h2>${escapeHtml(plan.raceName ?: "")} ${if (plan.raceDate != null) "&#8212; ${plan.raceDate}" else ""}</h2>
<table>
  <thead>
    <tr>
      <th>Week</th>
      <th>Phase</th>
      <th>Dates</th>
      <th>Planned km</th>
      <th>Vert m</th>
      <th>Notes</th>
    </tr>
  </thead>
  <tbody>
""")
        for ((week, _) in weekData) {
            sb.append("""
    <tr>
      <td>${week.weekNumber}</td>
      <td class="phase">${escapeHtml(week.phase ?: "")}</td>
      <td>${week.startDate} &#8211; ${week.endDate}</td>
      <td class="km">${week.plannedKm ?: "&#8212;"}</td>
      <td class="km">${week.plannedVertM ?: "&#8212;"}</td>
      <td>${escapeHtml(week.notes ?: "")}</td>
    </tr>
""")
        }
        sb.append("""
  </tbody>
</table>
</body>
</html>
""")
        return sb.toString()
    }

    private fun buildFullPlanHtml(
        plan: TrainingPlan,
        weekData: List<Pair<WeeklyBlock, List<DailyWorkout>>>
    ): String {
        val sb = StringBuilder()
        sb.append("""<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
<title>${escapeHtml(plan.name)}</title>
<style>
  body { font-family: Arial, sans-serif; font-size: 9pt; margin: 20px; color: #333; }
  h1 { font-size: 16pt; color: #e65100; }
  h2 { font-size: 12pt; color: #e65100; margin-top: 20px; border-bottom: 2px solid #e65100; padding-bottom: 4px; }
  .week-meta { color: #666; font-size: 8pt; margin-bottom: 8px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
  th { background: #555; color: white; padding: 5px 4px; text-align: left; font-size: 8pt; }
  td { padding: 4px; border-bottom: 1px solid #eee; font-size: 8pt; vertical-align: top; }
  tr:nth-child(even) td { background: #f9f9f9; }
  .rest { color: #999; font-style: italic; }
  .race { color: #e65100; font-weight: bold; }
  .km { text-align: right; font-weight: bold; }
  .page-break { page-break-before: always; }
</style>
</head>
<body>
<h1>${escapeHtml(plan.name)}</h1>
<p>${escapeHtml(plan.raceName ?: "")} ${if (plan.raceDate != null) "&#8212; ${plan.raceDate}" else ""}</p>
""")
        for ((idx, pair) in weekData.withIndex()) {
            val (week, workouts) = pair
            if (idx > 0 && idx % 4 == 0) sb.append("""<div class="page-break"/>""")
            sb.append("""
<h2>Week ${week.weekNumber} &#8212; ${escapeHtml(week.phase ?: "")}</h2>
<div class="week-meta">${week.startDate} &#8211; ${week.endDate} | Planned: ${week.plannedKm ?: 0} km / ${week.plannedVertM ?: 0}m vert</div>
${if (week.notes != null) "<p>${escapeHtml(week.notes)}</p>" else ""}
<table>
  <thead>
    <tr><th>Day</th><th>Date</th><th>Type</th><th>Description</th><th>km</th><th>Vert</th></tr>
  </thead>
  <tbody>
""")
            for (workout in workouts) {
                val rowClass = when {
                    workout.isRaceDay -> "race"
                    workout.isRestDay -> "rest"
                    else -> ""
                }
                sb.append("""
    <tr class="$rowClass">
      <td>${escapeHtml(workout.dayOfWeek ?: "")}</td>
      <td>${workout.workoutDate}</td>
      <td>${escapeHtml(workout.workoutType ?: "")}</td>
      <td>${escapeHtml(workout.description ?: "")}</td>
      <td class="km">${if ((workout.plannedKm ?: 0.0) > 0) workout.plannedKm else "&#8212;"}</td>
      <td class="km">${if ((workout.plannedVertM ?: 0) > 0) workout.plannedVertM else "&#8212;"}</td>
    </tr>
""")
            }
            sb.append("  </tbody>\n</table>\n")
        }
        sb.append("</body>\n</html>")
        return sb.toString()
    }

    private fun escapeHtml(s: String): String = s
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace("\"", "&quot;")
        .replace("'", "&#39;")
}
