import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PiArrowDown, PiArrowUp, PiCaretLeft, PiPencilSimple, PiPlus, PiTrash, PiPackage } from 'react-icons/pi';
import { api } from '../api.js';
import { peso } from '../utils.js';
import ProjectSheet from '../components/ProjectSheet.jsx';
import ItemSheet from '../components/ItemSheet.jsx';
import ConfirmSheet from '../components/ConfirmSheet.jsx';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [error, setError] = useState('');
  const [sheet, setSheet] = useState(null);
  // sheet: { type: 'item', item? } | { type: 'rename' } | { type: 'delete-project' } | { type: 'delete-item', item }

  const load = useCallback(() => api.getProject(id).then(setProject).catch((e) => setError(e.message)), [id]);
  useEffect(() => {
    load();
  }, [load]);

  const [sort, setSort] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('partlog_sort'));
      if (saved && ['newest', 'name', 'price'].includes(saved.key) && ['asc', 'desc'].includes(saved.dir)) return saved;
    } catch {
      /* ignore */
    }
    return { key: 'newest', dir: 'desc' };
  });

  function chooseSort(key) {
    setSort((cur) => {
      let next;
      if (key === 'newest') next = { key, dir: 'desc' };
      else if (cur.key === key) next = { key, dir: cur.dir === 'asc' ? 'desc' : 'asc' };
      else next = { key, dir: key === 'name' ? 'asc' : 'desc' };
      try {
        localStorage.setItem('partlog_sort', JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  const sortedItems = useMemo(() => {
    const list = [...(project?.items || [])];
    if (sort.key === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base', numeric: true }));
    } else if (sort.key === 'price') {
      list.sort((a, b) => a.price * a.quantity - b.price * b.quantity);
    } else {
      list.sort((a, b) => a.id - b.id);
    }
    const asc = sort.key === 'newest' ? false : sort.dir === 'asc';
    return asc ? list : list.reverse();
  }, [project, sort]);

  const close = useCallback(() => setSheet(null), []);

  async function saveItem(body) {
    if (sheet.item) await api.updateItem(id, sheet.item.id, body);
    else await api.addItem(id, body);
    await load();
    close();
  }

  async function removeItem() {
    await api.deleteItem(id, sheet.item.id);
    await load();
    close();
  }

  async function rename(title) {
    await api.renameProject(id, title);
    await load();
    close();
  }

  async function removeProject() {
    await api.deleteProject(id);
    navigate('/', { replace: true });
  }

  if (error && !project) {
    return (
      <>
        <header className="page-head">
          <Link to="/" className="icon-btn" aria-label="Back to projects"><PiCaretLeft /></Link>
        </header>
        <p className="form-error pad" role="alert">{error}</p>
      </>
    );
  }
  if (!project) return <p className="muted pad">Loading project</p>;

  const pieces = project.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <>
      <header className="page-head with-back">
        <Link to="/" className="icon-btn" aria-label="Back to projects"><PiCaretLeft /></Link>
        <h1 className="clamp">{project.title}</h1>
        <button className="icon-btn" onClick={() => setSheet({ type: 'rename' })} aria-label="Rename project"><PiPencilSimple /></button>
        <button className="icon-btn" onClick={() => setSheet({ type: 'delete-project' })} aria-label="Delete project"><PiTrash /></button>
      </header>

      <section className="ticket">
        <span>Total spent</span>
        <strong>{peso(project.total)}</strong>
        <small>
          {project.items.length} {project.items.length === 1 ? 'part' : 'parts'}, {pieces} {pieces === 1 ? 'piece' : 'pieces'} in all
        </small>
      </section>

      {project.items.length > 1 && (
        <div className="sortbar" role="group" aria-label="Sort parts">
          <small>Sort by</small>
          {[
            ['newest', 'Newest'],
            ['name', 'Name'],
            ['price', 'Price'],
          ].map(([key, label]) => {
            const active = sort.key === key;
            return (
              <button
                key={key}
                type="button"
                className={`chip${active ? ' active' : ''}`}
                aria-pressed={active}
                onClick={() => chooseSort(key)}
              >
                {label}
                {active && key !== 'newest' && (sort.dir === 'asc' ? <PiArrowUp aria-label="ascending" /> : <PiArrowDown aria-label="descending" />)}
              </button>
            );
          })}
        </div>
      )}

      {project.items.length === 0 ? (
        <div className="empty">
          <div className="empty-icon"><PiPackage /></div>
          <h2>No parts added</h2>
          <p>Add the first part you bought for this project.</p>
        </div>
      ) : (
        <ul className="list items">
          {sortedItems.map((it) => (
            <li key={it.id}>
              <button className="row" onClick={() => setSheet({ type: 'item', item: it })}>
                <div className="row-main">
                  <strong>{it.name}</strong>
                  <small>
                    {it.quantity} × {peso(it.price)}
                    {it.note ? `, ${it.note}` : ''}
                  </small>
                </div>
                <div className="row-end">
                  <strong className="num">{peso(it.price * it.quantity)}</strong>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="fab-wrap">
        <button className="fab" onClick={() => setSheet({ type: 'item' })}>
          <PiPlus /> Add part
        </button>
      </div>

      {sheet?.type === 'item' && (
        <ItemSheet
          item={sheet.item}
          onSave={saveItem}
          onDelete={() => setSheet({ type: 'delete-item', item: sheet.item })}
          onClose={close}
        />
      )}
      {sheet?.type === 'rename' && <ProjectSheet project={project} onSave={rename} onClose={close} />}
      {sheet?.type === 'delete-item' && (
        <ConfirmSheet
          title="Delete part"
          message={`Delete "${sheet.item.name}" from this project? The total will update.`}
          confirmLabel="Delete part"
          onConfirm={removeItem}
          onClose={close}
        />
      )}
      {sheet?.type === 'delete-project' && (
        <ConfirmSheet
          title="Delete project"
          message={`Delete "${project.title}" and all ${project.items.length} of its parts? This cannot be undone.`}
          confirmLabel="Delete project"
          onConfirm={removeProject}
          onClose={close}
        />
      )}
    </>
  );
}
