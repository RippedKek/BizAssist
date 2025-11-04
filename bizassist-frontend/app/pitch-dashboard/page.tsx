"use client";

import React, { useState } from "react";
import {
  Sparkles,
  FileText,
  Wand2,
  BookOpen,
  Settings,
  Download,
  TrendingUp,
  Award,
  Layers,
  Palette,
  Presentation,
  ChevronDown,
  Sun,
  Moon,
} from "lucide-react";
import Navbar from "../components/layout/Navbar";

/** Helpers for PDF building (shared by all download handlers) */
async function getPdfBits() {
  const [{ jsPDF }, autoTableModule] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  const autoTable = autoTableModule.default as (doc: any, opts: any) => any;
  return { jsPDF, autoTable };
}
const nowStr = () => new Date().toLocaleString();

const PitchDetailsPage = () => {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [expanded, setExpanded] = useState({
    market: true,
    ranker: true,
    pitch: true,
    branding: true,
    slides: true,
  });
  const [busy, setBusy] = useState<string | null>(null);

  const isDark = theme === "dark";

  const t = (cls: string, alt: string) => (isDark ? cls : alt);

  const toggle = (k: keyof typeof expanded) =>
    setExpanded((p) => ({ ...p, [k]: !p[k] }));

  /** ------------------------ DOWNLOADERS ------------------------ */
  const addHeader = (
    doc: any,
    title: string,
    primary: [number, number, number],
    pageW: number
  ) => {
    doc.setFillColor(...primary);
    doc.rect(0, 0, pageW, 48, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text(title, 40, 30);
    doc.setFontSize(10);
    doc.text(`Generated: ${nowStr()}`, pageW - 40, 30, { align: "right" });
  };

  const addSectionTitle = (doc: any, label: string, y: number, pageW: number) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(35, 35, 35);
    doc.text(label, 40, y);
    y += 12;
    doc.setDrawColor(210, 210, 210);
    doc.line(40, y, pageW - 40, y);
    return y + 16;
  };

  const addParagraph = (doc: any, text: string, y: number, pageW: number) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(70, 70, 70);
    const lines = doc.splitTextToSize(text, pageW - 80);
    lines.forEach((ln: string) => {
      doc.text(ln, 40, y);
      y += 14;
    });
    return y + 4;
  };

  const handleDownloadAll = async () => {
    if (busy) return;
    setBusy("all");
    try {
      const { jsPDF, autoTable } = await getPdfBits();
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const primary: [number, number, number] = isDark ? [37, 99, 235] : [16, 185, 129];

      addHeader(doc, "Overall Pitch Report", primary, pageW);
      let y = 48 + 40;

      // Pitch Overview
      y = addSectionTitle(doc, "Pitch Overview", y, pageW);
      y = addParagraph(
        doc,
        "Core business idea: Sustainable textile manufacturing using eco-friendly jute fibers. Target Audience: Socially conscious fashion brands in Europe.",
        y,
        pageW
      );

      // Market Analysis
      y = addSectionTitle(doc, "Market Analysis", y, pageW);
      y = addParagraph(
        doc,
        "Summary: Market size growing with EU sustainable mandates; target customers include boutique eco brands and private-label lines. Competition moderate; differentiation on supply transparency and fiber quality.",
        y,
        pageW
      );

      // IdeaRanker summary table (placeholder — detailed PDF available in its own section)
      y = addSectionTitle(doc, "IdeaRanker™ Summary", y, pageW);
      (autoTable as any)(doc, {
        startY: y,
        head: [["Metric", "Score", "Notes"]],
        body: [
          ["Novelty", "60", "Natural fiber + traceability"],
          ["Local Capability", "75", "Bangladesh strength in jute"],
          ["Feasibility", "80", "Proven supply & export lanes"],
          ["Sustainability", "70", "Low-impact fiber"],
          ["Global Demand", "90", "EU demand rising"],
        ],
        styles: { font: "helvetica", fontSize: 10, cellPadding: 6 },
        headStyles: { fillColor: primary, textColor: 255 },
        margin: { left: 40, right: 40 },
      });
      y = ((doc as any).lastAutoTable?.finalY ?? y) + 20;
      if (y > pageH - 100) {
        doc.addPage();
        y = 40;
      }

      // Structured Pitch
      y = addSectionTitle(doc, "Structured Pitch", y, pageW);
      y = addParagraph(
        doc,
        "Problem: Fashion brands need verifiably sustainable fibers with stable supply. Solution: EcoWeave delivers export-ready jute fabrics with digital traceability. Business Model: B2B fabric sales, premium for certified sustainability.",
        y,
        pageW
      );

      // Visual Branding
      y = addSectionTitle(doc, "Visual Branding", y, pageW);
      y = addParagraph(
        doc,
        "Brand direction: natural textures, teal + sand palette, clean geometric logomark referencing woven fibers.",
        y,
        pageW
      );

      // Slides
      y = addSectionTitle(doc, "Slides", y, pageW);
      y = addParagraph(doc, "Auto-generated deck: Problem • Solution • Market • Moat • Traction • GTM • Ask.", y, pageW);

      // Footer numbering
      const pages = doc.getNumberOfPages();
      for (let i = 1; i <= pages; i++) {
        doc.setPage(i);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(120, 120, 120);
        doc.text(`Page ${i} of ${pages}`, pageW - 40, doc.internal.pageSize.getHeight() - 16, {
          align: "right",
        });
      }
      doc.save("overall-pitch-report.pdf");
    } catch (e) {
      console.error(e);
      alert("Failed to generate overall report. Make sure jspdf & jspdf-autotable are installed.");
    } finally {
      setBusy(null);
    }
  };

  const handleDownloadMarket = async () => {
    if (busy) return;
    setBusy("market");
    try {
      const { jsPDF } = await getPdfBits();
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      const primary: [number, number, number] = isDark ? [37, 99, 235] : [16, 185, 129];
      addHeader(doc, "Market Analysis Report", primary, pageW);
      let y = 48 + 40;
      y = addSectionTitle(doc, "Market Analysis", y, pageW);
      y = addParagraph(
        doc,
        "Detailed insights into market size, target audience, and competitive landscape. Use the Market Dashboard page to export the full visual map & tables.",
        y,
        pageW
      );
      doc.save("market-analysis.pdf");
    } catch (e) {
      console.error(e);
      alert("Failed to export Market Analysis.");
    } finally {
      setBusy(null);
    }
  };

  const handleDownloadRanker = async () => {
    if (busy) return;
    setBusy("ranker");
    try {
      const { jsPDF } = await getPdfBits();
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      const primary: [number, number, number] = isDark ? [37, 99, 235] : [16, 185, 129];
      addHeader(doc, "IdeaRanker™ Report", primary, pageW);
      let y = 48 + 40;
      y = addSectionTitle(doc, "Summary", y, pageW);
      y = addParagraph(
        doc,
        "Scores & justifications for Novelty, Local Capability, Feasibility, Sustainability, and Global Demand. For the full radar chart and rich table, use the IdeaRanker page export.",
        y,
        pageW
      );
      doc.save("idearanker-report.pdf");
    } catch (e) {
      console.error(e);
      alert("Failed to export IdeaRanker report.");
    } finally {
      setBusy(null);
    }
  };

  const handleDownloadPitch = async () => {
    if (busy) return;
    setBusy("pitch");
    try {
      const { jsPDF } = await getPdfBits();
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      const primary: [number, number, number] = isDark ? [37, 99, 235] : [16, 185, 129];
      addHeader(doc, "Structured Pitch", primary, pageW);
      let y = 48 + 40;
      y = addSectionTitle(doc, "Pitch", y, pageW);
      y = addParagraph(
        doc,
        "Problem • Solution • Market • Business Model • GTM • Financials • Team • Ask. Replace with your generated pitch text blocks.",
        y,
        pageW
      );
      doc.save("structured-pitch.pdf");
    } catch (e) {
      console.error(e);
      alert("Failed to export Structured Pitch.");
    } finally {
      setBusy(null);
    }
  };

  const handleDownloadBranding = async () => {
    if (busy) return;
    setBusy("branding");
    try {
      const { jsPDF } = await getPdfBits();
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      const primary: [number, number, number] = isDark ? [37, 99, 235] : [16, 185, 129];
      addHeader(doc, "Visual Branding", primary, pageW);
      let y = 48 + 40;
      y = addSectionTitle(doc, "Brand Direction", y, pageW);
      y = addParagraph(
        doc,
        "Logo concepts, color palette, and typography. Export high-res assets from your branding workspace.",
        y,
        pageW
      );
      doc.save("visual-branding.pdf");
    } catch (e) {
      console.error(e);
      alert("Failed to export Branding.");
    } finally {
      setBusy(null);
    }
  };

  const handleDownloadSlides = async () => {
    if (busy) return;
    setBusy("slides");
    try {
      const { jsPDF } = await getPdfBits();
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      const primary: [number, number, number] = isDark ? [37, 99, 235] : [16, 185, 129];
      addHeader(doc, "Slide Deck (Summary)", primary, pageW);
      let y = 48 + 40;
      y = addSectionTitle(doc, "Deck Outline", y, pageW);
      y = addParagraph(
        doc,
        "Problem → Solution → Market → Product → Business Model → GTM → Traction → Roadmap → Financials → Ask.",
        y,
        pageW
      );
      doc.save("slides-summary.pdf");
    } catch (e) {
      console.error(e);
      alert("Failed to export Slides.");
    } finally {
      setBusy(null);
    }
  };

  /** ----------------------------- UI ----------------------------- */
  return (
    <div
      className={`min-h-screen ${
        isDark
          ? "bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white"
          : "bg-gradient-to-br from-gray-50 via-white to-gray-50 text-gray-900"
      }`}
    >
      <Navbar
        theme={theme}
        onThemeChange={(newTheme) => setTheme(newTheme)}
        showHomeLink
        showMyPitchesLink
        showLogout
      />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Breadcrumbs + Title Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              <a
                href="#"
                className="text-gray-400 text-sm font-medium hover:underline"
              >
                My Pitches
              </a>
              <span className="text-gray-400 text-sm font-medium">/</span>
              <span className={t("text-white", "text-gray-900") + " text-sm font-medium"}>
                EcoWeave Textiles Pitch
              </span>
            </div>
            <h1 className={t("text-white", "text-gray-900") + " text-4xl font-black"}>
              EcoWeave Textiles Pitch
            </h1>
            <p className="text-gray-400 text-base">
              A comprehensive overview of your generated business pitch assets.
            </p>
          </div>

          <div className="flex items-center gap-2">

            <button
              onClick={handleDownloadAll}
              disabled={busy === "all"}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
                isDark
                  ? "bg-gray-800 hover:bg-gray-700 text-white"
                  : "bg-white hover:bg-gray-100 text-gray-900 border border-gray-300"
              } disabled:opacity-60`}
              aria-label="Download overall report"
            >
              <Download className="w-4 h-4" />
              Download All Assets
            </button>
          </div>
        </div>

        {/* Pitch Overview Card */}
        <div
          className={`p-6 rounded-xl mb-8 ${
            isDark ? "bg-gray-800" : "bg-white border border-gray-200"
          }`}
        >
          <div className="flex flex-col md:flex-row items-start justify-between gap-6">
            <div className="flex flex-col gap-2 flex-1">
              <p className={t("text-white", "text-gray-900") + " text-xl font-bold"}>
                Pitch Overview
              </p>
              <p className="text-gray-400 text-sm">
                Core business idea: Sustainable textile manufacturing using eco-friendly
                jute fibers. Target Audience: Socially conscious fashion brands in
                Europe.
              </p>
            </div>
            <div
              className="w-full md:w-64 h-40 rounded-lg bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400')",
              }}
            />
          </div>
        </div>

        {/* Sections (each with its own download button) */}
        <div className="flex flex-col gap-3">
          {/* Market Analysis */}
          <div
            className={`rounded-lg ${
              isDark ? "bg-gray-800" : "bg-white border border-gray-200"
            }`}
          >
            <div className="w-full flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                <p className={t("text-white", "text-gray-900") + " text-base font-medium"}>
                  Market Analysis
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadMarket}
                  className="p-2 rounded-md hover:bg-black/10"
                  title="Download Market report"
                  aria-label="Download Market report"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggle("market")}
                  className="p-2 rounded-md hover:bg-black/10"
                  aria-label="Toggle section"
                >
                  <ChevronDown
                    className={`w-5 h-5 transition-transform ${
                      expanded.market ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>
            </div>
            {expanded.market && (
              <div className="px-6 pb-4 text-gray-400 text-sm">
                Detailed insights into market size, target audience, and competitive
                landscape. Content for market analysis would be displayed here,
                potentially with charts and data tables.
              </div>
            )}
          </div>

          {/* IdeaRanker */}
          <div
            className={`rounded-lg ${
              isDark ? "bg-gray-800" : "bg-white border border-gray-200"
            }`}
          >
            <div className="w-full flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-blue-500" />
                <p className={t("text-white", "text-gray-900") + " text-base font-medium"}>
                  IdeaRanker™ Score
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadRanker}
                  className="p-2 rounded-md hover:bg-black/10"
                  title="Download IdeaRanker report"
                  aria-label="Download IdeaRanker report"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggle("ranker")}
                  className="p-2 rounded-md hover:bg-black/10"
                  aria-label="Toggle section"
                >
                  <ChevronDown
                    className={`w-5 h-5 transition-transform ${
                      expanded.ranker ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>
            </div>
            {expanded.ranker && (
              <div className="px-6 pb-4 text-gray-400 text-sm">
                A breakdown of the IdeaRanker score, including viability, scalability,
                and market fit. This could be visualized with gauges or scorecards.
              </div>
            )}
          </div>

          {/* Structured Pitch */}
          <div
            className={`rounded-lg ${
              isDark ? "bg-gray-800" : "bg-white border border-gray-200"
            }`}
          >
            <div className="w-full flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <Layers className="w-5 h-5 text-blue-500" />
                <p className={t("text-white", "text-gray-900") + " text-base font-medium"}>
                  Structured Pitch
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadPitch}
                  className="p-2 rounded-md hover:bg-black/10"
                  title="Download Structured Pitch"
                  aria-label="Download Structured Pitch"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggle("pitch")}
                  className="p-2 rounded-md hover:bg-black/10"
                  aria-label="Toggle section"
                >
                  <ChevronDown
                    className={`w-5 h-5 transition-transform ${
                      expanded.pitch ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>
            </div>
            {expanded.pitch && (
              <div className="px-6 pb-4 text-gray-400 text-sm">
                The full, generated text of the business pitch, including sections for
                Problem, Solution, Business Model, etc.
              </div>
            )}
          </div>

          {/* Visual Branding */}
          <div
            className={`rounded-lg ${
              isDark ? "bg-gray-800" : "bg-white border border-gray-200"
            }`}
          >
            <div className="w-full flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <Palette className="w-5 h-5 text-blue-500" />
                <p className={t("text-white", "text-gray-900") + " text-base font-medium"}>
                  Visual Branding
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadBranding}
                  className="p-2 rounded-md hover:bg-black/10"
                  title="Download Branding"
                  aria-label="Download Branding"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggle("branding")}
                  className="p-2 rounded-md hover:bg-black/10"
                  aria-label="Toggle section"
                >
                  <ChevronDown
                    className={`w-5 h-5 transition-transform ${
                      expanded.branding ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>
            </div>
            {expanded.branding && (
              <div className="px-6 pb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`${
                        isDark ? "bg-gray-700" : "bg-gray-100"
                      } rounded-lg p-3 aspect-square flex items-center justify-center`}
                    >
                      <div className="text-6xl font-bold text-blue-500">
                        Logo {i}
                      </div>
                    </div>
                  ))}
                </div>
                <p className={t("text-white", "text-gray-900") + " mt-4 font-medium"}>
                  Color Palette & Typography shown here.
                </p>
              </div>
            )}
          </div>

          {/* Slides */}
          <div
            className={`rounded-lg ${
              isDark ? "bg-gray-800" : "bg-white border border-gray-200"
            }`}
          >
            <div className="w-full flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <Presentation className="w-5 h-5 text-blue-500" />
                <p className={t("text-white", "text-gray-900") + " text-base font-medium"}>
                  Generated Slide Deck
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadSlides}
                  className="p-2 rounded-md hover:bg-black/10"
                  title="Download Slides (summary)"
                  aria-label="Download Slides (summary)"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggle("slides")}
                  className="p-2 rounded-md hover:bg-black/10"
                  aria-label="Toggle section"
                >
                  <ChevronDown
                    className={`w-5 h-5 transition-transform ${
                      expanded.slides ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>
            </div>
            {expanded.slides && (
              <div className="px-6 pb-4 text-gray-400 text-sm">
                An embedded viewer could display the generated presentation slides.
                Use the download icon to export a quick summary PDF.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PitchDetailsPage;
