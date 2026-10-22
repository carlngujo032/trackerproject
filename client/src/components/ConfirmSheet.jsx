import { useState } from 'react';
import Sheet from './Sheet.jsx';

export default function ConfirmSheet({ title, message, confirmLabel, onConfirm, onClose }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function run() {
    setBusy(true);
    setError('');
    try {
      await onConfirm();
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  }

  return (
    <Sheet title={title} onClose={onClose}>
      <p className="sheet-text">{message}</p>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="sheet-actions">
        <button type="button" className="btn ghost" onClick={onClose} disabled={busy}>Cancel</button>
        <button type="button" className="btn danger" onClick={run} disabled={busy}>
          {busy ? 'Deleting...' : confirmLabel}
        </button>
      </div>
    </Sheet>
  );
}
