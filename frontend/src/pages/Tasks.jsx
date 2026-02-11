import { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiEdit2, FiCheckSquare } from 'react-icons/fi';
import api from '../api/client.js';

const statusColors = { todo: 'badge-muted', in_progress: 'badge-info', done: 'badge-success' };
const priorityColors = { low: 'badge-muted', medium: 'badge-warning', high: 'badge-danger' };

const emptyForm = { title: '', description: '', assignee: '', estimatedHours: 0, status: 'todo', priority: 'medium', dueDate: '', project: '' };

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterAssignee) params.assignee = filterAssignee;
      const [tasksRes, membersRes] = await Promise.all([
        api.get('/tasks', { params }),
        api.get('/team'),
      ]);
      setTasks(tasksRes.data);
      setMembers(membersRes.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [filterStatus, filterAssignee]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (t) => {
    setEditing(t._id);
    setForm({
      title: t.title, description: t.description || '',
      assignee: t.assignee?._id || '', estimatedHours: t.estimatedHours,
      status: t.status, priority: t.priority,
      dueDate: t.dueDate ? t.dueDate.split('T')[0] : '', project: t.project || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/tasks/${editing}`, form);
      } else {
        await api.post('/tasks', form);
      }
      setShowModal(false);
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return;
    await api.delete(`/tasks/${id}`);
    fetchData();
  };

  const quickStatus = async (id, status) => {
    await api.put(`/tasks/${id}`, { status });
    fetchData();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Tasks</h2>
          <p>Assign and track team tasks with effort estimates</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><FiPlus /> New Task</button>
      </div>

      <div className="filter-row">
        <select className="form-control" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <select className="form-control" value={filterAssignee} onChange={e => setFilterAssignee(e.target.value)}>
          <option value="">All Members</option>
          {members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <FiCheckSquare />
          <p>No tasks found. Create one to get started.</p>
        </div>
      ) : (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Assignee</th>
                  <th>Hours</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Due</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(t => (
                  <tr key={t._id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{t.title}</div>
                      {t.project && <div className="text-muted text-xs">{t.project}</div>}
                    </td>
                    <td className="text-sm">{t.assignee?.name || 'Unassigned'}</td>
                    <td className="text-sm">{t.estimatedHours}h</td>
                    <td><span className={`badge ${priorityColors[t.priority]}`}>{t.priority}</span></td>
                    <td>
                      <select
                        className="form-control"
                        style={{ width: 'auto', padding: '4px 28px 4px 8px', fontSize: 12 }}
                        value={t.status}
                        onChange={e => quickStatus(t._id, e.target.value)}
                      >
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="done">Done</option>
                      </select>
                    </td>
                    <td className="text-muted text-sm">{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '-'}</td>
                    <td>
                      <div className="inline-actions">
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(t)}><FiEdit2 /></button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t._id)}><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{editing ? 'Edit Task' : 'Create Task'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title *</label>
                <input className="form-control" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-control" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Assignee *</label>
                  <select className="form-control" required value={form.assignee} onChange={e => setForm({ ...form, assignee: e.target.value })}>
                    <option value="">Select member</option>
                    {members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Estimated Hours</label>
                  <input className="form-control" type="number" min="0" step="0.5" value={form.estimatedHours} onChange={e => setForm({ ...form, estimatedHours: Number(e.target.value) })} />
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Priority</label>
                  <select className="form-control" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select className="form-control" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Due Date</label>
                  <input className="form-control" type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Project</label>
                  <input className="form-control" value={form.project} onChange={e => setForm({ ...form, project: e.target.value })} />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Save' : 'Create Task'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tasks;
