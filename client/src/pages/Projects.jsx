import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { PiCaretRight, PiFolderSimple, PiPlus } from 'react-icons/pi';
import { api } from '../api.js';
import { peso } from '../utils.js';
import ProjectSheet from '../components/ProjectSheet.jsx';

export default function Projects() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const creating = params.get('new') === '1';

  const load = useCallback(() => {
    api.listProjects().then(setData).catch((e) => setError(e.message));
  }, []);

  useEffect(load, [load]);

  const closeSheet = useCallback(() => setParams({}, { replace: true }), [setParams]);

  async function create(title) {
    const { project } = await api.createProject(title);
    navigate(`/projects/${project.id}`);
  }

  return (
    <>
      <header className="page-head">
        <h1>Projects</h1>
      </header>

      <section className="grand">
        <span>Spent on all projects</span>
        <strong>{data ? peso(data.grandTotal) : peso(0)}</strong>
        <small>
          {data ? `${data.projects.length} ${data.projects.length === 1 ? 'project' : 'projects'}` : 'Loading'}
        </small>
      </section>

      {error && <p className="form-error pad" role="alert">{error}</p>}

      {data && data.projects.length === 0 && (
        <div className="empty">
          <div className="empty-icon"><PiFolderSimple /></div>
          <h2>No projects yet</h2>
          <p>Create a project, like "Sound System Project", then add each part you buy.</p>
          <button className="btn primary" onClick={() => setParams({ new: '1' })}>
            <PiPlus /> Create project
          </button>
        </div>
      )}

      {data && data.projects.length > 0 && (
        <ul className="list">
          {data.projects.map((p) => (
            <li key={p.id}>
              <Link to={`/projects/${p.id}`} className="row">
                <div className="row-icon"><PiFolderSimple /></div>
                <div className="row-main">
                  <strong>{p.title}</strong>
                  <small>{p.item_count} {p.item_count === 1 ? 'part' : 'parts'}</small>
                </div>
                <div className="row-end">
                  <strong className="num">{peso(p.total)}</strong>
                  <PiCaretRight />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {creating && <ProjectSheet onSave={create} onClose={closeSheet} />}
    </>
  );
}
