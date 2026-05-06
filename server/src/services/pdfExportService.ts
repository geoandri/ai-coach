import PdfPrinter from 'pdfmake'
import { db } from '../db/client.js'
import { trainingPlans, weeklyBlocks, dailyWorkouts } from '../db/schema.js'
import { eq, and } from 'drizzle-orm'
import type { TDocumentDefinitions, TableCell, Content } from 'pdfmake/interfaces.js'

// pdfmake requires virtual fonts for node
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
  const plan = db
    .select()
    .from(trainingPlans)
    .where(and(eq(trainingPlans.id, planId), eq(trainingPlans.athleteId, athleteId)))
    .get()
  if (!plan) return null

  const weeks = db
    .select()
    .from(weeklyBlocks)
    .where(eq(weeklyBlocks.trainingPlanId, plan.id))
    .all()
    .sort((a, b) => a.weekNumber - b.weekNumber)

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
    const fillColor = getPhaseColor(week.phase)
    tableBody.push([
      { text: String(week.weekNumber), fillColor },
      { text: week.phase ?? '', fillColor, color: '#e65100', bold: true },
      { text: `${week.startDate} – ${week.endDate}`, fillColor },
      { text: week.plannedKm != null ? String(week.plannedKm) : '—', fillColor, alignment: 'right' },
      { text: week.plannedVertM != null ? String(week.plannedVertM) : '—', fillColor, alignment: 'right' },
      { text: week.notes ?? '', fillColor },
    ])
  }

  const raceInfo = plan.raceName
    ? `${plan.raceName}${plan.raceDate ? ` — ${plan.raceDate}` : ''}`
    : ''

  const docDef: TDocumentDefinitions = {
    defaultStyle: { font: 'Helvetica', fontSize: 8 },
    content: [
      { text: plan.name, style: 'header' },
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
  const plan = db
    .select()
    .from(trainingPlans)
    .where(and(eq(trainingPlans.id, planId), eq(trainingPlans.athleteId, athleteId)))
    .get()
  if (!plan) return null

  const weeks = db
    .select()
    .from(weeklyBlocks)
    .where(eq(weeklyBlocks.trainingPlanId, plan.id))
    .all()
    .sort((a, b) => a.weekNumber - b.weekNumber)

  const printer = new PdfPrinter(fonts)
  const content: Content[] = []

  const raceInfo = plan.raceName
    ? `${plan.raceName}${plan.raceDate ? ` — ${plan.raceDate}` : ''}`
    : ''

  content.push({ text: plan.name, style: 'header' })
  content.push({ text: raceInfo, style: 'subheader' })

  for (let idx = 0; idx < weeks.length; idx++) {
    const week = weeks[idx]

    if (idx > 0 && idx % 4 === 0) {
      content.push({ text: '', pageBreak: 'before' } as Content)
    }

    const fillColor = getPhaseColor(week.phase)
    content.push({
      text: `Week ${week.weekNumber} — ${week.phase ?? ''}`,
      style: 'weekHeader',
      fillColor,
    } as Content)

    content.push({
      text: `${week.startDate} – ${week.endDate} | Planned: ${week.plannedKm ?? 0} km / ${week.plannedVertM ?? 0}m vert`,
      style: 'weekMeta',
    } as Content)

    if (week.notes) {
      content.push({ text: week.notes, style: 'weekNotes' } as Content)
    }

    const workouts = db
      .select()
      .from(dailyWorkouts)
      .where(eq(dailyWorkouts.weeklyBlockId, week.id))
      .all()
      .sort((a, b) => a.workoutDate.localeCompare(b.workoutDate))

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
      const rowColor = workout.isRaceDay ? '#ffcdd2' : workout.isRestDay ? '#f5f5f5' : undefined
      const textColor = workout.isRaceDay ? '#e65100' : workout.isRestDay ? '#999' : '#333'

      tableBody.push([
        { text: workout.dayOfWeek ?? '', color: textColor, ...(rowColor && { fillColor: rowColor }), italics: workout.isRestDay },
        { text: workout.workoutDate, color: textColor, ...(rowColor && { fillColor: rowColor }) },
        { text: workout.workoutType ?? '', color: textColor, ...(rowColor && { fillColor: rowColor }), bold: workout.isRaceDay },
        { text: workout.description ?? '', color: textColor, ...(rowColor && { fillColor: rowColor }) },
        {
          text: (workout.plannedKm ?? 0) > 0 ? String(workout.plannedKm) : '—',
          alignment: 'right',
          bold: true,
          color: textColor,
          ...(rowColor && { fillColor: rowColor }),
        },
        {
          text: (workout.plannedVertM ?? 0) > 0 ? String(workout.plannedVertM) : '—',
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
