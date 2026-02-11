import { Router } from "express";
import Decision from "../models/Decision.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { search, project, team, outcome } = req.query;
    const filter = {};
    if (project) filter.project = project;
    if (team) filter.team = team;
    if (outcome) filter.outcome = outcome;
    if (search)
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    const decisions = await Decision.find(filter)
      .populate("madeBy", "name")
      .sort({ decisionDate: -1, createdAt: -1 });
    res.json(decisions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/projects", async (req, res) => {
  try {
    const projects = await Decision.distinct("project");
    res.json(projects.filter(Boolean));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const decision = await Decision.findById(req.params.id).populate(
      "madeBy",
      "name",
    );
    if (!decision) return res.status(404).json({ error: "Not found" });
    res.json(decision);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const decision = await Decision.create(req.body);
    res.status(201).json(decision);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const decision = await Decision.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(decision);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Decision.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
