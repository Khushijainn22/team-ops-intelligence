import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiFileText,
  FiCheckSquare,
  FiList,
  FiUsers,
  FiCalendar,
  FiAlertTriangle,
  FiClock,
  FiTrendingUp,
} from "react-icons/fi";
import api from "../api/client.js";

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data: d } = await api.get("/dashboard");
        setData(d);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (!data)
    return (
      <div className="empty-state">
        <p>Failed to load dashboard data.</p>
      </div>
    );

  const {
    decisions,
    tasks,
    actions,
    team,
    upcomingMeetings,
    recentDecisions,
    upcomingDeadlineTasks,
    upcomingDeadlineActions,
    overdueActionsList,
    workloadOverview,
  } = data;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p>Execution and visibility overview</p>
        </div>
      </div>

      <div className="stats-grid">
        <Link to="/decisions" className="stat-card">
          <div
            className="stat-icon"
            style={{
              background: "var(--primary-bg)",
              color: "var(--primary-light)",
            }}
          >
            <FiFileText />
          </div>
          <div className="stat-value">{decisions.total}</div>
          <div className="stat-label">Total Decisions</div>
          {decisions.pending > 0 && (
            <div className="text-xs mt-8" style={{ color: "var(--warning)" }}>
              {decisions.pending} pending
            </div>
          )}
        </Link>
        <Link to="/tasks" className="stat-card">
          <div
            className="stat-icon"
            style={{ background: "var(--info-bg)", color: "var(--info)" }}
          >
            <FiCheckSquare />
          </div>
          <div className="stat-value">{tasks.total}</div>
          <div className="stat-label">Total Tasks</div>
          <div className="text-xs mt-8 text-muted">
            {tasks.inProgress} in progress, {tasks.done} done
          </div>
        </Link>
        <Link to="/actions" className="stat-card">
          <div
            className="stat-icon"
            style={{ background: "var(--warning-bg)", color: "var(--warning)" }}
          >
            <FiList />
          </div>
          <div className="stat-value">{actions.pending}</div>
          <div className="stat-label">Pending Actions</div>
          {actions.overdue > 0 && (
            <div className="text-xs mt-8" style={{ color: "var(--danger)" }}>
              {actions.overdue} overdue
            </div>
          )}
        </Link>
        <Link to="/team" className="stat-card">
          <div
            className="stat-icon"
            style={{ background: "var(--success-bg)", color: "var(--success)" }}
          >
            <FiUsers />
          </div>
          <div className="stat-value">{team.totalMembers}</div>
          <div className="stat-label">Team Members</div>
        </Link>
      </div>

      <div className="dashboard-grid">
        {/* Overdue Actions */}
        {overdueActionsList && overdueActionsList.length > 0 && (
          <div className="full-width">
            <Link
              to="/actions"
              className="section-title"
              style={{ color: "var(--danger)", textDecoration: "none" }}
            >
              <FiAlertTriangle /> Overdue Actions
            </Link>
            <div className="card">
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Action</th>
                      <th>Meeting</th>
                      <th>Owner</th>
                      <th>Deadline</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overdueActionsList.map((a) => (
                      <tr key={a._id}>
                        <td style={{ fontWeight: 500 }}>{a.title}</td>
                        <td className="text-muted text-sm">
                          {a.meetingId ? (
                            <Link to={`/meetings/${a.meetingId._id}`}>
                              {a.meetingId.title}
                            </Link>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="text-sm">
                          {Array.isArray(a.owner) && a.owner.length > 0
                            ? a.owner.map((o) => o.name || o).join(" + ")
                            : "-"}
                        </td>
                        <td
                          className="text-sm"
                          style={{ color: "var(--danger)" }}
                        >
                          {a.deadline
                            ? new Date(a.deadline).toLocaleDateString()
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Upcoming Deadlines (Tasks & Actions) */}
        <div className="full-width">
          <Link className="section-title" style={{ textDecoration: "none" }}>
            <FiClock /> Upcoming Deadlines
          </Link>
          <div className="grid-2">
            <div className="card">
              <h5 className="mb-16">Tasks</h5>
              {upcomingDeadlineTasks && upcomingDeadlineTasks.length > 0 ? (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Task</th>
                        <th>Assignee</th>
                        <th>Due</th>
                      </tr>
                    </thead>
                    <tbody>
                      {upcomingDeadlineTasks.map((t) => (
                        <tr key={t._id}>
                          <td style={{ fontWeight: 500 }}>{t.title}</td>
                          <td className="text-muted text-sm">
                            {t.assignee?.name || "-"}
                          </td>
                          <td className="text-sm">
                            {new Date(t.dueDate).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted text-sm" style={{ padding: "12px 0" }}>
                  No upcoming tasks this week.
                </p>
              )}
            </div>

            <div className="card">
              <h5 className="mb-16">Action Items</h5>
              {upcomingDeadlineActions && upcomingDeadlineActions.length > 0 ? (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Action</th>
                        <th>Owner</th>
                        <th>Due</th>
                      </tr>
                    </thead>
                    <tbody>
                      {upcomingDeadlineActions.map((a) => (
                        <tr key={a._id}>
                          <td style={{ fontWeight: 500 }}>{a.title}</td>
                          <td className="text-muted text-sm">
                            {Array.isArray(a.owner) && a.owner.length > 0
                              ? a.owner.map((o) => o.name || o).join(" + ")
                              : "-"}
                          </td>
                          <td className="text-sm">
                            {new Date(a.deadline).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted text-sm" style={{ padding: "12px 0" }}>
                  No upcoming actions this week.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Upcoming Meetings */}
        <div>
          <Link
            to="/meetings"
            className="section-title"
            style={{ textDecoration: "none" }}
          >
            <FiCalendar /> Upcoming Meetings
          </Link>
          <div className="card">
            {upcomingMeetings && upcomingMeetings.length > 0 ? (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Meeting</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingMeetings.map((m) => (
                      <tr key={m._id}>
                        <td>
                          <Link
                            to={`/meetings/${m._id}`}
                            style={{ fontWeight: 500 }}
                          >
                            {m.title}
                          </Link>
                        </td>
                        <td className="text-sm">
                          {new Date(m.date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted text-sm" style={{ padding: "12px 0" }}>
                No upcoming meetings.
              </p>
            )}
          </div>
        </div>

        {/* Recent Decisions */}
        <div>
          <Link
            to="/decisions"
            className="section-title"
            style={{ textDecoration: "none" }}
          >
            <FiFileText /> Recent Decisions
          </Link>
          <div className="card">
            {recentDecisions && recentDecisions.length > 0 ? (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Decision</th>
                      <th>Outcome</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentDecisions.map((d) => (
                      <tr key={d._id}>
                        <td>
                          <Link
                            to={`/decisions/${d._id}`}
                            style={{ fontWeight: 500 }}
                          >
                            {d.title}
                          </Link>
                        </td>
                        <td>
                          <span
                            className={`badge ${d.outcome === "successful" ? "badge-success" : d.outcome === "failed" ? "badge-danger" : d.outcome === "revisited" ? "badge-info" : "badge-warning"}`}
                          >
                            {d.outcome}
                          </span>
                        </td>
                        <td className="text-muted text-sm">
                          {new Date(d.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted text-sm" style={{ padding: "12px 0" }}>
                No decisions yet.
              </p>
            )}
          </div>
        </div>

        {/* Team Workload Overview */}
        <div>
          <Link
            to="/team"
            className="section-title"
            style={{ textDecoration: "none" }}
          >
            <FiTrendingUp /> Team Workload
          </Link>
          <div className="card">
            {workloadOverview && workloadOverview.length > 0 ? (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                {workloadOverview.map((m, i) => (
                  <div key={i}>
                    <div className="flex-between mb-4">
                      <div>
                        <span style={{ fontWeight: 500, fontSize: 14 }}>
                          {m.name}
                        </span>
                        <span
                          className="text-muted text-xs"
                          style={{ marginLeft: 8 }}
                        >
                          {m.role}
                        </span>
                      </div>
                      <div className="capacity-status">
                        <span className={`capacity-dot ${m.status}`}></span>
                        {m.utilization}%
                      </div>
                    </div>
                    <div className="workload-bar">
                      <div
                        className="workload-bar-fill"
                        style={{
                          width: `${Math.min(m.utilization, 100)}%`,
                          background:
                            m.status === "overloaded"
                              ? "var(--danger)"
                              : m.status === "high"
                                ? "var(--warning)"
                                : m.status === "underutilized"
                                  ? "var(--info)"
                                  : "var(--success)",
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-muted mt-8">
                      {m.currentLoad}h / {m.capacity}h weekly
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted text-sm" style={{ padding: "12px 0" }}>
                Add team members to see workload.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
