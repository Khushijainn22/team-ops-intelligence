import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiCalendar,
  FiSearch,
} from "react-icons/fi";
import api from "../api/client.js";

const emptyForm = { title: "", date: "", agenda: "", notes: "", attendees: [] };

function Meetings() {
  const [meetings, setMeetings] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [filterTitle, setFilterTitle] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (filterTitle) params.title = filterTitle;

      const [meetingsRes, membersRes] = await Promise.all([
        api.get("/meetings", { params }),
        api.get("/team"),
      ]);
      setMeetings(meetingsRes.data);
      setMembers(membersRes.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [search, filterTitle]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (m) => {
    setEditing(m._id);
    setForm({
      title: m.title,
      date: m.date ? m.date.split("T")[0] : "",
      agenda: m.agenda || "",
      notes: m.notes || "",
      attendees: (m.attendees || []).map((a) => a._id || a),
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/meetings/${editing}`, form);
      } else {
        await api.post("/meetings", form);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this meeting and its action items?")) return;
    await api.delete(`/meetings/${id}`);
    fetchData();
  };

  const toggleAttendee = (memberId) => {
    const attendees = [...form.attendees];
    const index = attendees.indexOf(memberId);
    if (index > -1) {
      attendees.splice(index, 1);
    } else {
      attendees.push(memberId);
    }
    setForm({ ...form, attendees });
  };

  const titles = [...new Set(meetings.map((m) => m.title))];

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Meetings</h2>
          <p>Track meeting decisions and action items</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <FiPlus /> New Meeting
        </button>
      </div>

      <div className="filter-row">
        <div style={{ position: "relative", flex: 1, maxWidth: 280 }}>
          <FiSearch
            style={{
              position: "absolute",
              left: 10,
              top: 11,
              color: "var(--text-muted)",
            }}
          />
          <input
            className="form-control"
            style={{ paddingLeft: 32 }}
            placeholder="Search titles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="form-control"
          value={filterTitle}
          onChange={(e) => setFilterTitle(e.target.value)}
        >
          <option value="">All Titles</option>
          {titles.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : meetings.length === 0 ? (
        <div className="empty-state">
          <FiCalendar />
          <p>No meetings yet. Schedule your first one.</p>
        </div>
      ) : (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Meeting</th>
                  <th>Date</th>
                  <th>Attendees</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {meetings.map((m) => (
                  <tr key={m._id}>
                    <td>
                      <Link
                        to={`/meetings/${m._id}`}
                        style={{ fontWeight: 500 }}
                      >
                        {m.title}
                      </Link>
                      {m.agenda && (
                        <div
                          className="text-muted text-xs"
                          style={{
                            maxWidth: 300,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {m.agenda}
                        </div>
                      )}
                    </td>
                    <td className="text-sm">
                      {new Date(m.date).toLocaleDateString()}
                    </td>
                    <td className="text-muted text-sm">
                      {m.attendees?.length || 0} tagged members
                    </td>
                    <td>
                      <div className="inline-actions">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => openEdit(m)}
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(m._id)}
                        >
                          <FiTrash2 />
                        </button>
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
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editing ? "Edit Meeting" : "Add Meeting"}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title *</label>
                <input
                  className="form-control"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Date *</label>
                <input
                  className="form-control"
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Agenda</label>
                <textarea
                  className="form-control"
                  value={form.agenda}
                  onChange={(e) => setForm({ ...form, agenda: e.target.value })}
                  placeholder="Meeting agenda items..."
                />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  className="form-control"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Meeting notes..."
                />
              </div>
              <div className="form-group">
                <label>Tag Attendees</label>
                <div
                  className="grid-2"
                  style={{
                    maxHeight: "150px",
                    overflowY: "auto",
                    border: "1px solid var(--border-color)",
                    padding: "10px",
                    borderRadius: "var(--radius-md)",
                  }}
                >
                  {members.map((m) => (
                    <label
                      key={m._id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        cursor: "pointer",
                        fontSize: "14px",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={form.attendees.includes(m._id)}
                        onChange={() => toggleAttendee(m._id)}
                      />
                      {m.name}
                    </label>
                  ))}
                </div>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editing ? "Save" : "Add Meeting"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Meetings;
