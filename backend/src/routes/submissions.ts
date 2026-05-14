import { Router, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { authenticate, AuthRequest } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import { checkSolution } from "../services/checker";

export const submissionsRouter = Router();

const submitSchema = z.object({
  taskId: z.number(),
  language: z.string(),
  code: z.string().min(1).max(50000),
});

// POST /api/submissions
submissionsRouter.post("/", authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = submitSchema.parse(req.body);
    const userId = req.user!.id;

    const task = await prisma.task.findUnique({ where: { id: data.taskId } });
    if (!task) throw new AppError("Task not found", 404);
    if (!task.isActive) throw new AppError("Task is not available", 400);

    const taskLanguages: string[] = JSON.parse(task.languages);
    if (!taskLanguages.includes(data.language)) {
      throw new AppError("This language is not supported for this task", 400);
    }

    const solutions: Record<string, string> = JSON.parse(task.solutions);
    const result = await checkSolution(data.code, data.language, solutions);
    const earnedPoints = result.isCorrect ? task.points : 0;

    const submission = await prisma.submission.create({
      data: {
        userId,
        taskId: data.taskId,
        language: data.language,
        code: data.code,
        result: result.isCorrect ? "CORRECT" : "INCORRECT",
        points: earnedPoints,
        output: result.output,
        error: result.error,
      },
    });

    if (result.isCorrect) {
      const previousCorrect = await prisma.submission.findFirst({
        where: { userId, taskId: data.taskId, result: "CORRECT", id: { not: submission.id } },
      });

      if (!previousCorrect) {
        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: { points: { increment: earnedPoints } },
        });

        let newLevel = 1;
        if (updatedUser.points >= 5000) newLevel = 3;
        else if (updatedUser.points >= 2000) newLevel = 2;

        if (newLevel !== updatedUser.level) {
          await prisma.user.update({ where: { id: userId }, data: { level: newLevel } });
        }
      }
    }

    res.status(201).json({
      status: "success",
      data: {
        id: submission.id,
        result: submission.result,
        points: submission.points,
        output: submission.output,
        error: submission.error,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(error.errors[0].message, 400));
    }
    next(error);
  }
});

// GET /api/submissions
submissionsRouter.get("/", authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { taskId, page = "1", limit = "20" } = req.query;

    const where: any = { userId };
    if (taskId) where.taskId = parseInt(taskId as string);

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const [submissions, total] = await Promise.all([
      prisma.submission.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        include: {
          task: { select: { id: true, title: true, category: true, difficulty: true } },
        },
      }),
      prisma.submission.count({ where }),
    ]);

    res.json({
      status: "success",
      data: {
        submissions,
        pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
      },
    });
  } catch (error) {
    next(error);
  }
});
