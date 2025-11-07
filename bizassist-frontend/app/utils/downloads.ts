// G:\BizAssist\bizassist-frontend\app\utils\downloads.ts
// @ts-nocheck
'use client'

import JSZip from 'jszip'

const nowStr = () => new Date().toLocaleString()

async function getPdfBits() {
  const [{ jsPDF }, autoTableModule] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ])
  const autoTable = autoTableModule.default as (doc: any, opts: any) => any
  return { jsPDF, autoTable }
}

/* -------------------------------------------------------
   HELPERS TO READ WHAT THE DASHBOARDS ALREADY SAVED
   market-dashboard saved: 'bizassist-market-analysis'
   idea-ranker saved: 'bizassist-idea-ranking'
------------------------------------------------------- */
function getStoredMarketAnalysis() {
  if (typeof window === 'undefined') return null
  const raw = sessionStorage.getItem('bizassist-market-analysis')
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    if (parsed?.insights) return parsed
  } catch (e) {
    console.warn('bad market analysis in storage', e)
  }
  return null
}

function getStoredIdeaRanking() {
  if (typeof window === 'undefined') return null
  const raw = sessionStorage.getItem('bizassist-idea-ranking')
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    if (parsed?.rankerData) return parsed
  } catch (e) {
    console.warn('bad idea ranking in storage', e)
  }
  return null
}

