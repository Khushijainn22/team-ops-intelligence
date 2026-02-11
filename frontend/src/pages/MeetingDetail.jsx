import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiPlus,
  FiTrash2,
  FiCheck,
  FiClock,
  FiAlertTriangle,
} from "react-icons/fi";
import api from "../api/client.js";

const emptyAction = { title: "", owner: [], deadline: "", status: "pending" };

function MeetingDetail() {
  const { id } = useParams();
  const [meeting, setMeeting] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionForm, setActionForm] = useState(emptyAction);

  const fetchMeeting = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/meetings/${id}`);
      setMeeting(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
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
    fetchMeeting();
    fetchMembers();
  }, [id]);

  const toggleOwner = (memberId) => {
    const currentOwners = [...actionForm.owner];
    const index = currentOwners.indexOf(memberId);
    if (index === -1) {
      currentOwners.push(memberId);
    } else {
      currentOwners.splice(index, 1);
    }
    setActionForm({ ...actionForm, owner: currentOwners });
  };

  const addAction = async (e) => {
    e.preventDefault();
    try {
      await api.post("/actions", { ...actionForm, meetingId: id });
      setShowActionModal(false);
      setActionForm(emptyAction);
      fetchMeeting();
    } catch (err) {
      console.error(err);
    }
  };

  const updateActionStatus = async (actionId, status) => {
    await api.put(`/actions/${actionId}`, { status });
    fetchMeeting();
  };

  const deleteAction = async (actionId) => {
    if (!confirm("Delete this action item?")) return;
    await api.delete(`/actions/${actionId}`);
    fetchMeeting();
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

  if (loading) return <div className="loading">Loading...</div>;
  if (!meeting)
    return (
      <div className="empty-state">
        <p>Meeting not found</p>
      </div>
    );

  const isOverdue = (deadline, status) =>
    deadline && status !== "completed" && new Date(deadline) < new Date();

  return (
    <div>
      <Link to="/meetings" className="btn btn-secondary mb-24">
        <FiArrowLeft /> Back to Meetings
      </Link>

      <div className="detail-header">
        <h2>{meeting.title}</h2>
        <div className="detail-meta">
          <span>Date: {new Date(meeting.date).toLocaleDateString()}</span>
          {meeting.attendees?.length > 0 && (
            <span>Attendees: {meeting.attendees.join(", ")}</span>
          )}
        </div>
      </div>

      {meeting.agenda && (
        <div className="detail-section">
          <h4>Agenda</h4>
          <div className="card">
            <p style={{ whiteSpace: "pre-wrap" }}>{meeting.agenda}</p>
          </div>
        </div>
      )}

      {meeting.notes && (
        <div className="detail-section">
          <h4>Notes</h4>
          <div className="card">
            <p style={{ whiteSpace: "pre-wrap" }}>{meeting.notes}</p>
          </div>
        </div>
      )}

      {meeting.decisions?.length > 0 && (
        <div className="detail-section">
          <h4>Decisions Made</h4>
          <div className="card">
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Decision</th>
                    <th>Outcome</th>
                    <th>Made By</th>
                  </tr>
                </thead>
                <tbody>
                  {meeting.decisions.map((d) => (
                    <tr key={d._id}>
                      <td>
                        <Link to={`/decisions/${d._id}`}>{d.title}</Link>
                      </td>
                      <td>
                        <span className={`badge ${statusBadge(d.outcome)}`}>
                          {d.outcome}
                        </span>
                      </td>
                      <td className="text-muted text-sm">{d.madeBy || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <div className="detail-section">
        <div className="flex-between mb-16">
          <h4 style={{ margin: 0 }}>Action Items</h4>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowActionModal(true)}
          >
            <FiPlus /> Add Action
          </button>
        </div>

        {!meeting.actions || meeting.actions.length === 0 ? (
          <div className="card">
            <div className="empty-state" style={{ padding: "24px" }}>
              <p>No action items for this meeting yet.</p>
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Owner</th>
                    <th>Deadline</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {meeting.actions.map((a) => (
                    <tr key={a._id}>
                      <td style={{ fontWeight: 500 }}>{a.title}</td>
                      <td className="text-sm">
                        {Array.isArray(a.owner) && a.owner.length > 0
                          ? a.owner.map((o) => o.name || o).join(" + ")
                          : "-"}
                      </td>
                      <td className="text-sm">
                        {a.deadline ? (
                          <span
                            style={{
                              color: isOverdue(a.deadline, a.status)
                                ? "var(--danger)"
                                : "inherit",
                            }}
                          >
                            {isOverdue(a.deadline, a.status) && (
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
                          {a.status !== "completed" && (
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() =>
                                updateActionStatus(a._id, "completed")
                              }
                              title="Mark complete"
                            >
                              <FiCheck />
                            </button>
                          )}
                          {a.status === "pending" && (
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() =>
                                updateActionStatus(a._id, "in_progress")
                              }
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
      </div>

      {showActionModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowActionModal(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add Action Item</h3>
            <form onSubmit={addAction}>
              <div className="form-group">
                <label>Action Title *</label>
                <input
                  className="form-control"
                  required
                  value={actionForm.title}
                  onChange={(e) =>
                    setActionForm({ ...actionForm, title: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Owners *</label>
                <div className="checkbox-grid">
                  {members.map((m) => (
                    <label key={m._id} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={actionForm.owner.includes(m._id)}
                        onChange={() => toggleOwner(m._id)}
                      />
                      <span>{m.name}</span>
                    </label>
                  ))}
                </div>
                {actionForm.owner.length === 0 && (
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
                  value={actionForm.deadline}
                  onChange={(e) =>
                    setActionForm({ ...actionForm, deadline: e.target.value })
                  }
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowActionModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Action
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MeetingDetail;
