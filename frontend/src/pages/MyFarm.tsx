
import { useEffect, useRef, useState, type FormEvent } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { geoArea, A } from '../utils/units';
import { searchPlaces, type Place } from '../services/api';
import type { Farm, Units } from '../types';

type P = {
  lat: number;
  lng: number;
};

const STORAGE_PREFIX = 'prithvix.boundaries.v1';

function storageKey(farmKey: string) {
  return `${STORAGE_PREFIX}:${farmKey}`;
}

function readBoundaries(key: string): P[][] {
  try {
    const raw = localStorage.getItem(storageKey(key));
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (polygon): polygon is P[] =>
        Array.isArray(polygon) &&
        polygon.length >= 3 &&
        polygon.every(
          point =>
            typeof point.lat === 'number' &&
            Number.isFinite(point.lat) &&
            typeof point.lng === 'number' &&
            Number.isFinite(point.lng)
        )
    );
  } catch {
    return [];
  }
}

export default function MyFarm({
  farm,
  units,
  onLocate
}: {
  farm: Farm;
  units: Units;
  onLocate: (lat: number, lng: number, name?: string) => void;
}) {
  // Map references
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layers = useRef<L.Polygon[]>([]);
  const marker = useRef<L.CircleMarker | null>(null);

  // Drawing references
  const mode = useRef<'idle' | 'draw' | 'set'>('idle');
  const pts = useRef<L.LatLng[]>([]);
  const tmp = useRef<L.Polygon | null>(null);

  // Plot data
  const [boundaries, setBoundaries] = useState<P[][]>([]);
  const boundariesRef = useRef<P[][]>([]);

  // Search
  const [msg, setMsg] = useState('');
  const [q, setQ] = useState('');
  const [res, setRes] = useState<Place[]>([]);
  const [busy, setBusy] = useState(false);

  const [mapReady, setMapReady] = useState(false);

  // Keep state and reference synchronized.
  const commitBoundaries = (next: P[][]) => {
    boundariesRef.current = next;
    setBoundaries(next);

    try {
      localStorage.setItem(
        storageKey(farm.key),
        JSON.stringify(next)
      );
    } catch {
      setMsg('Unable to save plots. Check browser storage permissions.');
    }
  };

  // Draw one polygon on the map.
  const renderPolygon = (coordinates: P[]) => {
    if (!map.current) return;

    const polygon = L.polygon(
      coordinates.map(p => [p.lat, p.lng] as L.LatLngTuple),
      {
        color: '#6B8A57',
        weight: 2,
        fillColor: '#91B879',
        fillOpacity: 0.3
      }
    ).addTo(map.current);

    layers.current.push(polygon);
  };

  // Add a new plot and persist it.
  const add = (coordinates: P[]) => {
    if (coordinates.length < 3) {
      setMsg('A plot requires at least three boundary points.');
      return;
    }

    const next = [
      ...boundariesRef.current,
      coordinates
    ];

    commitBoundaries(next);
    renderPolygon(coordinates);

    setMsg(`Plot ${next.length} saved successfully.`);
  };

  // Initialize or recreate the map when the farm changes.
  useEffect(() => {
    if (!el.current) return;

    const m = L.map(el.current, {
      doubleClickZoom: false,
      zoomControl: true
    }).setView([farm.lat, farm.lng], 15);

    map.current = m;
    layers.current = [];
    marker.current = null;
    tmp.current = null;
    pts.current = [];
    mode.current = 'idle';

    setMapReady(false);

    // Satellite imagery.
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 19,
        attribution: 'Imagery © Esri'
      }
    ).addTo(m);

    // Farm location marker.
    marker.current = L.circleMarker(
      [farm.lat, farm.lng],
      {
        radius: 8,
        color: '#ffffff',
        weight: 2,
        fillColor: '#1F3D2B',
        fillOpacity: 1
      }
    ).addTo(m);

    // Restore saved boundaries for this farm.
    const saved = readBoundaries(farm.key);

    boundariesRef.current = saved;
    setBoundaries(saved);

    saved.forEach(renderPolygon);

    setMapReady(true);

    // Handle map clicks.
    const handleClick = (e: L.LeafletMouseEvent) => {
      // Set farm location mode.
      if (mode.current === 'set') {
        mode.current = 'idle';

        onLocate(
          e.latlng.lat,
          e.latlng.lng,
          'Selected farm location'
        );

        setMsg('Farm location selected.');
        return;
      }

      // Draw boundary mode.
      if (mode.current !== 'draw') return;

      const last = pts.current[pts.current.length - 1];

      // Prevent duplicate consecutive points.
      if (
        last &&
        last.distanceTo(e.latlng) < 1
      ) {
        return;
      }

      pts.current.push(e.latlng);

      tmp.current?.remove();

      if (pts.current.length >= 2) {
        tmp.current = L.polygon(
          pts.current,
          {
            color: '#E3D9C0',
            weight: 3,
            dashArray: '5,5'
          }
        ).addTo(m);
      }

      setMsg(
        `${pts.current.length} boundary points selected. Double-click to finish.`
      );
    };

    // Finish drawing.
    const handleDoubleClick = (e: L.LeafletMouseEvent) => {
      if (mode.current !== 'draw') return;

      e.originalEvent.preventDefault();

      tmp.current?.remove();
      tmp.current = null;

      if (pts.current.length < 3) {
        setMsg('Select at least three corners before finishing.');
        return;
      }

      const coordinates: P[] = pts.current.map(p => ({
        lat: p.lat,
        lng: p.lng
      }));

      pts.current = [];
      mode.current = 'idle';

      add(coordinates);
    };

    m.on('click', handleClick);
    m.on('dblclick', handleDoubleClick);

    return () => {
      m.off('click', handleClick);
      m.off('dblclick', handleDoubleClick);

      m.remove();

      map.current = null;
      layers.current = [];
      marker.current = null;
      tmp.current = null;
      pts.current = [];
    };
    // Reinitialize only when the selected farm changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farm.key, farm.lat, farm.lng]);

  // Add an example boundary around the selected farm.
  const example = () => {
    const d = 0.0012;
    const e = d / Math.cos(farm.lat * Math.PI / 180);

    const coordinates: P[] = [
      { lat: farm.lat + d, lng: farm.lng - e },
      { lat: farm.lat + d, lng: farm.lng + e },
      { lat: farm.lat - d, lng: farm.lng + e },
      { lat: farm.lat - d, lng: farm.lng - e }
    ];

    add(coordinates);

    map.current?.fitBounds(
      L.latLngBounds(
        coordinates.map(p => [p.lat, p.lng] as L.LatLngTuple)
      ),
      { padding: [30, 30] }
    );
  };

  // Start drawing.
  const startDrawing = () => {
    mode.current = 'draw';
    pts.current = [];

    tmp.current?.remove();
    tmp.current = null;

    setMsg('Drawing mode: click each plot corner, then double-click to finish.');
  };

  // Delete a selected plot.
  const del = (index: number) => {
    const next = boundariesRef.current.filter(
      (_, i) => i !== index
    );

    // Remove old map polygons.
    layers.current.forEach(layer => layer.remove());
    layers.current = [];

    commitBoundaries(next);

    // Redraw remaining polygons.
    next.forEach(renderPolygon);

    setMsg(`Plot ${index + 1} deleted.`);
  };

  // Delete all plots.
  const clearAll = () => {
    if (!boundariesRef.current.length) return;

    const confirmed = window.confirm(
      'Are you sure you want to delete all saved plots for this farm?'
    );

    if (!confirmed) return;

    layers.current.forEach(layer => layer.remove());
    layers.current = [];

    tmp.current?.remove();
    tmp.current = null;

    pts.current = [];
    mode.current = 'idle';

    commitBoundaries([]);

    setMsg('All plots deleted.');
  };

  // GPS location.
  const gps = () => {
    if (!navigator.geolocation) {
      setMsg('GPS is not available in this browser.');
      return;
    }

    setBusy(true);
    setMsg('Getting your current location...');

    navigator.geolocation.getCurrentPosition(
      position => {
        onLocate(
          position.coords.latitude,
          position.coords.longitude,
          'My GPS location'
        );

        setBusy(false);
        setMsg('Your GPS location has been selected.');
      },
      error => {
        setBusy(false);

        if (error.code === error.PERMISSION_DENIED) {
          setMsg('Location permission denied. Allow location access or select your farm on the map.');
        } else if (error.code === error.TIMEOUT) {
          setMsg('GPS request timed out. Please try again.');
        } else {
          setMsg('Unable to determine your location.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000
      }
    );
  };

  // Search for a global location.
  const search = async (e: FormEvent) => {
    e.preventDefault();

    if (q.trim().length < 2) {
      setMsg('Enter at least two characters to search for a location.');
      return;
    }

    setBusy(true);
    setMsg('');

    try {
      const results = await searchPlaces(q.trim());

      setRes(results);

      if (!results.length) {
        setMsg('No locations found. Try a different spelling or a nearby city.');
      }
    } catch {
      setMsg('Location search is unavailable. Check your internet connection or select a location directly on the map.');
    } finally {
      setBusy(false);
    }
  };

  // Select a search result.
  const pick = (place: Place) => {
    setRes([]);
    setQ('');

    onLocate(
      place.lat,
      place.lng,
      place.name.split(',').slice(0, 2).join(',').trim()
    );

    setMsg(`Selected location: ${place.name}`);
  };

  // Calculate plot areas.
  const areas = boundaries.map(
    coordinates => geoArea(coordinates)
  );

  const total = areas.reduce(
    (sum, area) => sum + area,
    0
  );

  // Export plot information as CSV.
  const exportCSV = () => {
    if (!boundaries.length) {
      setMsg('There are no plots to export.');
      return;
    }

    const rows = [
      [
        'Farm',
        'Plot',
        'Area (hectares)',
        'Latitude',
        'Longitude'
      ],
      ...boundaries.map((coordinates, index) => [
        farm.name,
        `Plot ${index + 1}`,
        geoArea(coordinates).toFixed(4),
        coordinates.map(p => p.lat.toFixed(6)).join('; '),
        coordinates.map(p => p.lng.toFixed(6)).join('; ')
      ])
    ];

    const csv = rows
      .map(row =>
        row.map(value =>
          `"${String(value).replace(/"/g, '""')}"`
        ).join(',')
      )
      .join('\n');

    const blob = new Blob(
      [csv],
      { type: 'text/csv;charset=utf-8;' }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `${farm.name.replace(/[^a-z0-9]/gi, '_')}_plots.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);

    setMsg('Plot information exported successfully.');
  };

  return (
    <>
      <h1>My Farm</h1>

      <p className="src">
        Select your farm anywhere in the world. Search for a location,
        use GPS, or click directly on the satellite map. Draw field
        boundaries to calculate and save individual plot areas.
      </p>

      {/* Global location search */}
      <form
        className="chips"
        onSubmit={search}
        role="search"
      >
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search village, city, region or country"
          aria-label="Search for a farm location"
          style={{ flex: '1 1 240px' }}
        />

        <button
          className="btn p"
          type="submit"
          disabled={busy}
        >
          {busy ? 'Searching...' : 'Search location'}
        </button>
      </form>

      {/* Search results */}
      {res.length > 0 && (
        <div className="panel" style={{ marginBottom: 12 }}>
          <h2>Search results</h2>

          {res.map((place, index) => (
            <div
              key={`${place.lat},${place.lng},${index}`}
              className="row"
              style={{ padding: '6px 0' }}
            >
              <button
                className="btn"
                type="button"
                onClick={() => pick(place)}
              >
                Select
              </button>

              <span>{place.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Map controls */}
      <div className="chips">
        <button
          className="btn p"
          type="button"
          onClick={startDrawing}
        >
          Draw plot
        </button>

        <button
          className="btn"
          type="button"
          onClick={example}
        >
          Add example boundary
        </button>

        <button
          className="btn"
          type="button"
          onClick={gps}
          disabled={busy}
        >
          Use my location
        </button>

        <button
          className="btn"
          type="button"
          onClick={() => {
            mode.current = 'set';
            pts.current = [];
            tmp.current?.remove();

            setMsg('Click anywhere on the map to set your farm location.');
          }}
        >
          Set farm location
        </button>

        <span
          className="src"
          style={{ alignSelf: 'center' }}
        >
          {farm.lat.toFixed(5)}, {farm.lng.toFixed(5)} (WGS84)
        </span>
      </div>

      {msg && (
        <p className="src" role="status">
          {msg}
        </p>
      )}

      {/* Satellite map */}
      <div
        ref={el}
        className="map"
        style={{
          minHeight: 420,
          width: '100%',
          borderRadius: 8
        }}
      />

      {/* Plot overview */}
      <div
        className="panel"
        style={{ marginTop: 12 }}
      >
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h2>Saved plots</h2>

          <div className="chips">
            <button
              className="btn"
              type="button"
              onClick={exportCSV}
              disabled={!boundaries.length}
            >
              Export CSV
            </button>

            <button
              className="btn"
              type="button"
              onClick={clearAll}
              disabled={!boundaries.length}
            >
              Clear all
            </button>
          </div>
        </div>

        <div className="row">
          <div>
            <span className="src">Number of plots</span>
            <h2>{boundaries.length}</h2>
          </div>

          <div>
            <span className="src">Total farm area</span>
            <h2>{A(total, units)}</h2>
          </div>
        </div>

        {boundaries.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Plot</th>
                  <th>Area</th>
                  <th>Boundary points</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {areas.map((area, index) => (
                  <tr key={index}>
                    <td>Plot {index + 1}</td>

                    <td>{A(area, units)}</td>

                    <td>{boundaries[index].length}</td>

                    <td>
                      <button
                        className="btn"
                        type="button"
                        onClick={() => {
                          const polygon = layers.current[index];

                          if (polygon && map.current) {
                            map.current.fitBounds(
                              polygon.getBounds(),
                              { padding: [30, 30] }
                            );
                          }
                        }}
                      >
                        View
                      </button>

                      <button
                        className="btn"
                        type="button"
                        onClick={() => del(index)}
                        style={{ marginLeft: 6 }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="src">
            No plots saved yet. Press Draw plot, click at least
            three field corners and double-click to finish.
          </p>
        )}

        <p className="src">
          {mapReady
            ? 'Map ready · Satellite imagery · WGS84 coordinates'
            : 'Loading map...'}
        </p>

        <p className="src">
          Plot boundaries are saved in this browser for the selected
          farm. They are not yet synchronized to a cloud database.
        </p>
      </div>
    </>
  );
}
