'use client';

import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Tooltip,
  GeoJSON as RLGeoJSON,
  useMap,
} from 'react-leaflet';
import type { FeatureCollection } from 'geojson';
import React, { useEffect, useMemo, useState } from 'react';
import L from 'leaflet';

type Market = { name: string; percentage: number };
type Props = { theme: 'dark' | 'light'; markets: Market[] };

const COORDS: Record<string, [number, number]> = {
  USA: [37.8, -96],
  Germany: [51.0, 10.0],
  Singapore: [1.3521, 103.8198],
  Japan: [36.2048, 138.2529],
  Australia: [-25.0, 133.0],
};

const COUNTRY_NAME_ALIASES: Record<string, string> = {
  USA: 'United States of America',
  UK: 'United Kingdom',
  SouthKorea: 'Republic of Korea',
};

function FitToPoints({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (!points.length) return;
    const b = L.latLngBounds(points.map(([lat, lng]) => [lat, lng]));
    map.fitBounds(b, { padding: [30, 30], maxZoom: 4 });
  }, [map, points]);
  return null;
}

function HighlightCountries({
  theme,
  countries,
}: {
  theme: 'dark' | 'light';
  countries: string[];
}) {
  const map = useMap();
  const [world, setWorld] = useState<FeatureCollection | null>(null);

  useEffect(() => {
    fetch('/data/ne_110m_admin_0_countries.geojson')
      .then((r) => r.json())
      .then(setWorld)
      .catch(() => setWorld(null));
  }, []);

  const normalize = (s: string) => s.trim().toLowerCase();
  const selected = useMemo(
    () =>
      new Set(
        countries.map((n) => COUNTRY_NAME_ALIASES[n] || n).map((n) => normalize(n))
      ),
    [countries]
  );

  const style = (feature: any) => {
    const name = (feature?.properties?.ADMIN || feature?.properties?.name || '') as string;
    const isTop = selected.has(normalize(name));
    const baseStroke = theme === 'dark' ? '#334155' : '#94a3b8';
    return {
      color: isTop ? '#2563eb' : baseStroke,
      weight: isTop ? 2 : 0.7,
      fillColor: '#2563eb',
      fillOpacity: isTop ? 0.25 : 0,
      opacity: 1,
    };
  };

  const onEachFeature = (feature: any, layer: L.Layer) => {
    const f = layer as L.Path;
    const name = (feature?.properties?.ADMIN || feature?.properties?.name || '') as string;
    const isTop = selected.has(name.trim().toLowerCase());
    if (isTop) {
      f.bindTooltip(`${name}`, {
        sticky: true,
        direction: 'top',
        className: theme === 'dark' ? 'map-tooltip-dark' : 'map-tooltip-light', // NEW
      });
      f.on('click', () => {
        const bounds = (f as any).getBounds?.();
        if (bounds) map.fitBounds(bounds, { padding: [30, 30] });
      });
    }
  };

  if (!world) return null;
  return <RLGeoJSON data={world as any} style={style} onEachFeature={onEachFeature} />;
}

export default function RealWorldMap({ theme, markets }: Props) {
  const isDark = theme === 'dark'; // NEW

  const top5 = useMemo(
    () => markets.slice().sort((a, b) => b.percentage - a.percentage).slice(0, 5),
    [markets]
  );

  const points = useMemo(
    () => top5.map((m) => COORDS[m.name]).filter(Boolean) as [number, number][],
    [top5]
  );

  // Basemap that matches theme (CARTO Positron/Dark Navy)
  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
  const attribution =
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors ' +
    '&copy; <a href="https://carto.com/basemaps">CARTO</a>';

  return (
    <div className="relative">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        scrollWheelZoom={true}
        worldCopyJump
        style={{ height: 420, width: '100%', borderRadius: 12, overflow: 'hidden' }}
        className={isDark ? 'map-dark' : 'map-light'} // NEW
      >
        <TileLayer url={tileUrl} attribution={attribution} />
        <FitToPoints points={points} />
        <HighlightCountries theme={theme} countries={top5.map((m) => m.name)} />

        {top5.map((m) => {
          const coords = COORDS[m.name];
          if (!coords) return null;
          const radius = 8 + (m.percentage / 100) * 22;
          return (
            <CircleMarker
              key={m.name}
              center={coords}
              radius={radius}
              pathOptions={{
                color: '#2563eb',
                weight: 2,
                fillOpacity: isDark ? 0.55 : 0.6, // NEW tiny tweak for contrast
              }}
            >
              <Tooltip
                direction="top"
                offset={[0, -8]}
                opacity={1}
                className={isDark ? 'map-tooltip-dark' : 'map-tooltip-light'} // NEW
              >
                <div className="text-sm">
                  <strong>{m.name}</strong>
                  <div>{m.percentage}% demand</div>
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Subtle tint so tiles blend with your Tailwind gray background (NEW) */}
      {isDark && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[12px]"
          style={{ mixBlendMode: 'multiply', background: '#0b1220', opacity: 0.18 }}
        />
      )}

      {/* "Top 5 countries" overlay */}
      <div className="pointer-events-none absolute left-3 top-3">
        <div className="pointer-events-auto rounded-lg px-3 py-2 text-xs font-semibold shadow-sm
                        bg-white/90 text-gray-900 dark:bg-gray-800/90 dark:text-white">
          Top 5: {top5.map((m) => m.name).join(' • ')}
        </div>
      </div>
    </div>
  );
}
