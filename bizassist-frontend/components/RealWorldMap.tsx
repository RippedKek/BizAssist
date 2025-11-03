'use client';

import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Tooltip,
  GeoJSON as RLGeoJSON,
  useMap,
  Marker,
} from 'react-leaflet';
import type { FeatureCollection } from 'geojson';
import React, { useEffect, useMemo, useState } from 'react';
import L from 'leaflet';

/** ───────────────────────── TYPES ───────────────────────── **/
type Market = { name: string; percentage: number };
type Company = {
  name: string;
  lat: number;
  lng: number;
  type: 'company' | 'office';
  district?: string;
};
type Props = {
  theme: 'dark' | 'light';
  markets: Market[];               // may include buckets like “South Asia (excluding Bangladesh)”
  region: string;                  // 'international' | 'bangladesh'
  companies?: Company[];           // show only in BD mode
  topDistricts?: string[];         // optional list from AI to highlight in BD
};

/** ────────────────────── COORDS / ALIASES ────────────────────── **/
const COORDS: Record<string, [number, number]> = {
  USA: [37.8, -96],
  'United States': [37.8, -96],
  Germany: [51, 10],
  Singapore: [1.3521, 103.8198],
  Japan: [36.2048, 138.2529],
  Australia: [-25, 133],
  UK: [54, -2],
  'United Kingdom': [54, -2],
  Canada: [56, -106],
  France: [46, 2],
  Italy: [41.9, 12.5],
  Spain: [40, -4],
  Netherlands: [52.1, 5.3],
  Belgium: [50.5, 4.5],
  Sweden: [60.1, 18.6],
  Norway: [60.5, 8.5],
  Denmark: [56.3, 9.5],
  Finland: [61.9, 25.7],
  Poland: [51.9, 19.1],
  Austria: [47.5, 14.6],
  Switzerland: [46.8, 8.2],
  Ireland: [53.4, -8.2],
  Portugal: [39.4, -8.2],
  Greece: [39.1, 21.8],
  Czechia: [49.8, 15.5],
  Hungary: [47.2, 19.5],
  Slovakia: [48.7, 19.7],
  Slovenia: [46.1, 14.8],
  Croatia: [45.1, 15.2],
  Romania: [45.9, 24.9],
  Bulgaria: [42.7, 25.5],
  Estonia: [58.6, 25.0],
  Latvia: [56.9, 24.6],
  Lithuania: [55.2, 23.9],
  Luxembourg: [49.6, 6.1],
  Malta: [35.9, 14.4],
  Cyprus: [35.1, 33.4],

  Brazil: [-14.2, -51.9],
  Mexico: [23.6, -102.6],
  Argentina: [-38.4, -63.6],
  Chile: [-35.7, -71.5],
  Colombia: [4.6, -74.3],
  Peru: [-9.2, -75.0],
  Venezuela: [6.4, -66.6],
  Ecuador: [-1.8, -78.2],
  Bolivia: [-16.3, -63.6],
  Paraguay: [-23.4, -58.4],
  Uruguay: [-32.5, -55.8],

  China: [35.9, 104.2],
  India: [20.6, 78.9],
  Indonesia: [-0.8, 113.9],
  Malaysia: [4.2, 101.9],
  Thailand: [15.9, 100.9],
  Vietnam: [14.1, 108.3],
  Philippines: [12.9, 121.8],
  SouthKorea: [35.9, 127.8],
  'South Korea': [35.9, 127.8],
  Taiwan: [23.7, 121.0],
  HongKong: [22.3, 114.2],
  'Hong Kong': [22.3, 114.2],
  NewZealand: [-40.9, 174.9],
  'New Zealand': [-40.9, 174.9],

  // South Asia specifics
  Afghanistan: [33.9, 67.7],
  Pakistan: [30.4, 69.3],
  Nepal: [28.4, 84.1],
  Bhutan: [27.5, 90.4],
  'Sri Lanka': [7.9, 80.7],
  Maldives: [3.2, 73.2],
  Bangladesh: [23.7, 90.4],

  // More SE Asia
  Brunei: [4.5, 114.7],
  Cambodia: [12.6, 104.9],
  Laos: [19.9, 102.6],
  Myanmar: [21.9, 95.9],
  'Timor-Leste': [-8.8, 125.7],

  // Middle East core
  'United Arab Emirates': [24.0, 54.0],
  Qatar: [25.3, 51.2],
  Bahrain: [26.0, 50.5],
  Kuwait: [29.3, 47.5],
  Oman: [20.6, 56.1],
  Yemen: [15.6, 48.5],
  'Saudi Arabia': [23.9, 45.1],
  Jordan: [31.2, 36.5],
  Lebanon: [33.9, 35.9],
  Israel: [31.0, 35.0],
  Palestine: [31.9, 35.2],
  Syria: [34.8, 39.0],
  Iraq: [33.2, 43.7],
  Iran: [32.4, 53.7],
  Turkey: [39.0, 35.0],
  Egypt: [26.1, 29.9],
};

