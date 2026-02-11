import { Router } from 'express';
import Meeting from '../models/Meeting.js';
import Action from '../models/Action.js';
import Decision from '../models/Decision.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { search, title } = req.query;
    const filter = {};
    if (title) filter.title = title;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const meetings = await Meeting.find(filter)
      .populate('attendees', 'name')
      .sort({ date: -1 });
    res.json(meetings);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id).populate('attendees', 'name');
    if (!meeting) return res.status(404).json({ error: 'Not found' });
    const actions = await Action.find({ meetingId: req.params.id });
    const decisions = await Decision.find({ meetingId: req.params.id }).populate('madeBy', 'name');
    res.json({ ...meeting.toObject(), actions, decisions });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const meeting = await Meeting.create(req.body);
    res.status(201).json(meeting);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const meeting = await Meeting.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(meeting);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await Meeting.findByIdAndDelete(req.params.id);
    await Action.deleteMany({ meetingId: req.params.id });
    await Decision.updateMany({ meetingId: req.params.id }, { meetingId: null });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
