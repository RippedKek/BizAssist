'use client'

import JSZipPkg from 'jszip'

type ExportAllArgs = {
  pitch: any
  theme?: 'dark' | 'light'
}

const getPdfLibs = async () => {
  const [{ jsPDF }, autoTableMod] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ])
  const autoTable = autoTableMod.default as (doc: any, opts: any) => any
  return { jsPDF, autoTable }
}

const niceLabel = (key: string) => {
  switch (key) {
    case 'novelty':
      return 'Novelty'
    case 'localCapability':
    case 'local_capability':
      return 'Local Capability'
    case 'feasibility':
      return 'Feasibility'
    case 'sustainability':
      return 'Sustainability'
    case 'globalDemand':
    case 'global_demand':
      return 'Global Demand'
    default:
      return key
  }
}

const fetchImageAsArrayBuffer = async (src: string): Promise<ArrayBuffer | null> => {
  try {
    // data URL
    if (src.startsWith('data:')) {
      const base64 = src.split(',')[1]
      const binary = atob(base64)
      const len = binary.length
      const bytes = new Uint8Array(len)
      for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i)
      return bytes.buffer
    }

    // normal URL
    const res = await fetch(src)
    if (!res.ok) return null
    const buf = await res.arrayBuffer()
    return buf
  } catch (e) {
    console.error('Logo fetch failed:', e)
    return null
  }
}

/* ------------------------------------------------------------------ */
/*  INDIVIDUAL REPORT BUILDERS                                        */
/* ------------------------------------------------------------------ */

