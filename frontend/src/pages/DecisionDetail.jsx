import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiCalendar, FiUser, FiFolder, FiUsers } from 'react-icons/fi';
import api from '../api/client.js';

const outcomeColors = {
  pending: 'badge-warning',
  successful: 'badge-success',
  failed: 'badge-danger',
  revisited: 'badge-info',
};

function DecisionDetail() {
  const { id } = useParams();
  const [decision, setDecision] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/decisions/${id}`).then(({ data }) => {
      setDecision(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading">Loading...</div>;
  if (!decision) return <div className="empty-state"><p>Decision not found.</p></div>;

  return (
    <div>
      <Link to="/decisions" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20, fontSize: 14 }}>
        <FiArrowLeft /> Back to Decisions
      </Link>

      <div className="detail-header">
        <div className="flex-between">
          <h2>{decision.title}</h2>
          <span className={`badge ${outcomeColors[decision.outcome]}`}>{decision.outcome}</span>
        </div>
        <div className="detail-meta mt-8">
          <span><FiCalendar /> {new Date(decision.decisionDate || decision.createdAt).toLocaleDateString()}</span>
          {decision.madeBy && <span><FiUser /> {decision.madeBy.name || decision.madeBy}</span>}
          {decision.project && <span><FiFolder /> {decision.project}</span>}
          {Array.isArray(decision.team) && decision.team.length > 0 && (
            <span><FiUsers /> {decision.team.join(" + ")}</span>
          )}
        </div>
        {decision.tags?.length > 0 && (
          <div className="tags mt-8">
            {decision.tags.map(t => <span key={t} className="tag">{t}</span>)}
          </div>
        )}
      </div>

      {decision.description && (
        <div className="detail-section">
          <h4>Description</h4>
          <div className="card"><p>{decision.description}</p></div>
        </div>
      )}

      {decision.context && (
        <div className="detail-section">
          <h4>Context & Background</h4>
          <div className="card"><p>{decision.context}</p></div>
        </div>
      )}

      {decision.constraints && (
        <div className="detail-section">
          <h4>Constraints</h4>
          <div className="card"><p>{decision.constraints}</p></div>
        </div>
      )}

      {decision.alternatives?.length > 0 && (
        <div className="detail-section">
          <h4>Alternatives Considered</h4>
          <ul className="alternatives-list">
            {decision.alternatives.map((alt, i) => (
              <li key={i}>
                <strong>{alt.title}</strong>
                {alt.description && <span>{alt.description}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default DecisionDetail;
