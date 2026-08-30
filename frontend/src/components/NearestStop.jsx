import { useState, useEffect } from 'react';
import { Navigation, MapPin, Loader2, AlertCircle } from 'lucide-react';

/**
 * Detects user's location and finds the nearest shuttle stop.
 * Uses Haversine formula for distance calculation.
 *
 * Props:
 * - stops: [{ name, location: { lat, lng }, code, routes }]
 * - onStopSelect: (stop) => void
 * - compact: boolean (show as small card vs full)
 */

function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371e3; // Earth radius in meters
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(meters) {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

function estimateWalkTime(meters) {
  // Average walking speed: 1.4 m/s (about 5 km/h)
  const seconds = meters / 1.4;
  if (seconds < 60) return '< 1 min';
  const mins = Math.round(seconds / 60);
  return `${mins} min walk`;
}

export default function NearestStop({ stops = [], onStopSelect, compact = false }) {
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [nearestStops, setNearestStops] = useState([]);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setLoading(false);
      },
      (err) => {
        setError(
          err.code === 1
            ? 'Location access denied. Please enable location permissions.'
            : 'Could not determine your location. Please try again.'
        );
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Calculate nearest stops when user location or stops change
  useEffect(() => {
    if (!userLocation || stops.length === 0) return;

    const withDistance = stops
      .filter((s) => s.location?.lat && s.location?.lng)
      .map((stop) => ({
        ...stop,
        distance: haversineDistance(
          userLocation.lat,
          userLocation.lng,
          stop.location.lat,
          stop.location.lng
        ),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3);

    setNearestStops(withDistance);
  }, [userLocation, stops]);

  if (compact) {
    return (
      <button
        onClick={detectLocation}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border-0 cursor-pointer transition-all"
        style={{
          background: 'var(--primary-bg)',
          color: 'var(--primary)',
          border: '1px solid var(--border)',
        }}
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Navigation size={16} />
        )}
        {nearestStops.length > 0
          ? `${nearestStops[0].name} (${formatDistance(nearestStops[0].distance)})`
          : 'Find Nearest Stop'}
      </button>
    );
  }

  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--primary-bg)' }}
          >
            <Navigation size={18} style={{ color: 'var(--primary)' }} />
          </div>
          <div>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
              Nearest Stop
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-4)' }}>
              {userLocation
                ? `Your location: ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`
                : 'Tap to detect your location'}
            </p>
          </div>
        </div>
        <button
          onClick={detectLocation}
          disabled={loading}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border-0 cursor-pointer transition-colors"
          style={{ background: 'var(--primary-bg)', color: 'var(--primary)' }}
        >
          {loading ? 'Detecting...' : userLocation ? 'Refresh' : 'Detect'}
        </button>
      </div>

      {error && (
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg mb-3 text-xs"
          style={{ background: 'var(--red-bg)', color: 'var(--red)' }}
        >
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      {nearestStops.length > 0 && (
        <div className="space-y-2">
          {nearestStops.map((stop, idx) => (
            <div
              key={stop._id || stop.code || idx}
              className="flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors"
              style={{
                background: idx === 0 ? 'var(--primary-bg)' : 'var(--surface-2)',
                border: idx === 0 ? '1px solid var(--primary-glow)' : '1px solid transparent',
              }}
              onClick={() => onStopSelect?.(stop)}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background: idx === 0 ? 'var(--primary)' : 'var(--surface-3)',
                    color: idx === 0 ? '#080c14' : 'var(--text-3)',
                  }}
                >
                  {idx + 1}
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                    {stop.name}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-4)' }}>
                    {estimateWalkTime(stop.distance)}
                  </p>
                </div>
              </div>
              <span
                className="text-xs font-semibold px-2 py-1 rounded-md"
                style={{
                  background: idx === 0 ? 'var(--primary)' : 'var(--surface-3)',
                  color: idx === 0 ? '#080c14' : 'var(--text-3)',
                }}
              >
                {formatDistance(stop.distance)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
