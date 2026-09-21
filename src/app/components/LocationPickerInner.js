'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const TIRUPATI_CENTER = [13.6288, 79.4192];

export default function LocationPickerInner({ lat, lng, onChange }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const lastEmittedRef = useRef(null);
  onChangeRef.current = onChange;

  function placeMarker(map, latlng) {
    if (markerRef.current) {
      markerRef.current.setLatLng(latlng);
    } else {
      markerRef.current = L.marker(latlng, { draggable: true }).addTo(map);
      markerRef.current.on('dragend', () => {
        const pos = markerRef.current.getLatLng();
        lastEmittedRef.current = `${pos.lat},${pos.lng}`;
        onChangeRef.current(pos.lat, pos.lng);
      });
    }
  }

  // Initialize the map once.
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    const hasInitial = lat != null && lng != null;
    const map = L.map(containerRef.current).setView(
      hasInitial ? [lat, lng] : TIRUPATI_CENTER,
      hasInitial ? 15 : 12
    );
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    if (hasInitial) {
      placeMarker(map, [lat, lng]);
      lastEmittedRef.current = `${lat},${lng}`;
    }

    map.on('click', (e) => {
      placeMarker(map, e.latlng);
      lastEmittedRef.current = `${e.latlng.lat},${e.latlng.lng}`;
      onChangeRef.current(e.latlng.lat, e.latlng.lng);
    });

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // React to EXTERNAL lat/lng changes (e.g. from the address search box) —
  // skip if this is just an echo of a change the map itself just made via
  // a click or drag, so we don't fight the user's own interaction.
  useEffect(() => {
    if (!mapRef.current || lat == null || lng == null) return;
    const key = `${lat},${lng}`;
    if (key === lastEmittedRef.current) return;
    lastEmittedRef.current = key;
    placeMarker(mapRef.current, [lat, lng]);
    mapRef.current.setView([lat, lng], 16);
  }, [lat, lng]);

  return <div ref={containerRef} className="h-full w-full cursor-crosshair" />;
}
