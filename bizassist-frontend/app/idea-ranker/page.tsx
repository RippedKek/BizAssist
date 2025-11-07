"use client";
// @ts-nocheck

import { Download, ExternalLink, Loader2, Share, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import IdeaRankerChatbot from "../components/IdeaRankerChatbot";
import Navbar from "../components/layout/Navbar";
import { upsertStep } from "../firebase/pitches";

type RankerData = {
  ideaTitle: string;
  overallScore: number;
  readinessLabel: string;
  scores: {
    novelty: { score: number; justification: string };
    localCapability: { score: number; justification: string };
    feasibility: { score: number; justification: string };
    sustainability: { score: number; justification: string };
    globalDemand: { score: number; justification: string };
  };
  nextSteps: Array<{ text: string }>;
};

type Competitor = {
  title: string;
  website: string;
  description: string;
};

const getDomainFromUrl = (url: string): string | null => {
  if (!url || url === "#") return null;
  try {
    const urlObj = new URL(url.startsWith("http") ? url : `https://${url}`);
    return urlObj.hostname.replace("www.", "");
  } catch {
    return null;
  }
};

const getLogoUrl = (domain: string | null): string | null => {
  if (!domain) return null;
  return `https://logo.clearbit.com/${domain}`;
};

type CompetitorsData = {
  competitors: Competitor[];
};

// Normalize API response into RankerData shape expected by UI
const normalizeRankerData = (raw: any): RankerData | null => {
  if (!raw) return null;
  // Handle both camelCase and snake_case keys from API
  const ideaTitle = raw.ideaTitle ?? raw.idea_title ?? "Your Business";
  const overallScore = Number(raw.overallScore ?? raw.overall_score ?? 0);
  const readinessLabel =
    raw.readinessLabel ?? raw.readiness_label ?? "Analyzing";
  const scoresRaw = raw.scores ?? raw.score_breakdown ?? {};

  const getScore = (obj: any, key: string, alt?: string) => {
    const v = obj?.[key] ?? (alt ? obj?.[alt] : undefined);
    if (v == null) return { score: 0, justification: "" };
    // Support forms: number or { score, justification }
    if (typeof v === "number" || typeof v === "string") {
      return { score: Number(v) || 0, justification: "" };
    }
    return {
      score: Number(v.score ?? 0) || 0,
      justification: String(v.justification ?? v.reason ?? ""),
    };
  };

  const scores = {
    novelty: getScore(scoresRaw, "novelty"),
    localCapability: getScore(scoresRaw, "localCapability", "local_capability"),
    feasibility: getScore(scoresRaw, "feasibility"),
    sustainability: getScore(scoresRaw, "sustainability"),
    globalDemand: getScore(scoresRaw, "globalDemand", "global_demand"),
  };

  const nextStepsArr = raw.nextSteps ?? raw.next_steps ?? [];
  const nextSteps = Array.isArray(nextStepsArr)
    ? nextStepsArr.map((s: any) => ({
        text: typeof s === "string" ? s : s?.text ?? "",
      }))
    : [];

  return { ideaTitle, overallScore, readinessLabel, scores, nextSteps };
};

const CompetitorCard = ({
  competitor,
  isDark,
}: {
  competitor: Competitor;
  isDark: boolean;
}) => {
  const [logoError, setLogoError] = useState(false);
  const domain = getDomainFromUrl(competitor.website);
  const logoUrl = getLogoUrl(domain);
  const safeTitle = competitor.title || "?";

  return (
    <div
      className={`p-6 rounded-xl border ${
        isDark
          ? "bg-gray-900/50 border-gray-700 hover:bg-gray-900"
          : "bg-gray-50 border-gray-200 hover:bg-white"
      } transition-all`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1">
          {logoUrl && !logoError ? (
            <img
              src={logoUrl}
              alt={`${safeTitle} logo`}
              className="w-10 h-10 rounded-lg object-contain bg-white p-1"
              onError={() => setLogoError(true)}
              onLoad={(e) => {
                const img = e.target as HTMLImageElement;
                if (!img.complete || img.naturalHeight === 0) {
                  setLogoError(true);
                }
              }}
            />
          ) : (
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                isDark
                  ? "bg-gray-700 text-gray-300"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {safeTitle.charAt(0).toUpperCase()}
            </div>
          )}
          <h3
            className={`text-lg font-bold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {safeTitle}
          </h3>
        </div>
        {competitor.website && competitor.website !== "#" && (
          <a
            href={competitor.website}
            target="_blank"
            rel="noopener noreferrer"
            className={`p-1.5 rounded-lg transition-colors ml-2 ${
              isDark
                ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                : "hover:bg-gray-200 text-gray-600 hover:text-gray-900"
            }`}
            aria-label={`Visit ${safeTitle} website`}
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>
      <p
        className={`text-sm leading-relaxed ${
          isDark ? "text-gray-300" : "text-gray-600"
        }`}
      >
        {competitor.description}
      </p>
    </div>
  );
};

const IdeaRankerPage = () => {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [summary, setSummary] = useState("");
  const [rankerData, setRankerData] = useState<RankerData | null>(null);
  const [competitors, setCompetitors] = useState<CompetitorsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCompetitors, setIsLoadingCompetitors] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDark = theme === "dark";

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      // First check if there's existing idea ranking data
      const storedRankingData = sessionStorage.getItem('bizassist-idea-ranking');
      if (storedRankingData) {
        try {
          const rankingData = JSON.parse(storedRankingData);
          if (rankingData.rankerData) {
            setRankerData(rankingData.rankerData);
            setSummary(rankingData.summary || '');
            setCompetitors(rankingData.competitors || null);
            setIsLoading(false);
            setIsLoadingCompetitors(false);
            return; // Don't fetch new data if we have existing analysis
          }
        } catch (e) {
          console.error('Error parsing existing idea ranking data:', e);
        }
      }

      // If no existing data, load basic data and fetch new
      const storedSummary = sessionStorage.getItem("bizassist-shared-summary");
      if (storedSummary) {
        setSummary(storedSummary);
        fetchIdeaRankerScore(storedSummary);
        fetchCompetitors(storedSummary);
      } else {
        setError("No business summary found. Please go back and create one.");
        setIsLoading(false);
        setIsLoadingCompetitors(false);
      }
    } catch (error) {
      console.error("Error retrieving summary:", error);
      setError("Failed to load business summary.");
      setIsLoading(false);
      setIsLoadingCompetitors(false);
    }
  }, []);

  const fetchIdeaRankerScore = async (summaryText: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const apiUrl = `${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      }/api/v1/idea-ranker`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary: summaryText }),
      });
      if (!response.ok) throw new Error("Failed to generate idea ranker score");
      const result = await response.json();
      const normalized = normalizeRankerData(result.data);
      setRankerData(normalized);
      try {
        const pitchId =
          typeof window !== "undefined"
            ? sessionStorage.getItem("bizassist-pitch-id")
            : null;
        if (pitchId) {
          await upsertStep(pitchId, "idea_ranking", {
            rankerData: normalized ?? result.data,
          });
        }
      } catch (e) {
        console.error("Error saving idea ranking:", e);
      }
    } catch (error) {
      console.error("Error fetching idea ranker score:", error);
      setError("Failed to generate analysis. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCompetitors = async (summaryText: string) => {
    setIsLoadingCompetitors(true);
    try {
      const apiUrl = `${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      }/api/v1/competitors`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary: summaryText }),
      });
      if (!response.ok) throw new Error("Failed to fetch competitors");
      const result = await response.json();
      setCompetitors(result.data);
      try {
        const pitchId =
          typeof window !== "undefined"
            ? sessionStorage.getItem("bizassist-pitch-id")
            : null;
        if (pitchId) {
          await upsertStep(pitchId, "idea_ranking", {
            competitors: result.data,
          });
        }
      } catch (e) {
        console.error("Error saving competitors:", e);
      }
    } catch (error) {
      console.error("Error fetching competitors:", error);
    } finally {
      setIsLoadingCompetitors(false);
    }
  };

  // Radar drawing with high-contrast labels + halos (prevents clipping)
  useEffect(() => {
    if (!rankerData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const BASE = 520;
    const DPR = Math.max(
      1,
      Math.floor(
        (typeof window !== "undefined" ? window.devicePixelRatio : 1) || 1
      )
    );
    canvas.style.width = `${BASE}px`;
    canvas.style.height = `${BASE}px`;
    canvas.width = BASE * DPR;
    canvas.height = BASE * DPR;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const sanitize = (val: any) => {
      const n = Number(val);
      if (!Number.isFinite(n)) return 0;
      return Math.max(0, Math.min(100, n));
    };

    // reset transform safely across browsers
    // @ts-ignore
    if (typeof ctx.resetTransform === "function") {
      // @ts-ignore
      ctx.resetTransform();
    } else {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    ctx.scale(DPR, DPR);

    const width = BASE;
    const height = BASE;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 40;

    const palette = isDark
      ? {
          grid: "rgba(148,163,184,0.45)",
          axis: "rgba(203,213,225,0.55)",
          label: "#F8FAFC",
          labelHalo: "rgba(11,18,32,0.95)",
          polyFill: "rgba(59,130,246,0.30)",
          polyStroke: "#60A5FA",
          point: "#60A5FA",
          pointOutline: "#0B1220",
        }
      : {
          grid: "rgba(71,85,105,0.40)",
          axis: "rgba(51,65,85,0.55)",
          label: "#0F172A",
          labelHalo: "rgba(255,255,255,0.98)",
          polyFill: "rgba(16,185,129,0.30)",
          polyStroke: "#059669",
          point: "#059669",
          pointOutline: "#FFFFFF",
        };

    const labels = [
      "Novelty",
      "Local Capability",
      "Feasibility",
      "Sustainability",
      "Global Demand",
    ];
    const data = [
      sanitize(rankerData.scores.novelty.score),
      sanitize(rankerData.scores.localCapability.score),
      sanitize(rankerData.scores.feasibility.score),
      sanitize(rankerData.scores.sustainability.score),
      sanitize(rankerData.scores.globalDemand.score),
    ];

    ctx.clearRect(0, 0, width, height);

    // Draw grid circles
    ctx.strokeStyle = palette.grid;
    ctx.lineWidth = 1.5;
    for (let i = 1; i <= 5; i++) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, (radius / 5) * i, 0, 2 * Math.PI);
      ctx.stroke();
    }

    // Draw axes
    const angleStep = (2 * Math.PI) / labels.length;
    ctx.strokeStyle = palette.axis;
    ctx.lineWidth = 1.25;
    for (let i = 0; i < labels.length; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    // Draw filled polygon (data area)
    ctx.beginPath();
    data.forEach((value, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const r = (value / 100) * radius;
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = palette.polyFill;
    ctx.fill();
    ctx.strokeStyle = palette.polyStroke;
    ctx.lineWidth = 2.25;
    ctx.stroke();

    // Draw data points
    data.forEach((value, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const r = (value / 100) * radius;
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = palette.point;
      ctx.fill();
      ctx.strokeStyle = palette.pointOutline;
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Labels (fancy layout)
    ctx.font = "600 15px Inter, system-ui, sans-serif";
    const pad = 8;
    for (let i = 0; i < labels.length; i++) {
      const label = labels[i];
      const angle = i * angleStep - Math.PI / 2;
      const baseR = radius + 28;
      let x = centerX + baseR * Math.cos(angle);
      let y = centerY + baseR * Math.sin(angle);

      const deg = ((angle * 180) / Math.PI + 360) % 360;
      let align: CanvasTextAlign = "center";
      let baseline: CanvasTextBaseline = "middle";
      if (deg >= 30 && deg <= 150) {
        align = "left";
        x += pad;
      } else if (deg >= 210 && deg <= 330) {
        align = "right";
        x -= pad;
      }
      if (deg > 330 || deg < 30) baseline = "bottom";
      else if (deg > 150 && deg < 210) baseline = "top";

      const w = ctx.measureText(label).width;
      if (align === "center")
        x = Math.max(pad + w / 2, Math.min(width - pad - w / 2, x));
      else if (align === "left") x = Math.min(width - pad - w, x);
      else x = Math.max(pad + w, x);
      y = Math.max(pad + 8, Math.min(height - pad - 8, y));

      ctx.textAlign = align;
      ctx.textBaseline = baseline;
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = palette.labelHalo;
      ctx.strokeText(label, x, y);

      ctx.fillStyle = palette.label;
      ctx.fillText(label, x, y);
    }
  }, [rankerData, theme, isDark]);

  const handleGeneratePitch = () => {
    if (typeof window !== "undefined" && summary) {
      try {
        sessionStorage.setItem("bizassist-shared-summary", summary);
      } catch (error) {
        console.error("Error storing summary:", error);
      }
    }
    window.location.href = "/pitch-generator";
  };

  const handleDownloadPDF = async () => {
    if (!rankerData) return;
    setIsDownloading(true);
    try {
      // @ts-ignore - runtime-only import without types
      const jsPDFModule = await import("jspdf");
      // @ts-ignore - runtime-only import without types
      const autoTableModule = await import("jspdf-autotable");
      const { jsPDF } = jsPDFModule as any;
      const autoTable = (autoTableModule as any).default as (
        doc: any,
        opts: any
      ) => any;

      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const M = 40;
      let y = M;

      const primary: [number, number, number] = isDark
        ? [59, 130, 246]
        : [16, 185, 129];
      const gray = (c: number) => [c, c, c] as [number, number, number];

      // Header
      doc.setFillColor(...primary);
      doc.rect(0, 0, pageW, 48, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(255, 255, 255);
      doc.text("IdeaRanker Report", M, 30);
      y = 48 + M;

      // Meta
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(...gray(40));
      doc.text(`Idea: ${rankerData.ideaTitle}`, M, y);
      y += 18;
      doc.text(
        `Overall: ${rankerData.overallScore}/100 — ${rankerData.readinessLabel}`,
        M,
        y
      );
      y += 14;
      doc.text(`Generated: ${new Date().toLocaleString()}`, M, y);
      y += 20;

      // Radar as image
      if (canvasRef.current) {
        const dataUrl = canvasRef.current.toDataURL("image/png");
        const w = pageW - M * 2;
        // keep the original aspect ratio
        const ratio = canvasRef.current.height / canvasRef.current.width;
        const h = w * ratio;
        doc.addImage(dataUrl, "PNG", M, y, w, h);
        y += h + 16;
      }

      // Scores table
      const rows = [
        [
          "Novelty",
          `${rankerData.scores.novelty.score}`,
          rankerData.scores.novelty.justification,
        ],
        [
          "Local Capability",
          `${rankerData.scores.localCapability.score}`,
          rankerData.scores.localCapability.justification,
        ],
        [
          "Feasibility",
          `${rankerData.scores.feasibility.score}`,
          rankerData.scores.feasibility.justification,
        ],
        [
          "Sustainability",
          `${rankerData.scores.sustainability.score}`,
          rankerData.scores.sustainability.justification,
        ],
        [
          "Global Demand",
          `${rankerData.scores.globalDemand.score}`,
          rankerData.scores.globalDemand.justification,
        ],
      ];
      autoTable(doc, {
        startY: y,
        head: [["Metric", "Score", "Justification"]],
        body: rows,
        styles: { font: "helvetica", fontSize: 10, cellPadding: 6 },
        headStyles: { fillColor: primary, textColor: 255 },
        margin: { left: M, right: M },
      });

      // Move cursor after scores table
      y = (doc as any).lastAutoTable?.finalY ?? y;

      // ----- Top Competitors (NEW) -----
      if (competitors?.competitors?.length) {
        y += 20;
        if (y > pageH - 80) {
          doc.addPage();
          y = M;
        }

        // Section title
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(...gray(25));
        doc.text("Top Competitors", M, y);
        y += 12;
        doc.setDrawColor(...gray(210));
        doc.line(M, y, pageW - M, y);
        y += 16;

        const compSlice = competitors.competitors.slice(0, 12);
        const compRows = compSlice.map((c) => {
          let host = "";
          try {
            host = c.website
              ? new URL(
                  c.website.startsWith("http")
                    ? c.website
                    : `https://${c.website}`
                ).host
              : "";
          } catch {
            host = c.website || "";
          }
          return [c.title || "-", host || "-", c.description || "-"];
        });

        autoTable(doc, {
          startY: y,
          head: [["Company", "Website", "What they do"]],
          body: compRows,
          theme: "grid",
          styles: {
            font: "helvetica",
            fontSize: 10,
            cellPadding: 6,
            overflow: "linebreak",
          },
          headStyles: { fillColor: primary, textColor: 255 },
          margin: { left: M, right: M },
          columnStyles: {
            0: { cellWidth: 140 },
            1: { cellWidth: 150 },
            // col 2 auto-expands
          },
        });

        y = (doc as any).lastAutoTable?.finalY ?? y;
      }

      // Next steps
      if (rankerData.nextSteps?.length) {
        y += 20;
        if (y > pageH - 80) {
          doc.addPage();
          y = M;
        }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(...gray(25));
        doc.text("Next Steps", M, y);
        y += 12;
        doc.setDrawColor(...gray(210));
        doc.line(M, y, pageW - M, y);
        y += 14;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(...gray(55));
        rankerData.nextSteps.forEach((s, i) => {
          const lines = doc.splitTextToSize(
            `${i + 1}. ${s.text}`,
            pageW - M * 2
          );
          lines.forEach((ln: string) => {
            if (y > pageH - 60) {
              doc.addPage();
              y = M;
            }
            doc.text(ln, M, y);
            y += 14;
          });
          y += 2;
        });
      }

      // Footer page numbers
      const pages = doc.getNumberOfPages();
      for (let i = 1; i <= pages; i++) {
        doc.setPage(i);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...gray(120));
        doc.text(
          `Page ${i} of ${pages}`,
          pageW - M,
          doc.internal.pageSize.getHeight() - 16,
          { align: "right" }
        );
      }

      doc.save("idearanker-report.pdf");
    } catch (e) {
      console.error(e);
      alert("Download failed. Ensure jspdf & jspdf-autotable are installed.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    try {
      const title = `IdeaRanker: ${rankerData?.ideaTitle ?? "Your Idea"}`;
      const text = `Overall ${rankerData?.overallScore ?? 0}/100 — ${
        rankerData?.readinessLabel ?? ""
      }`;
      const url = typeof window !== "undefined" ? window.location.href : "";
      if (navigator.share) {
        await navigator.share({ title, text, url });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${title}\n${text}\n${url}`);
        alert("Share link copied to clipboard.");
      }
    } catch {
      // user cancelled or clipboard error — ignore
    }
  };

  if (isLoading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDark ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <div className="text-center">
          <Loader2
            className={`w-12 h-12 animate-spin mx-auto mb-4 ${
              isDark ? "text-blue-500" : "text-emerald-500"
            }`}
          />
          <p
            className={`text-lg ${isDark ? "text-gray-300" : "text-gray-700"}`}
          >
            Analyzing your business idea...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDark ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <div className="text-center max-w-md">
          <div className={`text-6xl mb-4`}>⚠️</div>
          <p
            className={`text-lg mb-4 ${
              isDark ? "text-gray-300" : "text-gray-700"
            }`}
          >
            {error}
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className={`px-6 py-3 rounded-lg font-semibold ${
              isDark
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-emerald-600 hover:bg-emerald-700"
            } text-white`}
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

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
        onThemeChange={(newTheme: "dark" | "light") => setTheme(newTheme)}
        showHomeLink={true}
        showMyPitchesLink={true}
        showLogout={true}
      />

      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <div className="mb-12">
          <h1
            className={`text-5xl font-black mb-3 ${
              isDark
                ? "text-white"
                : "bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent"
            }`}
          >
            IdeaRanker Score for {rankerData?.ideaTitle || "Your Business"}
          </h1>
          <p
            className={`text-lg ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            Comprehensive analysis of your idea's potential in the Bangladesh
            market
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div
            className={`lg:col-span-2 p-8 rounded-2xl border ${
              isDark
                ? "bg-gray-800/50 border-gray-700"
                : "bg-white border-gray-200"
            } shadow-xl`}
          >
            <h2 className="text-xl font-bold mb-6">Performance Breakdown</h2>
            <div className="flex items-center justify-center p-4">
              {/* width/height will be set programmatically for DPR scaling */}
              <canvas ref={canvasRef} className="max-w-full" />
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div
              className={`p-8 rounded-2xl border ${
                isDark
                  ? "bg-gradient-to-br from-blue-600 to-blue-700 border-blue-500"
                  : "bg-gradient-to-br from-emerald-600 to-emerald-700 border-emerald-500"
              } text-white shadow-xl`}
            >
              <p className="text-lg font-semibold mb-2 opacity-90">
                Pitch Readiness Index
              </p>
              <p className="text-sm font-bold mb-4">
                {rankerData?.readinessLabel || "Analyzing..."}
              </p>
              <div className="flex items-end gap-2">
                <p className="text-7xl font-black">
                  {rankerData?.overallScore || 0}
                </p>
                <span className="text-4xl opacity-80 mb-2">/100</span>
              </div>
            </div>

            <div
              className={`p-8 rounded-2xl border ${
                isDark
                  ? "bg-gray-800/50 border-gray-700"
                  : "bg-white border-gray-200"
              } shadow-xl`}
            >
              <div className="flex items-center gap-2 mb-4">
                <svg
                  className="w-5 h-5 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                <h3 className="text-xl font-bold">Next Steps</h3>
              </div>
              {rankerData?.nextSteps && rankerData.nextSteps.length > 0 ? (
                <ul className="space-y-4">
                  {rankerData.nextSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div
                        className={`mt-1 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isDark ? "bg-blue-600" : "bg-emerald-600"
                        } text-white text-sm font-bold`}
                      >
                        {idx + 1}
                      </div>
                      <p
                        className={`text-sm leading-relaxed ${
                          isDark ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        {step.text}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p
                  className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Next steps will be generated based on your business
                  analysis...
                </p>
              )}
            </div>
          </div>
        </div>

        {competitors &&
          competitors.competitors &&
          competitors.competitors.length > 0 && (
            <div
              className={`rounded-2xl border ${
                isDark
                  ? "bg-gray-800/50 border-gray-700"
                  : "bg-white border-gray-200"
              } shadow-xl overflow-hidden mb-12`}
            >
              <div
                className={`p-8 border-b ${
                  isDark ? "border-gray-700" : "border-gray-200"
                }`}
              >
                <h2 className="text-2xl font-bold mb-2">Top Competitors</h2>
                <p
                  className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Key players in your market space
                </p>
              </div>
              <div className="p-8">
                {isLoadingCompetitors ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2
                      className={`w-8 h-8 animate-spin ${
                        isDark ? "text-blue-500" : "text-emerald-500"
                      }`}
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {competitors.competitors.map((competitor, idx) => (
                      <CompetitorCard
                        key={idx}
                        competitor={competitor}
                        isDark={isDark}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        <div
          className={`rounded-2xl border ${
            isDark
              ? "bg-gray-800/50 border-gray-700"
              : "bg-white border-gray-200"
          } shadow-xl overflow-hidden`}
        >
          <div
            className={`p-8 border-b ${
              isDark ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <h2 className="text-2xl font-bold">Detailed Score Breakdown</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 p-8">
            {rankerData &&
              Object.entries(rankerData.scores).map(([key, value], idx) => {
                const labels: Record<string, string> = {
                  novelty: "Novelty",
                  localCapability: "Local Capability",
                  feasibility: "Feasibility",
                  sustainability: "Sustainability",
                  globalDemand: "Global Demand",
                };
                const scoreValue = value as {
                  score: number;
                  justification: string;
                };
                return (
                  <div
                    key={key}
                    className={`flex flex-col gap-3 border-t py-6 ${
                      idx % 2 === 0 ? "md:pr-4" : "md:pl-4"
                    } ${isDark ? "border-gray-700" : "border-gray-200"}`}
                  >
                    <div className="flex items-center justify-between">
                      <p
                        className={`text-sm font-bold uppercase tracking-wide ${
                          isDark ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {labels[key] || key}
                      </p>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-bold ${
                          isDark
                            ? "bg-blue-600/20 text-blue-400"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {scoreValue.score}/100
                      </span>
                    </div>
                    <p
                      className={`text-sm leading-relaxed ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      {scoreValue.justification}
                    </p>
                  </div>
                );
              })}
          </div>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleGeneratePitch}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl ${
              isDark
                ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white"
                : "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white"
            }`}
            aria-label="Generate full pitch deck"
          >
            <Sparkles className="w-5 h-5" />
            Generate Full Pitch
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold transition-all ${
              isDark
                ? "bg-gray-800 hover:bg-gray-700 text-white"
                : "bg-gray-200 hover:bg-gray-300 text-gray-800"
            } disabled:opacity-60`}
            aria-label="Download IdeaRanker report as PDF"
          >
            {isDownloading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Download className="w-5 h-5" />
            )}
            {isDownloading ? "Preparing…" : "Download PDF"}
          </button>

          <button
            onClick={handleShare}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold transition-all ${
              isDark
                ? "bg-gray-800 hover:bg-gray-700 text-white"
                : "bg-gray-200 hover:bg-gray-300 text-gray-800"
            }`}
            aria-label="Share this analysis"
          >
            <Share className="w-5 h-5" />
            Share
          </button>
        </div>
      </main>

      {/* Idea Ranker Assistant Chatbot */}
      {rankerData && (
        <IdeaRankerChatbot
          rankerData={rankerData}
          competitors={competitors}
          theme={theme}
        />
      )}
    </div>
  );
};

export default IdeaRankerPage;
