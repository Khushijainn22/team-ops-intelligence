import { Router } from 'express';
import Task from '../models/Task.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { assignee, status, project } = req.query;
    const filter = {};
    if (assignee) filter.assignee = assignee;
    if (status) filter.status = status;
    if (project) filter.project = project;
    const tasks = await Task.find(filter).populate('assignee').sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const task = await Task.create(req.body);
    const populated = await task.populate('assignee');
    res.status(201).json(populated);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('assignee');
    res.json(task);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
