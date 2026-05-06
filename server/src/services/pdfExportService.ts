import PdfPrinter from 'pdfmake'
import { queryRows, queryOne } from '../db/client.js'
import type { TDocumentDefinitions, TableCell, Content } from 'pdfmake/interfaces.js'

const fonts = {
  Helvetica: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique',
  },
}

function getPhaseColor(phase: string | null): string {
  if (!phase) return '#ffffff'
  const p = phase.toLowerCase()
  if (p.includes('base')) return '#e8f5e9'
  if (p.includes('build')) return '#e3f2fd'
  if (p.includes('peak')) return '#fff3e0'
  if (p.includes('taper')) return '#fce4ec'
  if (p.includes('race')) return '#ffebee'
  if (p.includes('recovery')) return '#f3e5f5'
  if (p.includes('evrytania')) return '#fff9c4'
  return '#f5f5f5'
}

export function generateQuickReferencePdf(athleteId: number, planId: number): Promise<Buffer> | null {
  const plan = queryOne(
    'SELECT * FROM training_plans WHERE id = ? AND athlete_id = ?',
    [planId, athleteId]
  )
  if (!plan) return null

  const weeks = queryRows(
    'SELECT * FROM weekly_blocks WHERE training_plan_id = ? ORDER BY week_number',
    [plan.id as number]
  )

  const printer = new PdfPrinter(fonts)

  const tableBody: TableCell[][] = [
    [
      { text: 'Week', style: 'tableHeader', fillColor: '#e65100', color: 'white' },
      { text: 'Phase', style: 'tableHeader', fillColor: '#e65100', color: 'white' },
      { text: 'Dates', style: 'tableHeader', fillColor: '#e65100', color: 'white' },
      { text: 'Planned km', style: 'tableHeader', fillColor: '#e65100', color: 'white' },
      { text: 'Vert m', style: 'tableHeader', fillColor: '#e65100', color: 'white' },
      { text: 'Notes', style: 'tableHeader', fillColor: '#e65100', color: 'white' },
    ],
  ]

  for (const week of weeks) {
    const phase = (week.phase as string | null) ?? null
    const fillColor = getPhaseColor(phase)
    const plannedKm = week.planned_km as number | null
    const plannedVertM = week.planned_vert_m as number | null
    tableBody.push([
      { text: String(week.week_number), fillColor },
      { text: phase ?? '', fillColor, color: '#e65100', bold: true },
      { text: `${week.start_date} – ${week.end_date}`, fillColor },
      { text: plannedKm != null ? String(plannedKm) : '—', fillColor, alignment: 'right' },
      { text: plannedVertM != null ? String(plannedVertM) : '—', fillColor, alignment: 'right' },
      { text: (week.notes as string | null) ?? '', fillColor },
    ])
  }

  const raceName = plan.race_name as string | null
  const raceDate = plan.race_date as string | null
  const raceInfo = raceName ? `${raceName}${raceDate ? ` — ${raceDate}` : ''}` : ''

  const docDef: TDocumentDefinitions = {
    defaultStyle: { font: 'Helvetica', fontSize: 8 },
    content: [
      { text: plan.name as string, style: 'header' },
      { text: raceInfo, style: 'subheader' },
      {
        table: {
          headerRows: 1,
          widths: ['auto', 'auto', 'auto', 'auto', 'auto', '*'],
          body: tableBody,
        },
        layout: 'lightHorizontalLines',
      },
    ],
    styles: {
      header: { fontSize: 14, bold: true, color: '#e65100', marginBottom: 4 },
      subheader: { fontSize: 10, color: '#555', marginBottom: 12 },
      tableHeader: { bold: true, fontSize: 8 },
    },
    pageMargins: [20, 20, 20, 20],
  }

  const doc = printer.createPdfKitDocument(docDef)
  const chunks: Buffer[] = []
  return new Promise<Buffer>((resolve) => {
    doc.on('data', (chunk: Buffer) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.end()
  })
}

export function generateFullPdf(athleteId: number, planId: number): Promise<Buffer> | null {
  const plan = queryOne(
    'SELECT * FROM training_plans WHERE id = ? AND athlete_id = ?',
    [planId, athleteId]
  )
  if (!plan) return null

  const weeks = queryRows(
    'SELECT * FROM weekly_blocks WHERE training_plan_id = ? ORDER BY week_number',
    [plan.id as number]
  )

  const printer = new PdfPrinter(fonts)
  const content: Content[] = []

  const raceName = plan.race_name as string | null
  const raceDate = plan.race_date as string | null
  const raceInfo = raceName ? `${raceName}${raceDate ? ` — ${raceDate}` : ''}` : ''

  content.push({ text: plan.name as string, style: 'header' })
  content.push({ text: raceInfo, style: 'subheader' })

  for (let idx = 0; idx < weeks.length; idx++) {
    const week = weeks[idx]

    if (idx > 0 && idx % 4 === 0) {
      content.push({ text: '', pageBreak: 'before' } as Content)
    }

    const phase = (week.phase as string | null) ?? null
    const fillColor = getPhaseColor(phase)
    const plannedKm = week.planned_km as number | null
    const plannedVertM = week.planned_vert_m as number | null

    content.push({
      text: `Week ${week.week_number} — ${phase ?? ''}`,
      style: 'weekHeader',
      fillColor,
    } as Content)

    content.push({
      text: `${week.start_date} – ${week.end_date} | Planned: ${plannedKm ?? 0} km / ${plannedVertM ?? 0}m vert`,
      style: 'weekMeta',
    } as Content)

    if (week.notes) {
      content.push({ text: week.notes as string, style: 'weekNotes' } as Content)
    }

    const workouts = queryRows(
      'SELECT * FROM daily_workouts WHERE weekly_block_id = ? ORDER BY workout_date',
      [week.id as number]
    )

    const tableBody: TableCell[][] = [
      [
        { text: 'Day', style: 'tableHeader', fillColor: '#555', color: 'white' },
        { text: 'Date', style: 'tableHeader', fillColor: '#555', color: 'white' },
        { text: 'Type', style: 'tableHeader', fillColor: '#555', color: 'white' },
        { text: 'Description', style: 'tableHeader', fillColor: '#555', color: 'white' },
        { text: 'km', style: 'tableHeader', fillColor: '#555', color: 'white' },
        { text: 'Vert', style: 'tableHeader', fillColor: '#555', color: 'white' },
      ],
    ]

    for (const workout of workouts) {
      const isRaceDay = Boolean(workout.is_race_day)
      const isRestDay = Boolean(workout.is_rest_day)
      const rowColor = isRaceDay ? '#ffcdd2' : isRestDay ? '#f5f5f5' : undefined
      const textColor = isRaceDay ? '#e65100' : isRestDay ? '#999' : '#333'
      const wPlannedKm = workout.planned_km as number | null
      const wPlannedVertM = workout.planned_vert_m as number | null

      tableBody.push([
        { text: (workout.day_of_week as string | null) ?? '', color: textColor, ...(rowColor && { fillColor: rowColor }), italics: isRestDay },
        { text: workout.workout_date as string, color: textColor, ...(rowColor && { fillColor: rowColor }) },
        { text: (workout.workout_type as string | null) ?? '', color: textColor, ...(rowColor && { fillColor: rowColor }), bold: isRaceDay },
        { text: (workout.description as string | null) ?? '', color: textColor, ...(rowColor && { fillColor: rowColor }) },
        {
          text: (wPlannedKm ?? 0) > 0 ? String(wPlannedKm) : '—',
          alignment: 'right',
          bold: true,
          color: textColor,
          ...(rowColor && { fillColor: rowColor }),
        },
        {
          text: (wPlannedVertM ?? 0) > 0 ? String(wPlannedVertM) : '—',
          alignment: 'right',
          color: textColor,
          ...(rowColor && { fillColor: rowColor }),
        },
      ])
    }

    content.push({
      table: {
        headerRows: 1,
        widths: ['auto', 'auto', 'auto', '*', 'auto', 'auto'],
        body: tableBody,
      },
      layout: 'lightHorizontalLines',
      marginBottom: 16,
    } as Content)
  }

  const docDef: TDocumentDefinitions = {
    defaultStyle: { font: 'Helvetica', fontSize: 8 },
    content,
    styles: {
      header: { fontSize: 16, bold: true, color: '#e65100', marginBottom: 4 },
      subheader: { fontSize: 10, color: '#555', marginBottom: 12 },
      weekHeader: {
        fontSize: 12,
        bold: true,
        color: '#e65100',
        marginTop: 20,
        marginBottom: 4,
      },
      weekMeta: { fontSize: 7, color: '#666', marginBottom: 4 },
      weekNotes: { fontSize: 8, color: '#333', marginBottom: 8 },
      tableHeader: { bold: true, fontSize: 8 },
    },
    pageMargins: [20, 20, 20, 20],
  }

  const doc = printer.createPdfKitDocument(docDef)
  const chunks: Buffer[] = []
  return new Promise<Buffer>((resolve) => {
    doc.on('data', (chunk: Buffer) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.end()
  })
}