/* -------------------------------------------------------
   MARKET REPORT – replicate the dashboard report structure
------------------------------------------------------- */
async function buildMarketReportPdf(
  insights: any,
  {
    theme = 'light',
    title = 'Market Feasibility Report',
  }: { theme?: 'dark' | 'light'; title?: string } = {}
) {
  const { jsPDF, autoTable } = await getPdfBits()
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const M = 40
  let y = M

  const primary: [number, number, number] =
    theme === 'dark' ? [59, 130, 246] : [20, 184, 166]
  const gray = (c: number) => [c, c, c] as [number, number, number]
  const clampPercentage = (v: number) =>
    Number.isNaN(v) ? 0 : Math.min(100, Math.max(0, v))

  const addHeader = () => {
    doc.setFillColor(...primary)
    doc.rect(0, 0, pageW, 48, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.setTextColor(255, 255, 255)
    doc.text(title, M, 30)
    doc.setFontSize(10)
    doc.text(`Generated: ${nowStr()}`, pageW - M, 30, { align: 'right' })
    y = 48 + M
  }

  const addSectionTitle = (t: string) => {
    if (y + 28 > pageH - M) {
      doc.addPage()
      y = M
    }
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.setTextColor(...gray(25))
    doc.text(t, M, y)
    y += 12
    doc.setDrawColor(...gray(210))
    doc.line(M, y, pageW - M, y)
    y += 16
  }

  const addParagraph = (text: string) => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.setTextColor(...gray(60))
    const lines = doc.splitTextToSize(text, pageW - M * 2)
    for (const line of lines) {
      if (y + 16 > pageH - M) {
        doc.addPage()
        y = M
      }
      doc.text(line as string, M, y)
      y += 14
    }
    y += 6
  }

  const addGauge = (label: string, value: number) => {
    if (y + 40 > pageH - M) {
      doc.addPage()
      y = M
    }
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(...gray(25))
    doc.text(label, M, y)
    y += 10
    const w = pageW - M * 2
    doc.setFillColor(...gray(235))
    doc.roundedRect(M, y, w, 12, 6, 6, 'F')
    const ww = Math.max(0, Math.min(w, (w * value) / 100))
    doc.setFillColor(...primary)
    doc.roundedRect(M, y, ww, 12, 6, 6, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(...gray(50))
    doc.text(`${value}%`, M + w - 4, y + 10, { align: 'right' })
    y += 24
  }

  const lastY = () => (doc as any).lastAutoTable?.finalY ?? y

  addHeader()

  if (insights?.headline) {
    addSectionTitle('Headline')
    addParagraph(insights.headline)
  }

  if (insights?.feasibilityScore) {
    addSectionTitle('Feasibility Score')
    const scoreVal = Math.min(
      100,
      Math.max(0, insights.feasibilityScore.value ?? 0)
    )
    const scoreLbl = insights.feasibilityScore.label ?? 'Awaiting analysis'
    addGauge(scoreLbl, scoreVal)
    if (insights.feasibilityScore.justification) {
      addParagraph(insights.feasibilityScore.justification)
    }
  }

  if (Array.isArray(insights?.stats) && insights.stats.length) {
    addSectionTitle('Key Stats')
    autoTable(doc, {
      startY: y,
      head: [['Metric', 'Value', 'Detail']],
      body: insights.stats.map((s: any) => [s.label, s.value, s.detail]),
      theme: 'grid',
      styles: { font: 'helvetica', fontSize: 10, cellPadding: 6 },
      headStyles: { fillColor: primary, textColor: 255 },
      margin: { left: M, right: M },
    })
    y = lastY() + 20
  }

  if (Array.isArray(insights?.topMarkets) && insights.topMarkets.length) {
    addSectionTitle('Top 5 Potential Export Markets')
    autoTable(doc, {
      startY: y,
      head: [['Market', 'Share', 'Rationale']],
      body: insights.topMarkets
        .slice(0, 5)
        .map((m: any) => [m.name, Math.min(100, Math.max(0, m.percentage)), m.rationale]),
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 10,
        cellPadding: 6,
        overflow: 'linebreak',
        minCellHeight: 18,
      },
      headStyles: { fillColor: primary, textColor: 255 },
      margin: { left: M, right: M },
      columnStyles: {
        1: { cellWidth: 70, halign: 'center' },
      },
      didParseCell: (data: any) => {
        if (data.section === 'body' && data.column.index === 1) {
          data.cell.text = ['']
        }
      },
      didDrawCell: (data: any) => {
        if (data.section === 'body' && data.column.index === 1) {
          const p = Number(data.row.raw[1]) || 0
          const pad = 4
          const w = data.cell.width - pad * 2
          const h = 8
          const x = data.cell.x + pad
          const yy = data.cell.y + (data.cell.height - h) / 2

          doc.setFillColor(235, 235, 235)
          doc.roundedRect(x, yy, w, h, 3, 3, 'F')

          const ww = (w * Math.min(100, Math.max(0, p))) / 100
          doc.setFillColor(...primary)
          doc.roundedRect(x, yy, ww, h, 3, 3, 'F')

          doc.setTextColor(60)
          doc.setFontSize(9)
          doc.setFont('helvetica', 'bold')
          doc.text(`${p}%`, x + w - 2, yy + h - 1, { align: 'right' })
        }
      },
    })
    y = lastY() + 20
  }

  if (Array.isArray(insights?.globalHighlights) && insights.globalHighlights.length) {
    addSectionTitle('Global Demand Signals')
    autoTable(doc, {
      startY: y,
      head: [['Region', 'Signal', 'Intensity', 'Detail']],
      body: insights.globalHighlights.map((g: any) => [
        g.region,
        g.signal,
        `${Math.min(100, Math.max(0, g.percentage))}%`,
        g.detail,
      ]),
    theme: 'grid',
    styles: { font: 'helvetica', fontSize: 10, cellPadding: 6 },
    headStyles: { fillColor: primary, textColor: 255 },
    margin: { left: M, right: M },
  })
  y = lastY() + 20
}

if (Array.isArray(insights?.challenges) && insights.challenges.length) {
  addSectionTitle('Key Execution Constraints')
  autoTable(doc, {
    startY: y,
    head: [['Constraint', 'Weight', 'Detail']],
    body: insights.challenges.map((c: any) => [
      c.label,
      `${Math.min(100, Math.max(0, c.percentage))}%`,
      c.detail,
    ]),
    theme: 'grid',
    styles: { font: 'helvetica', fontSize: 10, cellPadding: 6 },
    headStyles: { fillColor: primary, textColor: 255 },
    margin: { left: M, right: M },
  })
  y = lastY() + 20
}

if (Array.isArray(insights?.recommendations) && insights.recommendations.length) {
  addSectionTitle('Strategic Recommendations')
  autoTable(doc, {
    startY: y,
    head: [['#', 'Recommendation']],
    body: insights.recommendations.map((r: any, i: number) => [String(i + 1), r.text]),
    theme: 'grid',
    styles: { font: 'helvetica', fontSize: 10, cellPadding: 6 },
    headStyles: { fillColor: primary, textColor: 255 },
    columnStyles: { 0: { cellWidth: 24 } },
    margin: { left: M, right: M },
  })
  y = lastY() + 20
}

const pages = doc.getNumberOfPages()
for (let i = 1; i <= pages; i++) {
  doc.setPage(i)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(120, 120, 120)
  doc.text(
    `Page ${i} of ${pages}`,
    pageW - M,
    doc.internal.pageSize.getHeight() - 16,
    { align: 'right' }
  )
}

return doc
}