export async function exportMarketReport(pitch: any, theme: 'dark' | 'light' = 'dark') {
  const { jsPDF, autoTable } = await getPdfLibs()
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const M = 40

  const primaryDark: [number, number, number] = [37, 99, 235]
  const primaryLight: [number, number, number] = [16, 185, 129]
  const primary = theme === 'dark' ? primaryDark : primaryLight
  const now = new Date().toLocaleString()

  const market = pitch?.marketAnalysis

  // header
  doc.setFillColor(...primary)
  doc.rect(0, 0, pageW, 48, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(255, 255, 255)
  doc.text('Market Analysis Report', M, 30)
  doc.setFontSize(10)
  doc.text(`Generated: ${now}`, pageW - M, 30, { align: 'right' })

  let y = 48 + M

  // headline / summary
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(35, 35, 35)
  doc.text(market?.headline || 'Market overview', M, y)
  y += 16

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(70, 70, 70)
  const summaryLines = doc.splitTextToSize(
    market?.summary ||
      market?.description ||
      'No market summary available for this pitch.',
    pageW - M * 2
  )
  summaryLines.forEach((ln: string) => {
    doc.text(ln, M, y)
    y += 14
  })

  // feasibilityScore
  if (market?.feasibilityScore) {
    y += 16
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.text('Feasibility', M, y)
    y += 12
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    const fs = market.feasibilityScore
    doc.text(
      `Score: ${fs.value}/100 — ${fs.label}`,
      M,
      y
    )
    y += 14
    const fLines = doc.splitTextToSize(
      fs.justification || '',
      pageW - M * 2
    )
    fLines.forEach((ln: string) => {
      doc.text(ln, M, y)
      y += 14
    })
  }

  // stats
  if (Array.isArray(market?.stats) && market.stats.length > 0) {
    y += 18
    autoTable(doc, {
      startY: y,
      head: [['Metric', 'Value', 'Detail']],
      body: market.stats.map((s: any) => [s.label, s.value, s.detail || '']),
      margin: { left: M, right: M },
      headStyles: { fillColor: primary, textColor: 255 },
      styles: { fontSize: 10 },
    })
    y = (doc as any).lastAutoTable?.finalY ?? y
  }

  // top markets
  if (Array.isArray(market?.topMarkets) && market.topMarkets.length > 0) {
    y += 20
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.text('Top Markets', M, y)
    y += 12
    autoTable(doc, {
      startY: y,
      head: [['Market', '%', 'Rationale']],
      body: market.topMarkets.map((m: any) => [
        m.name,
        m.percentage ? `${m.percentage}%` : '',
        m.rationale || '',
      ]),
      margin: { left: M, right: M },
      headStyles: { fillColor: primary, textColor: 255 },
      styles: { fontSize: 10 },
    })
    y = (doc as any).lastAutoTable?.finalY ?? y
  }

  // challenges
  if (Array.isArray(market?.challenges) && market.challenges.length > 0) {
    y += 20
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.text('Challenges', M, y)
    y += 12
    autoTable(doc, {
      startY: y,
      head: [['Challenge', '%', 'Detail']],
      body: market.challenges.map((c: any) => [
        c.label,
        c.percentage ? `${c.percentage}%` : '',
        c.detail || '',
      ]),
      margin: { left: M, right: M },
      headStyles: { fillColor: primary, textColor: 255 },
      styles: { fontSize: 10 },
    })
    y = (doc as any).lastAutoTable?.finalY ?? y
  }

  // recommendations
  if (Array.isArray(market?.recommendations) && market.recommendations.length > 0) {
    y += 20
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.text('Recommendations', M, y)
    y += 14
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    market.recommendations.forEach((r: any, i: number) => {
      const lines = doc.splitTextToSize(`${i + 1}. ${r.text}`, pageW - M * 2)
      lines.forEach((ln: string) => {
        if (y > pageH - 60) {
          doc.addPage()
          y = M
        }
        doc.text(ln, M, y)
        y += 14
      })
    })
  }

  doc.save('market-report.pdf')
}

export async function exportIdeaRankerReport(pitch: any, theme: 'dark' | 'light' = 'dark') {
  const { jsPDF, autoTable } = await getPdfLibs()
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const M = 40

  const primaryDark: [number, number, number] = [37, 99, 235]
  const primaryLight: [number, number, number] = [16, 185, 129]
  const primary = theme === 'dark' ? primaryDark : primaryLight
  const now = new Date().toLocaleString()

  const ranker = pitch?.ideaRanking?.rankerData
  const competitors = pitch?.ideaRanking?.competitors?.competitors || pitch?.ideaRanking?.competitors || []

  // header
  doc.setFillColor(...primary)
  doc.rect(0, 0, pageW, 48, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(255, 255, 255)
  doc.text('IdeaRanker Report', M, 30)
  doc.setFontSize(10)
  doc.text(`Generated: ${now}`, pageW - M, 30, { align: 'right' })

  let y = 48 + M

  // meta
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(12)
  doc.setTextColor(35, 35, 35)
  doc.text(
    `Idea: ${ranker?.ideaTitle || pitch?.businessTitle || 'Your Business'}`,
    M,
    y
  )
  y += 16
  doc.text(
    `Overall: ${ranker?.overallScore ?? '—'}/100 — ${ranker?.readinessLabel || ''}`,
    M,
    y
  )
  y += 20

  // scores
  if (ranker?.scores) {
    const rows = Object.entries(ranker.scores).map(([key, val]: any) => [
      niceLabel(key),
      String(val?.score ?? ''),
      val?.justification || '',
    ])
    autoTable(doc, {
      startY: y,
      head: [['Metric', 'Score', 'Justification']],
      body: rows,
      margin: { left: M, right: M },
      headStyles: { fillColor: primary, textColor: 255 },
      styles: { fontSize: 10 },
    })
    y = (doc as any).lastAutoTable?.finalY ?? y
  }

  // next steps
  if (Array.isArray(ranker?.nextSteps) && ranker.nextSteps.length > 0) {
    y += 20
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.text('Next Steps', M, y)
    y += 14
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    ranker.nextSteps.forEach((s: any, i: number) => {
      const lines = doc.splitTextToSize(`${i + 1}. ${s.text}`, pageW - M * 2)
      lines.forEach((ln: string) => {
        if (y > pageH - 60) {
          doc.addPage()
          y = M
        }
        doc.text(ln, M, y)
        y += 14
      })
      y += 2
    })
  }

  // TOP COMPETITORS (from idea-ranker page)
  if (Array.isArray(competitors) && competitors.length > 0) {
    y += 20
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.text('Top Competitors', M, y)
    y += 12

    autoTable(doc, {
      startY: y,
      head: [['Name', 'Website', 'Description']],
      body: competitors.map((c: any) => {
        let site = ''
        try {
          site = c.website
            ? new URL(c.website.startsWith('http') ? c.website : `https://${c.website}`).host
            : ''
        } catch {
          site = c.website || ''
        }
        return [c.title || '-', site, c.description || '']
      }),
      margin: { left: M, right: M },
      headStyles: { fillColor: primary, textColor: 255 },
      styles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 120 },
        1: { cellWidth: 120 },
      },
    })
  }

  doc.save('idea-ranker-report.pdf')
}

export async function exportPitchReport(pitch: any, theme: 'dark' | 'light' = 'dark') {
  const { jsPDF } = await getPdfLibs()
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const M = 40

  const primaryDark: [number, number, number] = [37, 99, 235]
  const primaryLight: [number, number, number] = [16, 185, 129]
  const primary = theme === 'dark' ? primaryDark : primaryLight
  const now = new Date().toLocaleString()

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

  doc.save('pitch.pdf')
}

