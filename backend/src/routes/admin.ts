import { Router, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { authenticate, requireAdmin, AuthRequest } from "../middleware/auth";

export const adminRouter = Router();

adminRouter.use(authenticate, requireAdmin);

// GET /api/admin/logs
adminRouter.get("/logs", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page = "1", limit = "50" } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const [logs, total] = await Promise.all([
      prisma.adminLog.findMany({
        orderBy: { createdAt: "desc" },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        include: {
          admin: { select: { id: true, name: true, surname: true, email: true } },
        },
      }),
      prisma.adminLog.count(),
    ]);

    res.json({
      status: "success",
      data: {
        logs,
        pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/stats
adminRouter.get("/stats", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const [totalUsers, totalTasks, totalSubmissions, correctSubmissions] = await Promise.all([
      prisma.user.count({ where: { role: "USER" } }),
      prisma.task.count({ where: { isActive: true } }),
      prisma.submission.count(),
      prisma.submission.count({ where: { result: "CORRECT" } }),
    ]);

    res.json({
      status: "success",
      data: {
        totalUsers,
        totalTasks,
        totalSubmissions,
        correctSubmissions,
        successRate: totalSubmissions > 0 ? Math.round((correctSubmissions / totalSubmissions) * 100) : 0,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/message
adminRouter.post("/message", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId, message } = req.body;

    await prisma.adminLog.create({
      data: {
        adminId: req.user!.id,
        action: "SEND_MESSAGE",
        details: JSON.stringify({ userId, message }),
      },
    });

    res.json({ status: "success", message: "Message sent" });
  } catch (error) {
    next(error);
  }
});


// GET /api/admin/submissions/:taskId — view all submissions for a task
adminRouter.get("/submissions/:taskId", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const taskId = parseInt(req.params.taskId as string);
    if (isNaN(taskId)) return res.status(400).json({ status: "error", message: "Invalid task ID" });

    const submissions = await prisma.submission.findMany({
      where: { taskId },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, surname: true, email: true } },
      },
    });

    res.json({ status: "success", data: submissions });
  } catch (error) {
    next(error);
  }
});