const COUNTRY_NAME_ALIASES: Record<string, string> = {
  USA: 'United States of America',
  'United States': 'United States of America',
  UK: 'United Kingdom',
  'United Kingdom': 'United Kingdom',
  SouthKorea: 'Republic of Korea',
  'South Korea': 'Republic of Korea',
  UAE: 'United Arab Emirates',
  Türkiye: 'Turkey',
  'Lao PDR': 'Laos',
  Burma: 'Myanmar',
  'East Timor': 'Timor-Leste',
  'State of Palestine': 'Palestine',
  'Cote dIvoire': 'Ivory Coast',
  "Côte d'Ivoire": 'Ivory Coast',
  Germany: 'Germany',
  Singapore: 'Singapore',
  Japan: 'Japan',
  Australia: 'Australia',
};

const normalize = (s: string) => s.trim().toLowerCase();

/** ───────────── REGION → COUNTRY EXPANSIONS (buckets) ─────────────
 * South Asia: Afghanistan, Bangladesh, Bhutan, India, Maldives, Nepal, Pakistan, Sri Lanka
 * Southeast Asia: Brunei, Cambodia, Indonesia, Laos, Malaysia, Myanmar, Philippines, Singapore, Thailand, Vietnam, Timor-Leste
 * Middle East: Bahrain, Egypt, Iran, Iraq, Israel, Jordan, Kuwait, Lebanon, Oman, Palestine, Qatar, Saudi Arabia, Syria, Turkey, UAE, Yemen
 */
const REGION_EXPANSIONS: Record<string, string[]> = {
  'south asia': [
    'Afghanistan', 'Bangladesh', 'Bhutan', 'India', 'Maldives', 'Nepal', 'Pakistan', 'Sri Lanka',
  ],
  'southeast asia': [
    'Brunei', 'Cambodia', 'Indonesia', 'Laos', 'Malaysia', 'Myanmar',
    'Philippines', 'Singapore', 'Thailand', 'Vietnam', 'Timor-Leste',
  ],
  'middle east': [
    'Bahrain', 'Egypt', 'Iran', 'Iraq', 'Israel', 'Jordan', 'Kuwait', 'Lebanon',
    'Oman', 'Palestine', 'Qatar', 'Saudi Arabia', 'Syria', 'Turkey', 'United Arab Emirates', 'Yemen',
  ],
};

/** ───────────────── BANGLADESH DISTRICT CANONICALIZATION ───────────────── **/
const BD_ALIAS: Record<string, string> = {
  chittagong: 'Chattogram',
  comilla: 'Cumilla',
  barisal: 'Barishal',
  jessore: 'Jashore',
  bogra: 'Bogura',
  // common punctuation variants
  "dhaka (metropolitan area)": 'Dhaka',
};

const loose = (s: string) => s.toLowerCase().replace(/['’\-.]/g, '').replace(/\s+/g, ' ').trim();
const canonicalDistrict = (maybe?: string | null) => {
  if (!maybe) return null;
  const l = loose(maybe);
  if (BD_ALIAS[l]) return BD_ALIAS[l];
  // title-case first letter (fallback)
  return maybe.replace(/\s+/g, ' ').trim();
};

/** ───────────────────────── HELPERS ───────────────────────── **/
function insideBangladesh(lat: number, lng: number) {
  return lat >= 20.5 && lat <= 26.6 && lng >= 88.0 && lng <= 92.7;
}

const alias = (name: string) => COUNTRY_NAME_ALIASES[name] || name;

function parseExampleCountries(segment: string): string[] {
  const m = segment.match(/\(([^)]*)\)/);
  if (!m) return [];
  const raw = m[1]
    .replace(/\b(e\.?g\.?|i\.?e\.?)\b[:,-]?\s*/gi, '')
    .trim();
  if (!raw) return [];
  return raw
    .split(/[,/]| and /i)
    .map((s) => s.trim())
    .filter(Boolean);
}

function expandSegmentToCountries(segmentRaw: string): string[] {
  let segment = segmentRaw.trim();
  const examples = parseExampleCountries(segment).map(alias);
  segment = segment.replace(/\([^)]*\)/g, '').trim();

  const segLower = segment.toLowerCase();
  const excludingBD = /excluding\s+bangladesh/i.test(segmentRaw);

  let base: string[] = [];
  if (segLower.includes('south asia')) base = REGION_EXPANSIONS['south asia'];
  else if (segLower.includes('southeast asia')) base = REGION_EXPANSIONS['southeast asia'];
  else if (segLower.includes('middle east')) base = REGION_EXPANSIONS['middle east'];
  else {
    return [alias(segment)];
  }

  const set = new Set(base.map(alias));
  if (excludingBD) set.delete('Bangladesh');
  for (const ex of examples) set.add(alias(ex));
  return Array.from(set);
}

