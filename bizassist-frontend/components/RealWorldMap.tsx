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
  'United States': [37.8, -96],
  Germany: [51.0, 10.0],
  Singapore: [1.3521, 103.8198],
  Japan: [36.2048, 138.2529],
  Australia: [-25.0, 133.0],
  UK: [54.0, -2.0],
  'United Kingdom': [54.0, -2.0],
  Canada: [56.0, -106.0],
  France: [46.0, 2.0],
  Italy: [41.9, 12.5],
  Spain: [40.0, -4.0],
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
  SouthAfrica: [-30.6, 22.9],
  'South Africa': [-30.6, 22.9],
  Nigeria: [9.1, 8.7],
  Egypt: [26.1, 29.9],
  Kenya: [-0.0, 37.9],
  Morocco: [31.8, -5.5],
  Tunisia: [33.9, 9.6],
  Algeria: [28.0, 1.7],
  Ghana: [7.9, -1.0],
  IvoryCoast: [7.5, -5.5],
  'Ivory Coast': [7.5, -5.5],
  Senegal: [14.5, -14.5],
  Mali: [17.6, -4.0],
  BurkinaFaso: [12.2, -1.6],
  'Burkina Faso': [12.2, -1.6],
  Niger: [17.6, 8.1],
  Chad: [15.5, 18.7],
  Sudan: [12.9, 30.2],
  Ethiopia: [9.1, 38.8],
  Somalia: [5.2, 46.2],
  Uganda: [1.4, 32.3],
  Tanzania: [-6.4, 34.9],
  Rwanda: [-1.9, 29.9],
  Burundi: [-3.4, 29.9],
  Mozambique: [-18.7, 35.5],
  Zambia: [-13.1, 27.8],
  Zimbabwe: [-19.0, 29.9],
  Botswana: [-22.3, 24.7],
  Namibia: [-22.0, 17.1],
  Angola: [-11.2, 17.9],
  Madagascar: [-18.8, 46.9],
  Mauritius: [-20.3, 57.6],
  Seychelles: [-4.7, 55.5],
  Comoros: [-11.9, 43.3],
  Djibouti: [11.8, 42.6],
  Eritrea: [15.2, 39.8],
  Guinea: [9.9, -9.7],
  SierraLeone: [8.5, -11.8],
  'Sierra Leone': [8.5, -11.8],
  Liberia: [6.4, -9.4],
  GuineaBissau: [11.8, -15.2],
  'Guinea-Bissau': [11.8, -15.2],
  Gambia: [13.4, -15.3],
  'The Gambia': [13.4, -15.3],
  CapeVerde: [16.0, -24.0],
  'Cape Verde': [16.0, -24.0],
  SaoTomeAndPrincipe: [0.2, 6.6],
  'Sao Tome and Principe': [0.2, 6.6],
  EquatorialGuinea: [1.7, 10.3],
  'Equatorial Guinea': [1.7, 10.3],
  Gabon: [-0.8, 11.6],
  Cameroon: [7.4, 12.4],
  CentralAfricanRepublic: [6.6, 20.9],
  'Central African Republic': [6.6, 20.9],
  Congo: [-0.2, 15.8],
  'Republic of the Congo': [-0.2, 15.8],
  'Democratic Republic of the Congo': [-4.0, 21.8],
  'DRC': [-4.0, 21.8],
  'Congo-Kinshasa': [-4.0, 21.8],
  'Congo-Brazzaville': [-0.2, 15.8],
  'Republic of Congo': [-0.2, 15.8],
  'Congo Republic': [-0.2, 15.8],
  'Congo (Brazzaville)': [-0.2, 15.8],
  'Congo (Kinshasa)': [-4.0, 21.8],
  'Democratic Republic of Congo': [-4.0, 21.8],
  'DR Congo': [-4.0, 21.8],
  'Zaire': [-4.0, 21.8],
};

const COUNTRY_NAME_ALIASES: Record<string, string> = {
  USA: 'United States of America',
  'United States': 'United States of America',
  UK: 'United Kingdom',
  'United Kingdom': 'United Kingdom',
  SouthKorea: 'Republic of Korea',
  'South Korea': 'Republic of Korea',
  Germany: 'Germany',
  Singapore: 'Singapore',
  Japan: 'Japan',
  Australia: 'Australia',
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
    () => {
      const mapped = countries.map((n) => COUNTRY_NAME_ALIASES[n] || n).map((n) => normalize(n));
      console.log('HighlightCountries - countries:', countries);
      console.log('HighlightCountries - mapped:', mapped);
      return new Set(mapped);
    },
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
    f.setStyle(style(feature));
    const isTop = selected.has(normalize(name));
    if (isTop) {
      f.bindTooltip(`${name}`, {
        sticky: true,
        direction: 'top',
        className: theme === 'dark' ? 'map-tooltip-dark' : 'map-tooltip-light',
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
