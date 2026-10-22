import { useState } from 'react';
import Sheet from './Sheet.jsx';

export default function ProjectSheet({ project, onSave, onClose }) {
  const [title, setTitle] = useState(project?.title || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    if (!title.trim()) return setError('Enter a project title.');
    setBusy(true);
    setError('');
    try {
      await onSave(title.trim());
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <Sheet title={project ? 'Rename project' : 'New project'} onClose={onClose}>
      <form onSubmit={submit} className="stack">
        <label className="field">
          <span>Project title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Sound System Project"
            maxLength={120}
            autoFocus
          />
        </label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="btn primary" disabled={busy}>
          {busy ? 'Saving...' : project ? 'Save changes' : 'Create project'}
        </button>
      </form>
    </Sheet>
  );
}