function expandMarketsToCountries(markets: Market[]): string[] {
  const out = new Set<string>();
  for (const m of markets) {
    const parts = m.name.split('•').map((s) => s.trim()).filter(Boolean);
    for (const p of parts) for (const c of expandSegmentToCountries(p)) out.add(c);
  }
  return Array.from(out);
}

// Extract candidate BD districts from markets if the AI listed them there
function extractDistrictsFromMarkets(markets: Market[]): string[] {
  const out = new Set<string>();
  for (const m of markets) {
    // pull text inside parentheses too, e.g., "Dhaka (Metropolitan Area)"
    const segs = m.name.split('•').map((s) => s.trim()).filter(Boolean);
    for (const seg of segs) {
      const inside = seg.match(/\(([^)]*)\)/)?.[1] || '';
      const allBits = [seg.replace(/\([^)]*\)/g, ''), ...inside.split(/,|\band\b/i)];
      for (const bit of allBits) {
        const c = canonicalDistrict(bit.trim());
        if (c) out.add(c);
      }
    }
  }
  return Array.from(out);
}

/** ───────────────────── VIEW CONTROLLER ───────────────────── **/
function FitToRegion({
  region,
  points,
}: {
  region: string;
  points: [number, number][];
}) {
  const map = useMap();

  useEffect(() => {
    map.whenReady(() => {
      const bdBounds = L.latLngBounds([[20.5, 88.0], [26.6, 92.7]]);
      const worldBounds = L.latLngBounds([[-85, -180], [85, 180]]);

      map.stop(); // prevent animation race causing classList errors

      if (region === 'bangladesh') {
        map.setMaxBounds(bdBounds);
        map.fitBounds(bdBounds, { padding: [30, 30], maxZoom: 8, animate: false });
      } else {
        // Zoom to the selection of highlighted countries (tighter than full world)
        if (points.length >= 1) {
          const b = L.latLngBounds(points.map(([lat, lng]) => [lat, lng]));
          map.setMaxBounds(worldBounds);
          map.fitBounds(b, { padding: [40, 40], maxZoom: 4, animate: false });
        } else {
          map.setMaxBounds(worldBounds);
          map.fitWorld({ padding: [20, 20], animate: false });
        }
      }
    });
  }, [map, region, points]);

  return null;
}