/* -------------------------------------------------------
   IDEA RANKER REPORT
------------------------------------------------------- */
async function buildIdeaRankerPdf(
  rankerData: any,
  competitors: any,
  theme: 'dark' | 'light' = 'light'
) {
  const { jsPDF, autoTable } = await getPdfBits()
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const M = 40
  let y = M

  const primary: [number, number, number] =
    theme === 'dark' ? [59, 130, 246] : [16, 185, 129]
  const gray = (c: number) => [c, c, c] as [number, number, number]

  doc.setFillColor(...primary)
  doc.rect(0, 0, pageW, 48, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(255, 255, 255)
  doc.text('IdeaRanker Report', M, 30)
  doc.setFontSize(10)
  doc.text(`Generated: ${nowStr()}`, pageW - M, 30, { align: 'right' })
  y = 48 + M

  const ideaTitle = rankerData?.ideaTitle ?? 'Your Business'
  const overallScore = rankerData?.overallScore ?? 0
  const readinessLabel = rankerData?.readinessLabel ?? 'Analyzing'

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(12)
  doc.setTextColor(...gray(40))
  doc.text(`Idea: ${ideaTitle}`, M, y)
  y += 18
  doc.text(`Overall: ${overallScore}/100 — ${readinessLabel}`, M, y)
  y += 20

  const scores = rankerData?.scores ?? {}
  const rows = [
    ['Novelty', scores?.novelty?.score ?? '—', scores?.novelty?.justification ?? ''],
    [
      'Local Capability',
      scores?.localCapability?.score ?? '—',
      scores?.localCapability?.justification ?? '',
    ],
    ['Feasibility', scores?.feasibility?.score ?? '—', scores?.feasibility?.justification ?? ''],
    [
      'Sustainability',
      scores?.sustainability?.score ?? '—',
      scores?.sustainability?.justification ?? '',
    ],
    [
      'Global Demand',
      scores?.globalDemand?.score ?? '—',
      scores?.globalDemand?.justification ?? '',
    ],
  ]

  autoTable(doc, {
    startY: y,
    head: [['Metric', 'Score', 'Justification']],
    body: rows,
    styles: { font: 'helvetica', fontSize: 10, cellPadding: 6 },
    headStyles: { fillColor: primary, textColor: 255 },
    margin: { left: M, right: M },
  })
  y = (doc as any).lastAutoTable?.finalY ?? y

  if (competitors?.competitors?.length) {
    y += 20
    if (y > doc.internal.pageSize.getHeight() - 80) {
      doc.addPage()
      y = M
    }
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.setTextColor(...gray(25))
    doc.text('Top Competitors', M, y)
    y += 12
    doc.setDrawColor(...gray(210))
    doc.line(M, y, pageW - M, y)
    y += 16

    const compRows = competitors.competitors.slice(0, 12).map((c: any) => {
      let host = ''
      if (c.website) {
        try {
          host = new URL(c.website.startsWith('http') ? c.website : `https://${c.website}`).host
        } catch {
          host = c.website
        }
      }
      return [c.title || '-', host || '-', c.description || '-']
    })

    autoTable(doc, {
      startY: y,
      head: [['Company', 'Website', 'What they do']],
      body: compRows,
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 10,
        cellPadding: 6,
        overflow: 'linebreak',
      },
      headStyles: { fillColor: primary, textColor: 255 },
      margin: { left: M, right: M },
      columnStyles: {
        0: { cellWidth: 140 },
        1: { cellWidth: 150 },
      },
    })
    y = (doc as any).lastAutoTable?.finalY ?? y
  }

  if (Array.isArray(rankerData?.nextSteps) && rankerData.nextSteps.length) {
    y += 20
    if (y > doc.internal.pageSize.getHeight() - 80) {
      doc.addPage()
      y = M
    }
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.setTextColor(...gray(25))
    doc.text('Next Steps', M, y)
    y += 12
    doc.setDrawColor(...gray(210))
    doc.line(M, y, pageW - M, y)
    y += 14

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.setTextColor(...gray(55))
    rankerData.nextSteps.forEach((s: any, i: number) => {
      const lines = doc.splitTextToSize(`${i + 1}. ${s.text}`, pageW - M * 2)
      lines.forEach((ln: string) => {
        if (y > doc.internal.pageSize.getHeight() - 60) {
          doc.addPage()
          y = M
        }
        doc.text(ln, M, y)
        y += 14
      })
      y += 2
    })
  }

  const pages = doc.getNumberOfPages()
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(120, 120, 120)
    doc.text(
      `Page ${i} of ${pages}`,
      pageW - M,
      doc.internal.pageSize.getHeight() - 16,
      { align: 'right' }
    )
  }

  return doc
}

