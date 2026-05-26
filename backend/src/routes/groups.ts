import { Router, Request, Response } from "express";
import { z } from "zod";
import { Group } from "../models/Group";

const router = Router();

const createSchema = z.object({
  name: z.string().min(1),
  grade: z.string().min(1),
  section: z.string().min(1),
  subject: z.string().min(1),
  studentCount: z.number().int().positive(),
  description: z.string().optional(),
});

router.get("/", async (_req: Request, res: Response) => {
  try {
    const groups = await Group.find().sort({ createdAt: -1 }).lean();
    res.json(groups);
  } catch {
    res.status(500).json({ error: "Failed to fetch groups" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
      return;
    }
    const group = await Group.create(parsed.data);
    res.status(201).json(group);
  } catch {
    res.status(500).json({ error: "Failed to create group" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const result = await Group.findByIdAndDelete(req.params.id);
    if (!result) {
      res.status(404).json({ error: "Group not found" });
      return;
    }
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to delete group" });
  }
});

export default router;