/** ─────────────── POLYGON HIGHLIGHTING (fills) ─────────────── **/
function HighlightPolygons({
  theme,
  countries,
  region,
  highlightDistricts = [],
}: {
  theme: 'dark' | 'light';
  countries: string[];
  region: string;
  highlightDistricts?: string[];
}) {
  const map = useMap();
  const [world, setWorld] = useState<FeatureCollection | null>(null);
  const [bangladeshDistricts, setBangladeshDistricts] = useState<FeatureCollection | null>(null);

  // own pane so fills sit above tiles
  useEffect(() => {
    if (!map.getPane('highlight-pane')) {
      const p = map.createPane('highlight-pane');
      p.style.zIndex = '450';
    }
  }, [map]);

  useEffect(() => {
    fetch('/data/ne_110m_admin_0_countries.geojson')
      .then((r) => r.json())
      .then(setWorld)
      .catch(() => setWorld(null));
  }, []);

  useEffect(() => {
    if (region === 'bangladesh') {
      fetch('https://raw.githubusercontent.com/fahimreza-dev/bangladesh-geojson/master/bd-districts.json')
        .then((r) => r.json())
        .then((data) => {
          if (data && (data.type === 'FeatureCollection' || data.type === 'Feature')) setBangladeshDistricts(data);
          else setBangladeshDistricts(null);
        })
        .catch(() => setBangladeshDistricts(null));
    } else {
      setBangladeshDistricts(null);
    }
  }, [region]);

  const selectedCountries = useMemo(() => {
    const mapped = countries.map((n) => COUNTRY_NAME_ALIASES[n] || n).map((n) => normalize(n));
    return new Set(mapped);
  }, [countries]);

  const highlightDistrictSet = useMemo(
    () => new Set((highlightDistricts || []).filter(Boolean).map((d) => d.trim().toLowerCase())),
    [highlightDistricts]
  );

  // Palette (teal to match UI)
  const TEAL_FILL = '#14b8a6';
  const TEAL_STROKE = '#0f766e';
  const neutralFill = theme === 'dark' ? '#0f172a' : '#cbd5e1';

  const countryStyle = (feature: any) => {
    const name = (feature?.properties?.ADMIN || feature?.properties?.name || '') as string;
    const isTop = selectedCountries.has(normalize(name));
    return isTop
      ? { pane: 'highlight-pane', color: TEAL_STROKE, weight: 1.5, fill: true, fillColor: TEAL_FILL, fillOpacity: 0.75, opacity: 1 }
      : { pane: 'highlight-pane', color: '#00000000', weight: 0, fill: true, fillColor: neutralFill, fillOpacity: 0.10, opacity: 1 };
  };

  const districtStyle = (feature: any) => {
    const name = (feature?.properties?.name || '') as string;
    const isTop = highlightDistrictSet.has(name.trim().toLowerCase());
    const baseStroke = theme === 'dark' ? '#334155' : '#94a3b8';
    return isTop
      ? { pane: 'highlight-pane', color: TEAL_STROKE, weight: 2, fill: true, fillColor: TEAL_FILL, fillOpacity: 0.78, opacity: 1 }
      : { pane: 'highlight-pane', color: baseStroke, weight: 1, fill: true, fillColor: '#10b981', fillOpacity: 0.18, opacity: 1 };
  };

  const onEachCountry = (feature: any, layer: L.Layer) => {
    const f = layer as L.Path;
    f.setStyle(countryStyle(feature));
    const name = (feature?.properties?.ADMIN || feature?.properties?.name || '') as string;
    if (selectedCountries.has(normalize(name))) {
      f.bindTooltip(`${name}`, {
        sticky: true,
        direction: 'top',
        className: theme === 'dark' ? 'map-tooltip-dark' : 'map-tooltip-light',
      });
    }
  };

  const onEachDistrict = (feature: any, layer: L.Layer) => {
    const f = layer as L.Path;
    const name = (feature?.properties?.name || '') as string;
    f.setStyle(districtStyle(feature));
    f.bindTooltip(`${name}`, {
      sticky: true,
      direction: 'top',
      className: theme === 'dark' ? 'map-tooltip-dark' : 'map-tooltip-light',
    });
  };

  return (
    <>
      {region !== 'bangladesh' && world && (
        <RLGeoJSON data={world as any} style={countryStyle} onEachFeature={onEachCountry} pane="highlight-pane" />
      )}
      {region === 'bangladesh' && bangladeshDistricts && (
        <RLGeoJSON data={bangladeshDistricts as any} style={districtStyle} onEachFeature={onEachDistrict} pane="highlight-pane" />
      )}
    </>
  );
}

