import { Router } from 'express';
import Member from '../models/Member.js';
import Task from '../models/Task.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const members = await Member.find().sort({ name: 1 });
    const membersWithLoad = await Promise.all(members.map(async (m) => {
      const tasks = await Task.find({ assignee: m._id, status: { $ne: 'done' } });
      const currentLoad = tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
      return { ...m.toObject(), currentLoad, activeTasks: tasks.length };
    }));
    res.json(membersWithLoad);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const member = await Member.create(req.body);
    res.status(201).json(member);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const member = await Member.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(member);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await Member.findByIdAndDelete(req.params.id);
    await Task.deleteMany({ assignee: req.params.id });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