/* -------------------------------------------------------
   SIMPLE PITCH PDF (kept — in case other code uses it)
------------------------------------------------------- */
async function buildPitchPdf(pitch: any, theme: 'dark' | 'light' = 'light') {
  const { jsPDF } = await getPdfBits()
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const M = 40
  let y = M

  const primary: [number, number, number] =
    theme === 'dark' ? [59, 130, 246] : [16, 185, 129]
  const gray = (c: number) => [c, c, c] as [number, number, number]

  doc.setFillColor(...primary)
  doc.rect(0, 0, pageW, 48, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(255, 255, 255)
  doc.text('Pitch Narrative', M, 30)
  doc.setFontSize(10)
  doc.text(`Generated: ${nowStr()}`, pageW - M, 30, { align: 'right' })
  y = 48 + M

  const addSection = (title: string, content: string) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.setTextColor(...gray(20))
    doc.text(title, M, y)
    y += 14
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.setTextColor(...gray(60))
    const lines = doc.splitTextToSize(content, pageW - M * 2)
    for (const line of lines) {
      doc.text(line as string, M, y)
      y += 14
    }
    y += 10
  }

  const title = pitch?.businessTitle || 'Untitled Pitch'
  const summary = pitch?.summary || pitch?.draftIdea?.aiSummary || ''
  addSection('Business Title', title)
  if (summary) addSection('Summary', summary)

  const speech = pitch?.pitchGeneration?.pitchSpeech
  if (speech?.sections?.length) {
    speech.sections.forEach((s: any) => {
      addSection(s.sectionName, s.content)
    })
  }

  return doc
}

/* -------------------------------------------------------
   BRANDING: fetch logo image so it's an actual file
------------------------------------------------------- */
async function fetchImageAsArrayBuffer(url: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch image')
  return await res.arrayBuffer()
}

