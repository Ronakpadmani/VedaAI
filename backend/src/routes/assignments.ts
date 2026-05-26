import { Router, Request, Response } from "express";
import multer from "multer";
import { z } from "zod";
import { Assignment } from "../models/Assignment";
import { generationQueue } from "../queues/generationQueue";
import { generateQuestionPaperPdf } from "../services/pdfService";
import { publishAssignmentEvent } from "../services/eventPublisher";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "application/pdf",
      "text/plain",
      "text/markdown",
      "image/jpeg",
      "image/png",
    ];
    if (allowed.includes(file.mimetype) || file.originalname.endsWith(".txt")) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, text, JPEG, or PNG files are allowed"));
    }
  },
});

const questionTypeSchema = z.object({
  type: z.string().min(1),
  count: z.number().int().positive(),
  marksPerQuestion: z.number().positive(),
});

const createSchema = z.object({
  title: z.string().min(1, "Title is required"),
  dueDate: z.string().min(1, "Due date is required"),
  questionTypes: z.array(questionTypeSchema).min(1),
  additionalInfo: z.string().optional(),
});

router.get("/", async (_req: Request, res: Response) => {
  try {
    const assignments = await Assignment.find()
      .sort({ createdAt: -1 })
      .select("-uploadedFileText -questionPaper")
      .lean();
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch assignments" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const assignment = await Assignment.findById(req.params.id).lean();
    if (!assignment) {
      res.status(404).json({ error: "Assignment not found" });
      return;
    }
    res.json(assignment);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch assignment" });
  }
});

router.post(
  "/",
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      let body = req.body;
      if (typeof body.questionTypes === "string") {
        body = {
          ...body,
          questionTypes: JSON.parse(body.questionTypes),
        };
      }

      const parsed = createSchema.safeParse(body);
      if (!parsed.success) {
        res.status(400).json({
          error: "Validation failed",
          details: parsed.error.flatten(),
        });
        return;
      }

      let uploadedFileText: string | undefined;
      if (req.file) {
        if (
          req.file.mimetype === "text/plain" ||
          req.file.originalname.endsWith(".txt")
        ) {
          uploadedFileText = req.file.buffer.toString("utf-8");
        } else if (req.file.mimetype === "application/pdf") {
          uploadedFileText = `[PDF uploaded: ${req.file.originalname}]`;
        }
      }

      const assignment = await Assignment.create({
        title: parsed.data.title,
        dueDate: new Date(parsed.data.dueDate),
        questionTypes: parsed.data.questionTypes,
        additionalInfo: parsed.data.additionalInfo,
        uploadedFileName: req.file?.originalname,
        uploadedFileText,
        status: "draft",
      });

      res.status(201).json(assignment);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create assignment";
      res.status(500).json({ error: message });
    }
  }
);

router.post("/:id/generate", async (req: Request, res: Response) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      res.status(404).json({ error: "Assignment not found" });
      return;
    }

    if (assignment.status === "processing" || assignment.status === "queued") {
      res.status(409).json({ error: "Generation already in progress" });
      return;
    }

    const job = await generationQueue.add(
      "generate",
      { assignmentId: assignment.id },
      { jobId: `gen-${assignment.id}-${Date.now()}` }
    );

    assignment.status = "queued";
    assignment.jobId = job.id;
    assignment.progress = 0;
    assignment.progressMessage = "Queued for generation";
    assignment.error = undefined;
    await assignment.save();

    await publishAssignmentEvent({
      assignmentId: assignment.id,
      status: "queued",
      progress: 0,
      message: "Queued for generation",
    });

    res.json({
      assignmentId: assignment.id,
      jobId: job.id,
      status: "queued",
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to queue generation" });
  }
});

router.post("/:id/regenerate", async (req: Request, res: Response) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      res.status(404).json({ error: "Assignment not found" });
      return;
    }

    assignment.questionPaper = undefined;
    assignment.status = "draft";
    await assignment.save();

    const job = await generationQueue.add(
      "generate",
      { assignmentId: assignment.id },
      { jobId: `regen-${assignment.id}-${Date.now()}` }
    );

    assignment.status = "queued";
    assignment.jobId = job.id;
    assignment.progress = 0;
    assignment.progressMessage = "Regenerating question paper";
    await assignment.save();

    await publishAssignmentEvent({
      assignmentId: assignment.id,
      status: "queued",
      progress: 0,
      message: "Regenerating question paper",
    });

    res.json({
      assignmentId: assignment.id,
      jobId: job.id,
      status: "queued",
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to regenerate" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const result = await Assignment.findByIdAndDelete(req.params.id);
    if (!result) {
      res.status(404).json({ error: "Assignment not found" });
      return;
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete assignment" });
  }
});

router.get("/:id/pdf", async (req: Request, res: Response) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment?.questionPaper) {
      res.status(404).json({ error: "Question paper not ready" });
      return;
    }

    const pdf = await generateQuestionPaperPdf(assignment.questionPaper);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${assignment.title.replace(/\s+/g, "-")}.pdf"`
    );
    res.send(pdf);
  } catch (error) {
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});

export default router;
