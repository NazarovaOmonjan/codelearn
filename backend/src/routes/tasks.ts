import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { authenticate, requireAdmin, AuthRequest } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";

export const tasksRouter = Router();

const createTaskSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10),
  category: z.string().min(2),
  difficulty: z.number().min(1).max(100),
  points: z.number().min(1),
  languages: z.array(z.string()),
  solutions: z.record(z.string()),
});

// GET /api/tasks
tasksRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, language, difficulty, sort, page = "1", limit = "20" } = req.query;

    const where: any = { isActive: true };

    if (category && category !== "all") {
      where.category = category as string;
    }

    if (language) {
      where.languages = { contains: language as string };
    }

    if (difficulty) {
      const diff = parseInt(difficulty as string);
      if (diff <= 33) {
        where.difficulty = { lte: 33 };
      } else if (diff <= 66) {
        where.difficulty = { gt: 33, lte: 66 };
      } else {
        where.difficulty = { gt: 66 };
      }
    }

    const orderBy: any = {};
    if (sort === "difficulty") orderBy.difficulty = "asc";
    else if (sort === "points") orderBy.points = "desc";
    else orderBy.createdAt = "desc";

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        orderBy,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        select: {
          id: true,
          title: true,
          category: true,
          difficulty: true,
          points: true,
          languages: true,
          createdAt: true,
          _count: { select: { submissions: true } },
        },
      }),
      prisma.task.count({ where }),
    ]);

    // Parse languages JSON string for response
    const parsedTasks = tasks.map((t) => ({
      ...t,
      languages: (() => { try { return JSON.parse(t.languages); } catch { return [t.languages]; } })(),
    }));

    res.json({
      status: "success",
      data: {
        tasks: parsedTasks,
        pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/tasks/:id
tasksRouter.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) throw new AppError("Invalid task ID", 400);

    const task = await prisma.task.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        difficulty: true,
        points: true,
        languages: true,
        createdAt: true,
        _count: { select: { submissions: true } },
      },
    });

    if (!task) throw new AppError("Task not found", 404);

    const languages = (() => { try { return JSON.parse(task.languages); } catch { return [task.languages]; } })();

    res.json({
      status: "success",
      data: { ...task, languages },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/tasks (admin)
tasksRouter.post("/", authenticate, requireAdmin, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = createTaskSchema.parse(req.body);

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        difficulty: data.difficulty,
        points: data.points,
        languages: JSON.stringify(data.languages),
        solutions: JSON.stringify(data.solutions),
      },
    });

    await prisma.adminLog.create({
      data: {
        adminId: req.user!.id,
        action: "CREATE_TASK",
        details: JSON.stringify({ taskId: task.id, title: task.title }),
      },
    });

    res.status(201).json({ status: "success", data: { ...task, languages: data.languages, solutions: data.solutions } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(error.errors[0].message, 400));
    }
    next(error);
  }
});

// PUT /api/tasks/:id (admin)
tasksRouter.put("/:id", authenticate, requireAdmin, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) throw new AppError("Invalid task ID", 400);

    const updateData: any = { ...req.body };
    if (updateData.languages) updateData.languages = JSON.stringify(updateData.languages);
    if (updateData.solutions) updateData.solutions = JSON.stringify(updateData.solutions);

    const task = await prisma.task.update({ where: { id }, data: updateData });

    await prisma.adminLog.create({
      data: {
        adminId: req.user!.id,
        action: "UPDATE_TASK",
        details: JSON.stringify({ taskId: task.id, title: task.title }),
      },
    });

    res.json({ status: "success", data: task });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/tasks/:id (admin)
tasksRouter.delete("/:id", authenticate, requireAdmin, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) throw new AppError("Invalid task ID", 400);

    await prisma.task.update({ where: { id }, data: { isActive: false } });

    await prisma.adminLog.create({
      data: {
        adminId: req.user!.id,
        action: "DELETE_TASK",
        details: JSON.stringify({ taskId: id }),
      },
    });

    res.json({ status: "success", message: "Task deleted" });
  } catch (error) {
    next(error);
  }
});
