import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

/**
 * Confirmation modal for destructive actions.
 *
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - onConfirm: () => void
 * - title: string
 * - message: string
 * - confirmLabel: string (default 'Delete')
 * - confirmText: string | null  (if set, user must type this to confirm)
 * - variant: 'danger' | 'warning' (default 'danger')
 * - loading: boolean
 */
export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure? This action cannot be undone.',
  confirmLabel = 'Delete',
  confirmText = null,
  variant = 'danger',
  loading = false,
}) {
  const [typed, setTyped] = useState('');

  if (!open) return null;

  const canConfirm = confirmText ? typed === confirmText : true;
  const accentColor = variant === 'danger' ? 'var(--red)' : 'var(--orange)';
  const accentBg = variant === 'danger' ? 'var(--red-bg)' : 'var(--orange-bg)';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-xl)',
        }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: accentBg }}
            >
              <AlertTriangle size={20} style={{ color: accentColor }} />
            </div>
            <h3 className="text-base font-semibold" style={{ color: 'var(--text)' }}>
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center border-0 cursor-pointer transition-colors"
            style={{ background: 'var(--surface-2)', color: 'var(--text-3)' }}
            aria-label="Close dialog"
          >
            <X size={14} />
          </button>
        </div>

        {/* Message */}
        <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--text-3)' }}>
          {message}
        </p>

        {/* Type to confirm */}
        {confirmText && (
          <div className="mb-4">
            <p className="text-xs mb-2" style={{ color: 'var(--text-4)' }}>
              Type <strong style={{ color: accentColor }}>{confirmText}</strong> to confirm:
            </p>
            <input
              type="text"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm border-0 outline-none"
              style={{
                background: 'var(--surface-2)',
                color: 'var(--text)',
                border: `1px solid ${typed === confirmText ? 'var(--green)' : 'var(--border)'}`,
              }}
              placeholder={confirmText}
              autoFocus
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium border-0 cursor-pointer transition-colors"
            style={{ background: 'var(--surface-2)', color: 'var(--text-2)' }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              setTyped('');
            }}
            disabled={!canConfirm || loading}
            className="px-4 py-2 rounded-lg text-sm font-semibold border-0 cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: accentColor,
              color: '#fff',
            }}
          >
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
