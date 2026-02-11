import { useState, useEffect } from "react";
import {
  FiPlus,
  FiTrash2,
  FiCheck,
  FiClock,
  FiAlertTriangle,
  FiList,
  FiEdit2,
} from "react-icons/fi";
import api from "../api/client.js";

const emptyForm = {
  title: "",
  meetingId: "",
  owner: [],
  deadline: "",
  status: "pending",
};

function Actions() {
  const [actions, setActions] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterOwner, setFilterOwner] = useState("");

  const toggleOwner = (memberId) => {
    const currentOwners = [...form.owner];
    const index = currentOwners.indexOf(memberId);
    if (index === -1) {
      currentOwners.push(memberId);
    } else {
      currentOwners.splice(index, 1);
    }
    setForm({ ...form, owner: currentOwners });
  };

  const handleEdit = (action) => {
    setEditingId(action._id);
    setForm({
      title: action.title,
      meetingId: action.meetingId?._id || action.meetingId || "",
      owner: action.owner.map((o) => o._id || o),
      deadline: action.deadline ? action.deadline.split("T")[0] : "",
      status: action.status,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const fetchActions = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterOwner) params.owner = filterOwner;
      const { data } = await api.get("/actions", { params });
      setActions(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const fetchMeetings = async () => {
    try {
      const { data } = await api.get("/meetings");
      setMeetings(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMembers = async () => {
    try {
      const { data } = await api.get("/team");
      setMembers(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMeetings();
    fetchMembers();
  }, []);
  useEffect(() => {
    fetchActions();
  }, [filterStatus, filterOwner]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/actions/${editingId}`, form);
      } else {
        await api.post("/actions", form);
      }
      closeModal();
      fetchActions();
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (id, status) => {
    await api.put(`/actions/${id}`, { status });
    fetchActions();
  };

  const deleteAction = async (id) => {
    if (!confirm("Delete this action item?")) return;
    await api.delete(`/actions/${id}`);
    fetchActions();
  };

  const statusBadge = (status) => {
    const map = {
      pending: "badge-warning",
      in_progress: "badge-info",
      completed: "badge-success",
      overdue: "badge-danger",
    };
    return map[status] || "badge-muted";
  };

  const pendingCount = actions.filter(
    (a) => a.status === "pending" || a.status === "in_progress",
  ).length;
  const overdueCount = actions.filter((a) => a.status === "overdue").length;
  const completedCount = actions.filter((a) => a.status === "completed").length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Action Items</h2>
          <p>Track all action items across meetings</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <FiPlus /> New Action
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ background: "var(--warning-bg)", color: "var(--warning)" }}
          >
            <FiClock />
          </div>
          <div className="stat-value">{pendingCount}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ background: "var(--danger-bg)", color: "var(--danger)" }}
          >
            <FiAlertTriangle />
          </div>
          <div className="stat-value">{overdueCount}</div>
          <div className="stat-label">Overdue</div>
        </div>
        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ background: "var(--success-bg)", color: "var(--success)" }}
          >
            <FiCheck />
          </div>
          <div className="stat-value">{completedCount}</div>
          <div className="stat-label">Completed</div>
        </div>
      </div>

      <div className="filter-row">
        <select
          className="form-control"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="overdue">Overdue</option>
        </select>
        <select
          className="form-control"
          style={{ maxWidth: 200 }}
          value={filterOwner}
          onChange={(e) => setFilterOwner(e.target.value)}
        >
          <option value="">All Owners</option>
          {members.map((m) => (
            <option key={m._id} value={m._id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : actions.length === 0 ? (
        <div className="empty-state">
          <FiList />
          <p>No action items found.</p>
        </div>
      ) : (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Meeting</th>
                  <th>Owner</th>
                  <th>Deadline</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {actions.map((a) => (
                  <tr key={a._id}>
                    <td style={{ fontWeight: 500 }}>{a.title}</td>
                    <td className="text-muted text-sm">
                      {a.meetingId?.title || "-"}
                    </td>
                    <td className="text-sm">
                      {Array.isArray(a.owner) && a.owner.length > 0
                        ? a.owner.map((o) => o.name || o).join(" + ")
                        : "-"}
                    </td>
                    <td className="text-sm">
                      {a.deadline ? (
                        <span
                          style={{
                            color:
                              a.status === "overdue"
                                ? "var(--danger)"
                                : "inherit",
                          }}
                        >
                          {a.status === "overdue" && (
                            <FiAlertTriangle style={{ marginRight: 4 }} />
                          )}
                          {new Date(a.deadline).toLocaleDateString()}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>
                      <span className={`badge ${statusBadge(a.status)}`}>
                        {a.status.replace("_", " ")}
                      </span>
                    </td>
                    <td>
                      <div className="inline-actions">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleEdit(a)}
                          title="Edit"
                        >
                          <FiEdit2 />
                        </button>
                        {a.status !== "completed" && (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => updateStatus(a._id, "completed")}
                            title="Complete"
                          >
                            <FiCheck />
                          </button>
                        )}
                        {a.status === "pending" && (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => updateStatus(a._id, "in_progress")}
                            title="Start"
                          >
                            <FiClock />
                          </button>
                        )}
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => deleteAction(a._id)}
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
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editingId ? "Edit Action Item" : "Add Action Item"}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Action Title *</label>
                <input
                  className="form-control"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Meeting *</label>
                <select
                  className="form-control"
                  required
                  value={form.meetingId}
                  onChange={(e) =>
                    setForm({ ...form, meetingId: e.target.value })
                  }
                >
                  <option value="">Select meeting...</option>
                  {meetings.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.title} ({new Date(m.date).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Owners *</label>
                <div className="checkbox-grid">
                  {members.map((m) => (
                    <label key={m._id} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={form.owner.includes(m._id)}
                        onChange={() => toggleOwner(m._id)}
                      />
                      <span>{m.name}</span>
                    </label>
                  ))}
                </div>
                {form.owner.length === 0 && (
                  <small style={{ color: "var(--text-muted)" }}>
                    Select at least one owner
                  </small>
                )}
              </div>
              <div className="form-group">
                <label>Deadline</label>
                <input
                  className="form-control"
                  type="date"
                  value={form.deadline}
                  onChange={(e) =>
                    setForm({ ...form, deadline: e.target.value })
                  }
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? "Save Changes" : "Add Action"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Actions;
