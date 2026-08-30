import { useState, useEffect } from 'react';
import { Star, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'vit-favorite-routes';

/**
 * Favorite/pinned routes component.
 * Stores favorites in localStorage for guest users.
 *
 * Props:
 * - routes: [{ _id, name, code, color }] (all available routes)
 */

function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function setFavorites(ids) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export function useIsFavorite(routeId) {
  const [isFav, setIsFav] = useState(() => getFavorites().includes(routeId));

  const toggle = () => {
    const favs = getFavorites();
    const next = isFav ? favs.filter((id) => id !== routeId) : [...favs, routeId];
    setFavorites(next);
    setIsFav(!isFav);
    // Dispatch custom event so other instances update
    window.dispatchEvent(new CustomEvent('favorites-changed'));
  };

  useEffect(() => {
    const handler = () => setIsFav(getFavorites().includes(routeId));
    window.addEventListener('favorites-changed', handler);
    return () => window.removeEventListener('favorites-changed', handler);
  }, [routeId]);

  return [isFav, toggle];
}

export function FavoriteToggle({ routeId, size = 18 }) {
  const [isFav, toggle] = useIsFavorite(routeId);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle();
      }}
      className="p-1 rounded-md border-0 cursor-pointer transition-all"
      style={{
        background: isFav ? 'var(--orange-bg)' : 'transparent',
        color: isFav ? 'var(--orange)' : 'var(--text-4)',
      }}
      aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
      title={isFav ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Star size={size} fill={isFav ? 'currentColor' : 'none'} />
    </button>
  );
}

export default function FavoriteRoutes({ routes = [] }) {
  const [favoriteIds, setFavoriteIds] = useState(getFavorites);

  useEffect(() => {
    const handler = () => setFavoriteIds(getFavorites());
    window.addEventListener('favorites-changed', handler);
    return () => window.removeEventListener('favorites-changed', handler);
  }, []);

  const favoriteRoutes = routes.filter((r) =>
    favoriteIds.includes(r._id || r.code)
  );

  if (favoriteRoutes.length === 0) return null;

  return (
    <div className="mb-6">
      <h3
        className="text-sm font-semibold mb-3 flex items-center gap-2"
        style={{ color: 'var(--text-2)' }}
      >
        <Star size={14} style={{ color: 'var(--orange)' }} fill="var(--orange)" />
        Favorite Routes
      </h3>
      <div className="flex flex-wrap gap-2">
        {favoriteRoutes.map((route) => (
          <Link
            key={route._id || route.code}
            to={`/routes/${route._id || route.code}`}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium no-underline transition-all"
            style={{
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
            }}
          >
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: route.color || 'var(--primary)' }}
            />
            {route.name || route.code}
            <FavoriteToggle routeId={route._id || route.code} size={14} />
          </Link>
        ))}
      </div>
    </div>
  );
}