export async function exportBrandingAssets(pitch: any) {
  const zip = new JSZipPkg()
  const folder = zip.folder('branding')

  const branding = pitch?.visualBranding
  if (branding?.logo?.image) {
    const buf = await fetchImageAsArrayBuffer(branding.logo.image)
    if (buf) {
      // try to guess extension
      const isPng =
        branding.logo.image.startsWith('data:image/png') ||
        branding.logo.image.toLowerCase().endsWith('.png')
      const isJpg =
        branding.logo.image.startsWith('data:image/jpeg') ||
        branding.logo.image.toLowerCase().endsWith('.jpg') ||
        branding.logo.image.toLowerCase().endsWith('.jpeg')

      const ext = isPng ? 'png' : isJpg ? 'jpg' : 'bin'
      folder?.file(`logo.${ext}`, buf)
    } else {
      folder?.file('logo.txt', 'Logo image could not be fetched.')
    }
  }

  if (Array.isArray(branding?.palette?.colors)) {
    folder?.file(
      'palette.json',
      JSON.stringify(
        {
          name: branding.palette.name || 'palette',
          colors: branding.palette.colors,
        },
        null,
        2
      )
    )
  }

  const blob = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'branding.zip'
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}

/* ------------------------------------------------------------------ */
/*  EXPORT ALL (ZIP)                                                  */
/* ------------------------------------------------------------------ */

