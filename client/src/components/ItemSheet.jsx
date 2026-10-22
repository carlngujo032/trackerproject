import { useState } from 'react';
import { PiMinus, PiPlus, PiTrash } from 'react-icons/pi';
import Sheet from './Sheet.jsx';
import { peso } from '../utils.js';

export default function ItemSheet({ item, onSave, onDelete, onClose }) {
  const [name, setName] = useState(item?.name || '');
  const [price, setPrice] = useState(item ? String(item.price) : '');
  const [quantity, setQuantity] = useState(item?.quantity || 1);
  const [note, setNote] = useState(item?.note || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const lineTotal = (Number(price) || 0) * quantity;

  async function submit(e) {
    e.preventDefault();
    if (!name.trim()) return setError('Enter the part name.');
    const p = Number(price);
    if (price === '' || !Number.isFinite(p) || p < 0) return setError('Enter a valid price.');
    setBusy(true);
    setError('');
    try {
      await onSave({ name: name.trim(), price: p, quantity, note: note.trim() });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <Sheet title={item ? 'Edit part' : 'Add part'} onClose={onClose}>
      <form onSubmit={submit} className="stack">
        <label className="field">
          <span>Part name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="12 inch woofer"
            maxLength={160}
            autoFocus={!item}
          />
        </label>

        <div className="row2">
          <label className="field">
            <span>Price each</span>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              inputMode="decimal"
              pattern="[0-9]*[.]?[0-9]*"
            />
          </label>

          <div className="field">
            <span>Quantity</span>
            <div className="stepper">
              <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">
                <PiMinus />
              </button>
              <output>{quantity}</output>
              <button type="button" onClick={() => setQuantity((q) => q + 1)} aria-label="Increase quantity">
                <PiPlus />
              </button>
            </div>
          </div>
        </div>

        <label className="field">
          <span>Note (optional)</span>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Store, brand or model"
            maxLength={300}
          />
        </label>

        <div className="line-total">
          <span>Line total</span>
          <strong>{peso(lineTotal)}</strong>
        </div>

        {error && <p className="form-error" role="alert">{error}</p>}

        <div className="sheet-actions">
          {item && (
            <button type="button" className="btn danger-outline icon-only" onClick={onDelete} aria-label="Delete part" disabled={busy}>
              <PiTrash />
            </button>
          )}
          <button className="btn primary grow" disabled={busy}>
            {busy ? 'Saving...' : item ? 'Save changes' : 'Add part'}
          </button>
        </div>
      </form>
    </Sheet>
  );
}
