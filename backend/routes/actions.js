import { Router } from 'express';
import Action from '../models/Action.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { status, owner } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (owner) filter.owner = { $regex: owner, $options: 'i' };
    // Auto-mark overdue
    await Action.updateMany(
      { status: { $in: ['pending', 'in_progress'] }, deadline: { $lt: new Date() } },
      { status: 'overdue' }
    );
    const actions = await Action.find(filter).populate('meetingId').sort({ deadline: 1 });
    res.json(actions);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const action = await Action.create(req.body);
    const populated = await action.populate('meetingId');
    res.status(201).json(populated);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const action = await Action.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('meetingId');
    res.json(action);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await Action.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
