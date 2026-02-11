import { Router } from 'express';
import Decision from '../models/Decision.js';
import Task from '../models/Task.js';
import Action from '../models/Action.js';
import Meeting from '../models/Meeting.js';
import Member from '../models/Member.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    // Auto-mark overdue actions
    await Action.updateMany(
      { status: { $in: ['pending', 'in_progress'] }, deadline: { $lt: new Date() } },
      { status: 'overdue' }
    );

    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [
      totalDecisions,
      pendingDecisions,
      activeDecisions,
      totalTasks,
      todoTasks,
      inProgressTasks,
      doneTasks,
      totalActions,
      pendingActions,
      overdueActions,
      totalMembers,
      upcomingMeetings,
      recentDecisions,
      upcomingDeadlineTasks,
      overdueActionsList,
    ] = await Promise.all([
      Decision.countDocuments(),
      Decision.countDocuments({ outcome: 'pending' }),
      Decision.countDocuments({ outcome: { $in: ['pending', 'revisited'] } }),
      Task.countDocuments(),
      Task.countDocuments({ status: 'todo' }),
      Task.countDocuments({ status: 'in_progress' }),
      Task.countDocuments({ status: 'done' }),
      Action.countDocuments(),
      Action.countDocuments({ status: { $in: ['pending', 'in_progress'] } }),
      Action.countDocuments({ status: 'overdue' }),
      Member.countDocuments(),
      Meeting.find({ date: { $gte: now } }).sort({ date: 1 }).limit(5),
      Decision.find().sort({ createdAt: -1 }).limit(5),
      Task.find({ dueDate: { $gte: now, $lte: nextWeek }, status: { $ne: 'done' } }).populate('assignee').sort({ dueDate: 1 }).limit(10),
      Action.find({ status: 'overdue' }).populate('meetingId').limit(10),
    ]);

    // Workload overview
    const members = await Member.find();
    const workloadOverview = await Promise.all(members.map(async (m) => {
      const tasks = await Task.find({ assignee: m._id, status: { $ne: 'done' } });
      const load = tasks.reduce((s, t) => s + (t.estimatedHours || 0), 0);
      const utilization = m.weeklyCapacity > 0 ? Math.round((load / m.weeklyCapacity) * 100) : 0;
      return { name: m.name, role: m.role, capacity: m.weeklyCapacity, currentLoad: load, utilization, status: utilization > 100 ? 'overloaded' : utilization > 80 ? 'high' : utilization < 30 ? 'underutilized' : 'balanced' };
    }));

    res.json({
      decisions: { total: totalDecisions, pending: pendingDecisions, active: activeDecisions },
      tasks: { total: totalTasks, todo: todoTasks, inProgress: inProgressTasks, done: doneTasks },
      actions: { total: totalActions, pending: pendingActions, overdue: overdueActions },
      team: { totalMembers },
      upcomingMeetings,
      recentDecisions,
      upcomingDeadlineTasks,
      overdueActionsList,
      workloadOverview,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
