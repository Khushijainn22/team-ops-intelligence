import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Decisions from './pages/Decisions.jsx';
import DecisionDetail from './pages/DecisionDetail.jsx';
import Team from './pages/Team.jsx';
import Tasks from './pages/Tasks.jsx';
import Meetings from './pages/Meetings.jsx';
import MeetingDetail from './pages/MeetingDetail.jsx';
import Actions from './pages/Actions.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="decisions" element={<Decisions />} />
        <Route path="decisions/:id" element={<DecisionDetail />} />
        <Route path="team" element={<Team />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="meetings" element={<Meetings />} />
        <Route path="meetings/:id" element={<MeetingDetail />} />
        <Route path="actions" element={<Actions />} />
      </Route>
    </Routes>
  );
}

export default App;
