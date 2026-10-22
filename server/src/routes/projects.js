import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();
const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);

const ITEM_COLS = 'id, project_id, name, price::float8 AS price, quantity, note, created_at';
const round2 = (n) => Math.round(n * 100) / 100;

function parseId(value) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function cleanTitle(body) {
  const title = String(body.title || '').trim();
  if (!title) return { error: 'Enter a project title.' };
  if (title.length > 120) return { error: 'Title must be 120 characters or fewer.' };
  return { title };
}

function cleanItem(body) {
  const name = String(body.name || '').trim();
  const price = Number(body.price);
  const quantity = Number(body.quantity ?? 1);
  const note = String(body.note || '').trim();

  if (!name) return { error: 'Enter the part name.' };
  if (name.length > 160) return { error: 'Part name must be 160 characters or fewer.' };
  if (!Number.isFinite(price) || price < 0) return { error: 'Enter a valid price.' };
  if (price > 9999999999) return { error: 'That price is too large.' };
  if (!Number.isInteger(quantity) || quantity < 1) return { error: 'Quantity must be a whole number, 1 or more.' };
  if (note.length > 300) return { error: 'Note must be 300 characters or fewer.' };
  return { name, price: round2(price), quantity, note };
}

async function ownProject(userId, projectId) {
  const { rows } = await pool.query('SELECT id FROM projects WHERE id = $1 AND user_id = $2', [projectId, userId]);
  return rows[0] || null;
}

// List projects with totals
router.get('/', wrap(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT p.id, p.title, p.created_at, p.updated_at,
            COUNT(i.id)::int AS item_count,
            COALESCE(SUM(i.price * i.quantity), 0)::float8 AS total
       FROM projects p
       LEFT JOIN items i ON i.project_id = p.id
      WHERE p.user_id = $1
      GROUP BY p.id
      ORDER BY p.updated_at DESC`,
    [req.user.id]
  );
  const grand = rows.reduce((sum, r) => sum + r.total, 0);
  res.json({ projects: rows, grandTotal: round2(grand) });
}));

// Create project
router.post('/', wrap(async (req, res) => {
  const { title, error } = cleanTitle(req.body);
  if (error) return res.status(400).json({ error });
  const { rows } = await pool.query(
    'INSERT INTO projects (user_id, title) VALUES ($1, $2) RETURNING id, title, created_at, updated_at',
    [req.user.id, title]
  );
  res.status(201).json({ project: { ...rows[0], item_count: 0, total: 0 } });
}));

// Get one project with items
router.get('/:id', wrap(async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(404).json({ error: 'Project not found.' });
  const p = await pool.query(
    'SELECT id, title, created_at, updated_at FROM projects WHERE id = $1 AND user_id = $2',
    [id, req.user.id]
  );
  if (!p.rows[0]) return res.status(404).json({ error: 'Project not found.' });
  const items = await pool.query(
    `SELECT ${ITEM_COLS} FROM items WHERE project_id = $1 ORDER BY created_at DESC, id DESC`,
    [id]
  );
  const total = items.rows.reduce((s, i) => s + i.price * i.quantity, 0);
  res.json({ ...p.rows[0], items: items.rows, total: round2(total) });
}));

// Rename project
router.put('/:id', wrap(async (req, res) => {
  const id = parseId(req.params.id);
  const { title, error } = cleanTitle(req.body);
  if (error) return res.status(400).json({ error });
  if (!id) return res.status(404).json({ error: 'Project not found.' });
  const { rows } = await pool.query(
    'UPDATE projects SET title = $1, updated_at = now() WHERE id = $2 AND user_id = $3 RETURNING id, title',
    [title, id, req.user.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Project not found.' });
  res.json({ project: rows[0] });
}));

// Delete project
router.delete('/:id', wrap(async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(404).json({ error: 'Project not found.' });
  const { rowCount } = await pool.query('DELETE FROM projects WHERE id = $1 AND user_id = $2', [id, req.user.id]);
  if (!rowCount) return res.status(404).json({ error: 'Project not found.' });
  res.json({ ok: true });
}));

// Add item
router.post('/:id/items', wrap(async (req, res) => {
  const projectId = parseId(req.params.id);
  if (!projectId || !(await ownProject(req.user.id, projectId))) return res.status(404).json({ error: 'Project not found.' });
  const clean = cleanItem(req.body);
  if (clean.error) return res.status(400).json({ error: clean.error });
  const { rows } = await pool.query(
    `INSERT INTO items (project_id, name, price, quantity, note) VALUES ($1, $2, $3, $4, $5) RETURNING ${ITEM_COLS}`,
    [projectId, clean.name, clean.price, clean.quantity, clean.note]
  );
  await pool.query('UPDATE projects SET updated_at = now() WHERE id = $1', [projectId]);
  res.status(201).json({ item: rows[0] });
}));

// Update item
router.put('/:id/items/:itemId', wrap(async (req, res) => {
  const projectId = parseId(req.params.id);
  const itemId = parseId(req.params.itemId);
  if (!projectId || !itemId || !(await ownProject(req.user.id, projectId))) return res.status(404).json({ error: 'Part not found.' });
  const clean = cleanItem(req.body);
  if (clean.error) return res.status(400).json({ error: clean.error });
  const { rows } = await pool.query(
    `UPDATE items SET name = $1, price = $2, quantity = $3, note = $4, updated_at = now()
      WHERE id = $5 AND project_id = $6 RETURNING ${ITEM_COLS}`,
    [clean.name, clean.price, clean.quantity, clean.note, itemId, projectId]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Part not found.' });
  await pool.query('UPDATE projects SET updated_at = now() WHERE id = $1', [projectId]);
  res.json({ item: rows[0] });
}));

// Delete item
router.delete('/:id/items/:itemId', wrap(async (req, res) => {
  const projectId = parseId(req.params.id);
  const itemId = parseId(req.params.itemId);
  if (!projectId || !itemId || !(await ownProject(req.user.id, projectId))) return res.status(404).json({ error: 'Part not found.' });
  const { rowCount } = await pool.query('DELETE FROM items WHERE id = $1 AND project_id = $2', [itemId, projectId]);
  if (!rowCount) return res.status(404).json({ error: 'Part not found.' });
  await pool.query('UPDATE projects SET updated_at = now() WHERE id = $1', [projectId]);
  res.json({ ok: true });
}));

export default router;
