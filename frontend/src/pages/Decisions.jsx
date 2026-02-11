import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiPlus,
  FiSearch,
  FiTrash2,
  FiEdit2,
  FiFileText,
} from "react-icons/fi";
import api from "../api/client.js";

const outcomeColors = {
  pending: "badge-warning",
  successful: "badge-success",
  failed: "badge-danger",
  revisited: "badge-info",
};

const TEAM_OPTIONS = [
  "product",
  "data",
  "leadership",
  "operations",
  "commercial",
  "development",
];

const emptyForm = {
  title: "",
  description: "",
  context: "",
  constraints: "",
  alternatives: [],
  outcome: "pending",
  tags: "",
  project: "",
  team: [],
  madeBy: "",
  decisionDate: new Date().toISOString().split("T")[0],
};

function Decisions() {
  const [decisions, setDecisions] = useState([]);
  const [members, setMembers] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [altTitle, setAltTitle] = useState("");
  const [altDesc, setAltDesc] = useState("");
  const [search, setSearch] = useState("");
  const [filterOutcome, setFilterOutcome] = useState("");
  const [filterProject, setFilterProject] = useState("");
  const [filterTeam, setFilterTeam] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (filterOutcome) params.outcome = filterOutcome;
      if (filterProject) params.project = filterProject;
      if (filterTeam) params.team = filterTeam;
      const [decisionsRes, membersRes, projectsRes] = await Promise.all([
        api.get("/decisions", { params }),
        api.get("/team"),
        api.get("/decisions/projects"),
      ]);
      setDecisions(decisionsRes.data);
      setMembers(membersRes.data);
      setAllProjects(projectsRes.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [search, filterOutcome, filterProject, filterTeam]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (d) => {
    setEditing(d._id);
    setForm({
      title: d.title,
      description: d.description || "",
      context: d.context || "",
      constraints: d.constraints || "",
      alternatives: d.alternatives || [],
      outcome: d.outcome,
      tags: (d.tags || []).join(", "),
      project: d.project || "",
      team: Array.isArray(d.team) ? d.team : [],
      madeBy: d.madeBy?._id || d.madeBy || "",
      decisionDate: d.decisionDate
        ? d.decisionDate.split("T")[0]
        : d.createdAt
          ? d.createdAt.split("T")[0]
          : "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };
    try {
      if (editing) {
        await api.put(`/decisions/${editing}`, payload);
      } else {
        await api.post("/decisions", payload);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this decision?")) return;
    await api.delete(`/decisions/${id}`);
    fetchData();
  };

  const addAlternative = () => {
    if (!altTitle.trim()) return;
    setForm({
      ...form,
      alternatives: [
        ...form.alternatives,
        { title: altTitle, description: altDesc },
      ],
    });
    setAltTitle("");
    setAltDesc("");
  };

  const removeAlternative = (idx) => {
    setForm({
      ...form,
      alternatives: form.alternatives.filter((_, i) => i !== idx),
    });
  };

  const toggleTeam = (team) => {
    const currentTeams = [...form.team];
    const index = currentTeams.indexOf(team);
    if (index > -1) {
      currentTeams.splice(index, 1);
    } else {
      currentTeams.push(team);
    }
    setForm({ ...form, team: currentTeams });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Decision Log</h2>
          <p>Track decisions, tradeoffs, and their outcomes</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <FiPlus /> New Decision
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
            placeholder="Search decisions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="form-control"
          value={filterOutcome}
          onChange={(e) => setFilterOutcome(e.target.value)}
        >
          <option value="">All Outcomes</option>
          <option value="pending">Pending</option>
          <option value="successful">Successful</option>
          <option value="failed">Failed</option>
          <option value="revisited">Revisited</option>
        </select>
        <select
          className="form-control"
          value={filterTeam}
          onChange={(e) => setFilterTeam(e.target.value)}
        >
          <option value="">All Teams</option>
          {TEAM_OPTIONS.map((t) => (
            <option key={t} value={t} style={{ textTransform: "capitalize" }}>
              {t}
            </option>
          ))}
        </select>
        <select
          className="form-control"
          value={filterProject}
          onChange={(e) => setFilterProject(e.target.value)}
        >
          <option value="">All Projects</option>
          {allProjects.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : decisions.length === 0 ? (
        <div className="empty-state">
          <FiFileText />
          <p>No decisions logged yet. Start by creating one.</p>
        </div>
      ) : (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Decision</th>
                  <th>Project</th>
                  <th>Teams</th>
                  <th>Made By</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {decisions.map((d) => (
                  <tr key={d._id}>
                    <td>
                      <Link
                        to={`/decisions/${d._id}`}
                        style={{ fontWeight: 500 }}
                      >
                        {d.title}
                      </Link>
                      {d.tags?.length > 0 && (
                        <div className="tags mt-8">
                          {d.tags.map((t) => (
                            <span key={t} className="tag">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="text-muted text-sm">{d.project || "-"}</td>
                    <td className="text-muted text-sm">
                      {Array.isArray(d.team) && d.team.length > 0
                        ? d.team.join(" + ")
                        : "-"}
                    </td>
                    <td className="text-muted text-sm">
                      {d.madeBy?.name || d.madeBy || "-"}
                    </td>
                    <td className="text-muted text-sm">
                      {new Date(
                        d.decisionDate || d.createdAt,
                      ).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="inline-actions">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => openEdit(d)}
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(d._id)}
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
            <h3>{editing ? "Edit Decision" : "Log New Decision"}</h3>
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
                <label>Description</label>
                <textarea
                  className="form-control"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Context</label>
                  <textarea
                    className="form-control"
                    value={form.context}
                    onChange={(e) =>
                      setForm({ ...form, context: e.target.value })
                    }
                    placeholder="Why was this decision needed?"
                  />
                </div>
                <div className="form-group">
                  <label>Constraints</label>
                  <textarea
                    className="form-control"
                    value={form.constraints}
                    onChange={(e) =>
                      setForm({ ...form, constraints: e.target.value })
                    }
                    placeholder="Limitations or requirements"
                  />
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Project</label>
                  <input
                    className="form-control"
                    value={form.project}
                    onChange={(e) =>
                      setForm({ ...form, project: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Teams</label>
                  <div
                    className="grid-2"
                    style={{
                      maxHeight: "120px",
                      overflowY: "auto",
                      border: "1px solid var(--border-color)",
                      padding: "10px",
                      borderRadius: "var(--radius-md)",
                    }}
                  >
                    {TEAM_OPTIONS.map((team) => (
                      <label
                        key={team}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          cursor: "pointer",
                          fontSize: "13px",
                          textTransform: "capitalize",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={form.team.includes(team)}
                          onChange={() => toggleTeam(team)}
                        />
                        {team}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Made By</label>
                  <select
                    className="form-control"
                    value={form.madeBy}
                    onChange={(e) =>
                      setForm({ ...form, madeBy: e.target.value })
                    }
                  >
                    <option value="">Select Member</option>
                    {members.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Outcome</label>
                  <select
                    className="form-control"
                    value={form.outcome}
                    onChange={(e) =>
                      setForm({ ...form, outcome: e.target.value })
                    }
                  >
                    <option value="pending">Pending</option>
                    <option value="successful">Successful</option>
                    <option value="failed">Failed</option>
                    <option value="revisited">Revisited</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Decision Date</label>
                <input
                  className="form-control"
                  type="date"
                  value={form.decisionDate}
                  onChange={(e) =>
                    setForm({ ...form, decisionDate: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Tags (comma separated)</label>
                <input
                  className="form-control"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="react, api, architecture"
                />
              </div>

              <div className="form-group">
                <label>Alternatives Considered</label>
                {form.alternatives.map((alt, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                      marginBottom: 6,
                    }}
                  >
                    <span className="text-sm" style={{ flex: 1 }}>
                      <strong>{alt.title}</strong> — {alt.description}
                    </span>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => removeAlternative(i)}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                ))}
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <input
                    className="form-control"
                    placeholder="Alt title"
                    value={altTitle}
                    onChange={(e) => setAltTitle(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <input
                    className="form-control"
                    placeholder="Alt description"
                    value={altDesc}
                    onChange={(e) => setAltDesc(e.target.value)}
                    style={{ flex: 2 }}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={addAlternative}
                  >
                    Add
                  </button>
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
                  {editing ? "Save Changes" : "Log Decision"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Decisions;
