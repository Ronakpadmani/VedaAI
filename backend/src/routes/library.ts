import { Router, Request, Response } from "express";
import { z } from "zod";
import { LibraryItem } from "../models/LibraryItem";
import { Assignment } from "../models/Assignment";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const { subject, search } = req.query;
    const filter: Record<string, unknown> = {};
    if (subject && typeof subject === "string") {
      filter.subject = new RegExp(subject, "i");
    }
    if (search && typeof search === "string") {
      filter.$or = [
        { title: new RegExp(search, "i") },
        { subject: new RegExp(search, "i") },
        { tags: new RegExp(search, "i") },
      ];
    }
    const items = await LibraryItem.find(filter).sort({ createdAt: -1 }).lean();
    res.json(items);
  } catch {
    res.status(500).json({ error: "Failed to fetch library" });
  }
});

router.post("/from-assignment/:assignmentId", async (req: Request, res: Response) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId);
    if (!assignment?.questionPaper) {
      res.status(400).json({ error: "Assignment has no generated question paper" });
      return;
    }

    const existing = await LibraryItem.findOne({
      assignmentId: assignment.id,
    });
    if (existing) {
      res.json(existing);
      return;
    }

    const paper = assignment.questionPaper;
    const item = await LibraryItem.create({
      title: assignment.title,
      subject: paper.subject,
      className: paper.className,
      assignmentId: assignment.id,
      questionPaper: paper,
      tags: [paper.subject, paper.className],
    });

    res.status(201).json(item);
  } catch {
    res.status(500).json({ error: "Failed to save to library" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const result = await LibraryItem.findByIdAndDelete(req.params.id);
    if (!result) {
      res.status(404).json({ error: "Library item not found" });
      return;
    }
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to delete library item" });
  }
});

router.post("/sync-completed", async (_req: Request, res: Response) => {
  try {
    const completed = await Assignment.find({
      status: "completed",
      questionPaper: { $exists: true },
    });

    let added = 0;
    for (const assignment of completed) {
      const exists = await LibraryItem.findOne({ assignmentId: assignment.id });
      if (!exists && assignment.questionPaper) {
        await LibraryItem.create({
          title: assignment.title,
          subject: assignment.questionPaper.subject,
          className: assignment.questionPaper.className,
          assignmentId: assignment.id,
          questionPaper: assignment.questionPaper,
          tags: [
            assignment.questionPaper.subject,
            assignment.questionPaper.className,
          ],
        });
        added++;
      }
    }

    res.json({ synced: added });
  } catch {
    res.status(500).json({ error: "Failed to sync library" });
  }
});

export default router;
