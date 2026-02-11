import { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiEdit2, FiUsers } from 'react-icons/fi';
import api from '../api/client.js';

function Team() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', role: '', email: '', weeklyCapacity: 40 });

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/team');
      setMembers(data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchMembers(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', role: '', email: '', weeklyCapacity: 40 });
    setShowModal(true);
  };

  const openEdit = (m) => {
    setEditing(m._id);
    setForm({ name: m.name, role: m.role || '', email: m.email || '', weeklyCapacity: m.weeklyCapacity });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/team/${editing}`, form);
      } else {
        await api.post('/team', form);
      }
      setShowModal(false);
      fetchMembers();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this member and their tasks?')) return;
    await api.delete(`/team/${id}`);
    fetchMembers();
  };

  const getLoadColor = (member) => {
    const util = member.weeklyCapacity > 0 ? (member.currentLoad / member.weeklyCapacity) * 100 : 0;
    if (util > 100) return 'var(--danger)';
    if (util > 80) return 'var(--warning)';
    if (util < 30) return 'var(--info)';
    return 'var(--success)';
  };

  const getStatusLabel = (member) => {
    const util = member.weeklyCapacity > 0 ? (member.currentLoad / member.weeklyCapacity) * 100 : 0;
    if (util > 100) return 'Overloaded';
    if (util > 80) return 'High Load';
    if (util < 30) return 'Underutilized';
    return 'Balanced';
  };

  const getStatusClass = (member) => {
    const util = member.weeklyCapacity > 0 ? (member.currentLoad / member.weeklyCapacity) * 100 : 0;
    if (util > 100) return 'overloaded';
    if (util > 80) return 'high';
    if (util < 30) return 'underutilized';
    return 'balanced';
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Team & Capacity</h2>
          <p>Monitor workload and prevent burnout</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><FiPlus /> Add Member</button>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : members.length === 0 ? (
        <div className="empty-state">
          <FiUsers />
          <p>No team members yet. Add your first member.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {members.map(m => {
            const util = m.weeklyCapacity > 0 ? Math.round((m.currentLoad / m.weeklyCapacity) * 100) : 0;
            return (
              <div key={m._id} className="card">
                <div className="flex-between mb-8">
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>{m.name}</div>
                    <div className="text-muted text-sm">{m.role || 'No role'}</div>
                  </div>
                  <div className="inline-actions">
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(m)}><FiEdit2 /></button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(m._id)}><FiTrash2 /></button>
                  </div>
                </div>
                {m.email && <div className="text-muted text-xs mb-8">{m.email}</div>}
                <div className="flex-between mb-4">
                  <span className="text-sm">{m.currentLoad}h / {m.weeklyCapacity}h</span>
                  <div className="capacity-status">
                    <span className={`capacity-dot ${getStatusClass(m)}`}></span>
                    {getStatusLabel(m)}
                  </div>
                </div>
                <div className="workload-bar">
                  <div
                    className="workload-bar-fill"
                    style={{
                      width: `${Math.min(util, 100)}%`,
                      background: getLoadColor(m),
                    }}
                  />
                </div>
                <div className="text-muted text-xs mt-8">{m.activeTasks} active task{m.activeTasks !== 1 ? 's' : ''} &middot; {util}% utilized</div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{editing ? 'Edit Member' : 'Add Team Member'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name *</label>
                <input className="form-control" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Role</label>
                  <input className="form-control" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input className="form-control" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Weekly Capacity (hours)</label>
                <input className="form-control" type="number" min="0" value={form.weeklyCapacity} onChange={e => setForm({ ...form, weeklyCapacity: Number(e.target.value) })} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Save' : 'Add Member'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Team;