/** ───────────────────────── MAIN MAP ───────────────────────── **/
export default function RealWorldMap({ theme, markets, region, companies = [], topDistricts = [] }: Props) {
  const isDark = theme === 'dark';

  // Top-5 (sort by percentage)
  const top5 = useMemo(
    () => markets.slice().sort((a, b) => b.percentage - a.percentage).slice(0, 5),
    [markets]
  );

  // Expand AI markets (including buckets with examples) → concrete country list
  const expandedCountries = useMemo(() => expandMarketsToCountries(top5), [top5]);

  // For international fit: build a bounds from highlighted country centroids
  const internationalPoints = useMemo(
    () =>
      expandedCountries
        .map((name) => {
          const key = COUNTRY_NAME_ALIASES[name] || name;
          return COORDS[key] || COORDS[name];
        })
        .filter(Boolean) as [number, number][],
    [expandedCountries]
  );

  // BD districts to strongly highlight (prop + any districts inferred from markets)
  const bdDistrictHits = useMemo(() => {
    const inferred = extractDistrictsFromMarkets(top5);
    const merged = new Set<string>([
      ...topDistricts.map(canonicalDistrict).filter(Boolean) as string[],
      ...inferred.map(canonicalDistrict).filter(Boolean) as string[],
    ]);
    return Array.from(merged);
  }, [top5, topDistricts]);

  // Only show pins in BD mode
  const visibleCompanies = useMemo(() => {
    if (region !== 'bangladesh') return [];
    return companies.filter((c) => insideBangladesh(c.lat, c.lng));
  }, [companies, region]);

  // Emoji icons for pins
  const companyIcon = useMemo(
    () =>
      L.divIcon({
        className: 'icon-company',
        html: `<div style="font-size:20px; line-height:20px">🏭</div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      }),
    []
  );
  const officeIcon = useMemo(
    () =>
      L.divIcon({
        className: 'icon-office',
        html: `<div style="font-size:20px; line-height:20px">🏢</div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      }),
    []
  );

  /** Free-tier tiles (MapTiler/Geoapify/Stadia) */
  let PROVIDER = process.env.NEXT_PUBLIC_MAP_PROVIDER ?? 'maptiler';
  const MT_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY || '';
  const GEO_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_KEY || '';

  if (PROVIDER === 'maptiler' && !MT_KEY) {
    console.warn('MapTiler key missing; falling back to Stadia tiles');
    PROVIDER = 'stadia';
  }

  let tileUrl = '';
  let attribution = '';
  if (PROVIDER === 'maptiler') {
    tileUrl = isDark
      ? `https://api.maptiler.com/maps/streets-v2-dark/256/{z}/{x}/{y}.png?key=${MT_KEY}`
      : `https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=${MT_KEY}`;
    attribution =
      '<a href="https://www.maptiler.com/copyright/" target="_blank">© MapTiler</a> ' +
      '<a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap contributors</a>';
  } else if (PROVIDER === 'geoapify') {
    const style = isDark ? 'dark-matter-blue' : 'osm-carto';
    tileUrl = `https://maps.geoapify.com/v1/tile/${style}/{z}/{x}/{y}.png?apiKey=${GEO_KEY}`;
    attribution = '© OpenStreetMap contributors, © Geoapify';
  } else {
    tileUrl = isDark
      ? 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png'
      : 'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png';
    attribution = '© OpenMapTiles © OpenStreetMap contributors © Stadia Maps';
  }

  return (
    <div className="relative">
      <MapContainer
        center={[20, 0]}
        zoom={3}
        minZoom={2}
        scrollWheelZoom
        worldCopyJump
        maxBoundsViscosity={1}
        zoomAnimation={false}
        fadeAnimation={false}
        markerZoomAnimation={false}
        style={{ height: 420, width: '100%', borderRadius: 12, overflow: 'hidden' }}
        className={isDark ? 'map-dark' : 'map-light'}
      >
        <TileLayer url={tileUrl} attribution={attribution} />

        {/* Auto snap & lock to region (no animation to avoid classList crash) */}
        <FitToRegion region={region} points={internationalPoints} />

        {/* POLYGONS: strong fills for selected countries / BD districts */}
        <HighlightPolygons
          theme={theme}
          countries={expandedCountries}
          region={region}
          highlightDistricts={bdDistrictHits}
        />

        {/* DEMAND BUBBLES (international only) */}
        {region !== 'bangladesh' &&
          internationalPoints.map(([lat, lng], idx) => (
            <CircleMarker
              key={`bubble-${idx}`}
              center={[lat, lng]}
              radius={10}
              pathOptions={{ color: '#2563eb', weight: 2, fillOpacity: isDark ? 0.55 : 0.6 }}
            />
          ))}

        {/* COMPANIES/OFFICES — show only in Bangladesh */}
        {region === 'bangladesh' &&
          visibleCompanies.map((c) => (
            <Marker
              key={`${c.name}-${c.lat}-${c.lng}`}
              position={[c.lat, c.lng]}
              icon={c.type === 'company' ? companyIcon : officeIcon}
            >
              <Tooltip
                direction="top"
                offset={[0, -8]}
                opacity={1}
                className={isDark ? 'map-tooltip-dark' : 'map-tooltip-light'}
              >
                <div className="text-sm">
                  <strong>{c.name}</strong>
                  <div>
                    {c.type}
                    {c.district ? ` • ${c.district}` : ''}
                  </div>
                </div>
              </Tooltip>
            </Marker>
          ))}
      </MapContainer>

      {/* Dark theme tint */}
      {isDark && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[12px]"
          style={{ mixBlendMode: 'multiply', background: '#0b1220', opacity: 0.18 }}
        />
      )}

      {/* Overlay */}
      <div className="pointer-events-none absolute left-3 top-3">
        <div
          className="pointer-events-auto rounded-lg px-3 py-2 text-xs font-semibold shadow-sm
                        bg-white/90 text-gray-900 dark:bg-gray-800/90 dark:text-white"
        >
          {region === 'bangladesh'
            ? `Highlighted districts: ${bdDistrictHits.slice(0, 6).join(' • ')}${bdDistrictHits.length > 6 ? '…' : ''}`
            : `Highlighted countries: ${expandedCountries.slice(0, 6).join(' • ')}${expandedCountries.length > 6 ? '…' : ''}`}
        </div>
      </div>
    </div>
  );
}
