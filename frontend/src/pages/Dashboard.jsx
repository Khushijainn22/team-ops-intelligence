import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiFileText, FiCheckSquare, FiList, FiUsers,
  FiCalendar, FiAlertTriangle, FiClock, FiTrendingUp
} from 'react-icons/fi';
import api from '../api/client.js';

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data: d } = await api.get('/dashboard');
        setData(d);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (!data) return <div className="empty-state"><p>Failed to load dashboard data.</p></div>;

  const { decisions, tasks, actions, team, upcomingMeetings, recentDecisions, upcomingDeadlineTasks, overdueActionsList, workloadOverview } = data;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p>Execution and visibility overview</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--primary-bg)', color: 'var(--primary-light)' }}><FiFileText /></div>
          <div className="stat-value">{decisions.total}</div>
          <div className="stat-label">Total Decisions</div>
          {decisions.pending > 0 && <div className="text-xs mt-8" style={{ color: 'var(--warning)' }}>{decisions.pending} pending</div>}
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--info-bg)', color: 'var(--info)' }}><FiCheckSquare /></div>
          <div className="stat-value">{tasks.total}</div>
          <div className="stat-label">Total Tasks</div>
          <div className="text-xs mt-8 text-muted">{tasks.inProgress} in progress, {tasks.done} done</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}><FiList /></div>
          <div className="stat-value">{actions.pending}</div>
          <div className="stat-label">Pending Actions</div>
          {actions.overdue > 0 && <div className="text-xs mt-8" style={{ color: 'var(--danger)' }}>{actions.overdue} overdue</div>}
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}><FiUsers /></div>
          <div className="stat-value">{team.totalMembers}</div>
          <div className="stat-label">Team Members</div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Overdue Actions */}
        {overdueActionsList && overdueActionsList.length > 0 && (
          <div className="full-width">
            <div className="section-title" style={{ color: 'var(--danger)' }}>
              <FiAlertTriangle /> Overdue Actions
            </div>
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
                    {overdueActionsList.map(a => (
                      <tr key={a._id}>
                        <td style={{ fontWeight: 500 }}>{a.title}</td>
                        <td className="text-muted text-sm">
                          {a.meetingId ? <Link to={`/meetings/${a.meetingId._id}`}>{a.meetingId.title}</Link> : '-'}
                        </td>
                        <td className="text-sm">{a.owner}</td>
                        <td className="text-sm" style={{ color: 'var(--danger)' }}>
                          {a.deadline ? new Date(a.deadline).toLocaleDateString() : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Upcoming Deadlines */}
        <div>
          <div className="section-title"><FiClock /> Upcoming Deadlines</div>
          <div className="card">
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
                    {upcomingDeadlineTasks.map(t => (
                      <tr key={t._id}>
                        <td style={{ fontWeight: 500 }}>{t.title}</td>
                        <td className="text-muted text-sm">{t.assignee?.name || '-'}</td>
                        <td className="text-sm">{new Date(t.dueDate).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted text-sm" style={{ padding: '12px 0' }}>No upcoming deadlines this week.</p>
            )}
          </div>
        </div>

        {/* Upcoming Meetings */}
        <div>
          <div className="section-title"><FiCalendar /> Upcoming Meetings</div>
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
                    {upcomingMeetings.map(m => (
                      <tr key={m._id}>
                        <td><Link to={`/meetings/${m._id}`} style={{ fontWeight: 500 }}>{m.title}</Link></td>
                        <td className="text-sm">{new Date(m.date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted text-sm" style={{ padding: '12px 0' }}>No upcoming meetings.</p>
            )}
          </div>
        </div>

        {/* Recent Decisions */}
        <div>
          <div className="section-title"><FiFileText /> Recent Decisions</div>
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
                    {recentDecisions.map(d => (
                      <tr key={d._id}>
                        <td><Link to={`/decisions/${d._id}`} style={{ fontWeight: 500 }}>{d.title}</Link></td>
                        <td>
                          <span className={`badge ${d.outcome === 'successful' ? 'badge-success' : d.outcome === 'failed' ? 'badge-danger' : d.outcome === 'revisited' ? 'badge-info' : 'badge-warning'}`}>
                            {d.outcome}
                          </span>
                        </td>
                        <td className="text-muted text-sm">{new Date(d.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted text-sm" style={{ padding: '12px 0' }}>No decisions yet.</p>
            )}
          </div>
        </div>

        {/* Team Workload Overview */}
        <div>
          <div className="section-title"><FiTrendingUp /> Team Workload</div>
          <div className="card">
            {workloadOverview && workloadOverview.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {workloadOverview.map((m, i) => (
                  <div key={i}>
                    <div className="flex-between mb-4">
                      <div>
                        <span style={{ fontWeight: 500, fontSize: 14 }}>{m.name}</span>
                        <span className="text-muted text-xs" style={{ marginLeft: 8 }}>{m.role}</span>
                      </div>
                      <div className="capacity-status">
                        <span className={`capacity-dot ${m.status}`}></span>
                        {m.utilization}%
                      </div>
                    </div>
                    <div className="workload-bar">
                      <div className="workload-bar-fill" style={{
                        width: `${Math.min(m.utilization, 100)}%`,
                        background: m.status === 'overloaded' ? 'var(--danger)' : m.status === 'high' ? 'var(--warning)' : m.status === 'underutilized' ? 'var(--info)' : 'var(--success)'
                      }}></div>
                    </div>
                    <div className="text-xs text-muted mt-8">{m.currentLoad}h / {m.capacity}h weekly</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted text-sm" style={{ padding: '12px 0' }}>Add team members to see workload.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