export async function exportAllPitchAssets({ pitch, theme = 'dark' }: ExportAllArgs) {
  const zip = new JSZipPkg()
  const { jsPDF, autoTable } = await getPdfLibs()

  const primaryDark: [number, number, number] = [37, 99, 235]
  const primaryLight: [number, number, number] = [16, 185, 129]
  const primary = theme === 'dark' ? primaryDark : primaryLight
  const now = new Date().toLocaleString()
  const M = 40

  /* ---------- MARKET (same as exportMarketReport but into zip) ---------- */
  {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    const pageW = doc.internal.pageSize.getWidth()
    const pageH = doc.internal.pageSize.getHeight()
    const market = pitch?.marketAnalysis

    doc.setFillColor(...primary)
    doc.rect(0, 0, pageW, 48, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.setTextColor(255, 255, 255)
    doc.text('Market Analysis Report', M, 30)
    doc.setFontSize(10)
    doc.text(`Generated: ${now}`, pageW - M, 30, { align: 'right' })

    let y = 48 + M

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.setTextColor(35, 35, 35)
    doc.text(market?.headline || 'Market overview', M, y)
    y += 16

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.setTextColor(70, 70, 70)
    const summaryLines = doc.splitTextToSize(
      market?.summary ||
        market?.description ||
        'No market summary available for this pitch.',
      pageW - M * 2
    )
    summaryLines.forEach((ln: string) => {
      doc.text(ln, M, y)
      y += 14
    })

    if (market?.feasibilityScore) {
      y += 16
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(13)
      doc.text('Feasibility', M, y)
      y += 12
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      const fs = market.feasibilityScore
      doc.text(`Score: ${fs.value}/100 — ${fs.label}`, M, y)
      y += 14
      const fLines = doc.splitTextToSize(fs.justification || '', pageW - M * 2)
      fLines.forEach((ln: string) => {
        doc.text(ln, M, y)
        y += 14
      })
    }

    if (Array.isArray(market?.stats) && market.stats.length > 0) {
      y += 18
      autoTable(doc, {
        startY: y,
        head: [['Metric', 'Value', 'Detail']],
        body: market.stats.map((s: any) => [s.label, s.value, s.detail || '']),
        margin: { left: M, right: M },
        headStyles: { fillColor: primary, textColor: 255 },
        styles: { fontSize: 10 },
      })
      y = (doc as any).lastAutoTable?.finalY ?? y
    }

    if (Array.isArray(market?.topMarkets) && market.topMarkets.length > 0) {
      y += 20
      autoTable(doc, {
        startY: y,
        head: [['Market', '%', 'Rationale']],
        body: market.topMarkets.map((m: any) => [
          m.name,
          m.percentage ? `${m.percentage}%` : '',
          m.rationale || '',
        ]),
        margin: { left: M, right: M },
        headStyles: { fillColor: primary, textColor: 255 },
        styles: { fontSize: 10 },
      })
      y = (doc as any).lastAutoTable?.finalY ?? y
    }

    if (Array.isArray(market?.challenges) && market.challenges.length > 0) {
      y += 20
      autoTable(doc, {
        startY: y,
        head: [['Challenge', '%', 'Detail']],
        body: market.challenges.map((c: any) => [
          c.label,
          c.percentage ? `${c.percentage}%` : '',
          c.detail || '',
        ]),
        margin: { left: M, right: M },
        headStyles: { fillColor: primary, textColor: 255 },
        styles: { fontSize: 10 },
      })
      y = (doc as any).lastAutoTable?.finalY ?? y
    }

    if (Array.isArray(market?.recommendations) && market.recommendations.length > 0) {
      y += 20
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(13)
      doc.text('Recommendations', M, y)
      y += 14
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      market.recommendations.forEach((r: any, i: number) => {
        const lines = doc.splitTextToSize(`${i + 1}. ${r.text}`, pageW - M * 2)
        lines.forEach((ln: string) => {
          if (y > pageH - 60) {
            doc.addPage()
            y = M
          }
          doc.text(ln, M, y)
          y += 14
        })
      })
    }

    const buf = doc.output('arraybuffer')
    zip.file('market-report.pdf', buf)
  }

  /* ---------- IDEA RANKER (with competitors) ---------- */
  {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    const pageW = doc.internal.pageSize.getWidth()
    const pageH = doc.internal.pageSize.getHeight()
    const ranker = pitch?.ideaRanking?.rankerData
    const competitors = pitch?.ideaRanking?.competitors?.competitors || pitch?.ideaRanking?.competitors || []

    doc.setFillColor(...primary)
    doc.rect(0, 0, pageW, 48, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.setTextColor(255, 255, 255)
    doc.text('IdeaRanker Report', M, 30)
    doc.setFontSize(10)
    doc.text(`Generated: ${now}`, pageW - M, 30, { align: 'right' })

    let y = 48 + M

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(12)
    doc.setTextColor(35, 35, 35)
    doc.text(
      `Idea: ${ranker?.ideaTitle || pitch?.businessTitle || 'Your Business'}`,
      M,
      y
    )
    y += 16
    doc.text(
      `Overall: ${ranker?.overallScore ?? '—'}/100 — ${ranker?.readinessLabel || ''}`,
      M,
      y
    )
    y += 20

    if (ranker?.scores) {
      const rows = Object.entries(ranker.scores).map(([key, val]: any) => [
        niceLabel(key),
        String(val?.score ?? ''),
        val?.justification || '',
      ])
      autoTable(doc, {
        startY: y,
        head: [['Metric', 'Score', 'Justification']],
        body: rows,
        margin: { left: M, right: M },
        headStyles: { fillColor: primary, textColor: 255 },
        styles: { fontSize: 10 },
      })
      y = (doc as any).lastAutoTable?.finalY ?? y
    }

    if (Array.isArray(ranker?.nextSteps) && ranker.nextSteps.length > 0) {
      y += 20
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(13)
      doc.text('Next Steps', M, y)
      y += 14
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      ranker.nextSteps.forEach((s: any, i: number) => {
        const lines = doc.splitTextToSize(`${i + 1}. ${s.text}`, pageW - M * 2)
        lines.forEach((ln: string) => {
          if (y > pageH - 60) {
            doc.addPage()
            y = M
          }
          doc.text(ln, M, y)
          y += 14
        })
        y += 2
      })
    }

    if (Array.isArray(competitors) && competitors.length > 0) {
      y += 20
      autoTable(doc, {
        startY: y,
        head: [['Name', 'Website', 'Description']],
        body: competitors.map((c: any) => {
          let site = ''
          try {
            site = c.website
              ? new URL(c.website.startsWith('http') ? c.website : `https://${c.website}`).host
              : ''
          } catch {
            site = c.website || ''
          }
          return [c.title || '-', site, c.description || '']
        }),
        margin: { left: M, right: M },
        headStyles: { fillColor: primary, textColor: 255 },
        styles: { fontSize: 10 },
      })
    }

    const buf = doc.output('arraybuffer')
    zip.file('idea-ranker-report.pdf', buf)
  }

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

  /* ---------- BRANDING (with actual image) ---------- */
  {
    const brandingFolder = zip.folder('branding')
    const branding = pitch?.visualBranding
    if (branding?.logo?.image) {
      const buf = await fetchImageAsArrayBuffer(branding.logo.image)
      if (buf) {
        const isPng =
          branding.logo.image.startsWith('data:image/png') ||
          branding.logo.image.toLowerCase().endsWith('.png')
        const isJpg =
          branding.logo.image.startsWith('data:image/jpeg') ||
          branding.logo.image.toLowerCase().endsWith('.jpg') ||
          branding.logo.image.toLowerCase().endsWith('.jpeg')
        const ext = isPng ? 'png' : isJpg ? 'jpg' : 'bin'
        brandingFolder?.file(`logo.${ext}`, buf)
      } else {
        brandingFolder?.file('logo.txt', 'Logo image could not be fetched.')
      }
    }
    if (Array.isArray(branding?.palette?.colors)) {
      brandingFolder?.file(
        'palette.json',
        JSON.stringify(
          {
            name: branding.palette.name || 'palette',
            colors: branding.palette.colors,
          },
          null,
          2
        )
      )
    }
  }

  // download zip
  const blob = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'bizassist-export.zip'
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}
