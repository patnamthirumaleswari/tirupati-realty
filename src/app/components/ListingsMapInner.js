'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// Groups nearby pins into a single number-badge circle until zoomed in
// close enough to tell them apart — without this, a locality with many
// listings turns into an unreadable pile of overlapping markers.
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

// Leaflet's default marker icon paths break under bundlers like Turbopack
// (they try to reference local image files that don't get bundled
// correctly) — pointing them at Leaflet's own CDN-hosted images sidesteps
// that entirely, a well-known workaround for Leaflet + Next.js.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const TIRUPATI_CENTER = [13.6288, 79.4192];

export default function ListingsMapInner({ pins }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    const map = L.map(containerRef.current).setView(TIRUPATI_CENTER, 12);
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    const clusterGroup = L.markerClusterGroup({ maxClusterRadius: 50 });

    pins.forEach((pin) => {
      const marker = L.marker([pin.lat, pin.lng]);
      const safeTitle = pin.title.replace(/</g, '&lt;');
      marker.bindPopup(
        `<a href="/listings/${pin.id}" style="font-weight:600;">${safeTitle}</a><br/>${pin.priceLabel}`
      );
      clusterGroup.addLayer(marker);
    });

    map.addLayer(clusterGroup);

    if (pins.length > 0) {
      const bounds = L.latLngBounds(pins.map((p) => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [30, 30] });
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [pins]);

  return <div ref={containerRef} className="h-full w-full" />;
}