export async function exportBrandingAssets(pitch: any) {
  const zip = new JSZip()
  const branding = pitch?.visualBranding
  if (!branding) {
    alert('No branding data found on this pitch.')
    return
  }

  zip.file('branding/palette.json', JSON.stringify(branding.palette ?? {}, null, 2))

  if (branding.logo?.image) {
    try {
      const buf = await fetchImageAsArrayBuffer(branding.logo.image)
      zip.file('branding/logo.png', buf)
    } catch (e) {
      zip.file('branding/logo.txt', branding.logo.image)
    }
  }

  const blob = await zip.generateAsync({ type: 'blob' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'branding-assets.zip'
  a.click()
  URL.revokeObjectURL(a.href)
}

/* -------------------------------------------------------
   PUBLIC FUNCTIONS CALLED FROM PITCH DASHBOARD
------------------------------------------------------- */

export async function exportMarketReport(pitch: any, theme: 'dark' | 'light' = 'light') {
  const stored = getStoredMarketAnalysis()
  const insights = stored?.insights ?? pitch?.marketAnalysis
  if (!insights) {
    alert('No market analysis found.')
    return
  }
  const doc = await buildMarketReportPdf(insights, {
    theme,
    title: 'Market Feasibility Report',
  })
  doc.save('market-analysis-report.pdf')
}

export async function exportIdeaRankerReport(
  pitch: any,
  theme: 'dark' | 'light' = 'light'
) {
  const stored = getStoredIdeaRanking()
  const rankerData = stored?.rankerData ?? pitch?.ideaRanking?.rankerData
  const competitors = stored?.competitors ?? pitch?.ideaRanking?.competitors
  if (!rankerData) {
    alert('No idea ranking data found.')
    return
  }
  const doc = await buildIdeaRankerPdf(rankerData, competitors, theme)
  doc.save('idearanker-report.pdf')
}

/* -------------------------------------------------------
   PITCH EXPORT (mini) – now identical style to exportAll
------------------------------------------------------- */
export async function exportPitchReport(
  pitch: any,
  theme: 'dark' | 'light' = 'light'
) {
  const { jsPDF } = await getPdfBits()
  const M = 40
  const now = nowStr()
  const primary: [number, number, number] =
    theme === 'dark' ? [59, 130, 246] : [16, 185, 129]

  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const pitchGen = pitch?.pitchGeneration?.pitchSpeech
  const businessTitle = pitch?.businessTitle || 'Your Business'

  doc.setFillColor(...primary)
  doc.rect(0, 0, pageW, 48, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(255, 255, 255)
  doc.text('Pitch Narrative', M, 30)
  doc.setFontSize(10)
  doc.text(`Generated: ${now}`, pageW - M, 30, { align: 'right' })

  let y = 48 + M

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(35, 35, 35)
  doc.text(businessTitle, M, y)
  y += 16

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(70, 70, 70)

  if (pitchGen?.sections?.length) {
    pitchGen.sections.forEach((sec: any, idx: number) => {
      const title = `${idx + 1}. ${sec.sectionName}`
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(35, 35, 35)
      doc.text(title, M, y)
      y += 14
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(70, 70, 70)
      const lines = doc.splitTextToSize(sec.content || '', pageW - M * 2)
      lines.forEach((ln: string) => {
        if (y > pageH - 60) {
          doc.addPage()
          y = M
        }
        doc.text(ln, M, y)
        y += 14
      })
      if (sec.notes) {
        const noteLines = doc.splitTextToSize(`Note: ${sec.notes}`, pageW - M * 2)
        noteLines.forEach((ln: string) => {
          if (y > pageH - 60) {
            doc.addPage()
            y = M
          }
          doc.text(ln, M, y)
          y += 14
        })
      }
      y += 6
    })
  } else {
    const lines = doc.splitTextToSize(
      pitch?.summary || 'No pitch sections available.',
      pageW - M * 2
    )
    lines.forEach((ln: string) => {
      doc.text(ln, M, y)
      y += 14
    })
  }

  doc.save('pitch-report.pdf')
}

export async function exportAllPitchAssets({
  pitch,
  theme = 'light',
}: {
  pitch: any
  theme?: 'dark' | 'light'
}) {
  const zip = new JSZip()

  // MARKET
  const storedMarket = getStoredMarketAnalysis()
  const insights = storedMarket?.insights ?? pitch?.marketAnalysis
  if (insights) {
    const marketDoc = await buildMarketReportPdf(insights, {
      theme,
      title: 'Market Feasibility Report',
    })
    const buf = marketDoc.output('arraybuffer')
    zip.file('market-analysis-report.pdf', buf)
  }

  // IDEA RANKER
  const storedRanker = getStoredIdeaRanking()
  const rankerData = storedRanker?.rankerData ?? pitch?.ideaRanking?.rankerData
  const competitors = storedRanker?.competitors ?? pitch?.ideaRanking?.competitors
  if (rankerData) {
    const ideaDoc = await buildIdeaRankerPdf(rankerData, competitors, theme)
    const buf = ideaDoc.output('arraybuffer')
    zip.file('idea-ranker-report.pdf', buf)
  }

  // 👉 define what your pitch block needs
  const { jsPDF } = await getPdfBits()
  const M = 40
  const now = nowStr()
  const primary: [number, number, number] =
    theme === 'dark' ? [59, 130, 246] : [16, 185, 129]

  // PITCH (your original block, unchanged)
  /* ---------- PITCH ---------- */
  {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    const pageW = doc.internal.pageSize.getWidth()
    const pageH = doc.internal.pageSize.getHeight()
    const pitchGen = pitch?.pitchGeneration?.pitchSpeech
    const businessTitle = pitch?.businessTitle || 'Your Business'

    doc.setFillColor(...primary)
    doc.rect(0, 0, pageW, 48, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.setTextColor(255, 255, 255)
    doc.text('Pitch Narrative', M, 30)
    doc.setFontSize(10)
    doc.text(`Generated: ${now}`, pageW - M, 30, { align: 'right' })

    let y = 48 + M

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.setTextColor(35, 35, 35)
    doc.text(businessTitle, M, y)
    y += 16

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.setTextColor(70, 70, 70)

    if (pitchGen?.sections?.length) {
      pitchGen.sections.forEach((sec: any, idx: number) => {
        const title = `${idx + 1}. ${sec.sectionName}`
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(35, 35, 35)
        doc.text(title, M, y)
        y += 14
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(70, 70, 70)
        const lines = doc.splitTextToSize(sec.content || '', pageW - M * 2)
        lines.forEach((ln: string) => {
          if (y > pageH - 60) {
            doc.addPage()
            y = M
          }
          doc.text(ln, M, y)
          y += 14
        })
        if (sec.notes) {
          const noteLines = doc.splitTextToSize(`Note: ${sec.notes}`, pageW - M * 2)
          noteLines.forEach((ln: string) => {
            if (y > pageH - 60) {
              doc.addPage()
              y = M
            }
            doc.text(ln, M, y)
            y += 14
          })
        }
        y += 6
      })
    } else {
      const lines = doc.splitTextToSize(
        pitch?.summary || 'No pitch sections available.',
        pageW - M * 2
      )
      lines.forEach((ln: string) => {
        doc.text(ln, M, y)
        y += 14
      })
    }

    const buf = doc.output('arraybuffer')
    zip.file('pitch.pdf', buf)
  }

  // BRANDING
  const branding = pitch?.visualBranding
  if (branding) {
    zip.file('branding/palette.json', JSON.stringify(branding.palette ?? {}, null, 2))
    if (branding.logo?.image) {
      try {
        const buf = await fetchImageAsArrayBuffer(branding.logo.image)
        zip.file('branding/logo.png', buf)
      } catch (e) {
        zip.file('branding/logo.txt', branding.logo.image)
      }
    }
  }

  const blob = await zip.generateAsync({ type: 'blob' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'pitch-assets.zip'
  a.click()
  URL.revokeObjectURL(a.href)
}
