import { Router, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { authenticate, AuthRequest } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";

export const profileRouter = Router();

const updateProfileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  surname: z.string().min(2).max(50).optional(),
  email: z.string().min(1).optional(),
  password: z.string().min(6).optional(),
  city: z.string().optional(),
  school: z.string().optional(),
  grade: z.string().optional(),
  telegram: z.string().optional(),
  phone: z.string().optional(),
  language: z.enum(["UZ", "RU", "EN"]).optional(),
});

// GET /api/profile
profileRouter.get("/", authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        name: true,
        surname: true,
        email: true,
        city: true,
        school: true,
        grade: true,
        level: true,
        points: true,
        language: true,
        role: true,
        avatar: true,
        telegram: true,
        phone: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) throw new AppError("User not found", 404);

    const submissions = await prisma.submission.findMany({
      where: { userId: req.user!.id },
      select: { result: true, taskId: true },
    });

    const correct = submissions.filter((s) => s.result === "CORRECT");
    const incorrect = submissions.filter((s) => s.result === "INCORRECT");
    const solvedTaskIds = [...new Set(correct.map((s) => s.taskId))];

    res.json({
      status: "success",
      data: {
        ...user,
        stats: {
          correct: correct.length,
          incorrect: incorrect.length,
          total: submissions.length,
          solvedTasks: solvedTaskIds.length,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/profile
profileRouter.put("/", authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = updateProfileSchema.parse(req.body);

    // If password is being changed, hash it
    let updateData: any = { ...data };
    if (data.password) {
      const bcrypt = require("bcryptjs");
      updateData.password = await bcrypt.hash(data.password, 12);
    }

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        surname: true,
        email: true,
        city: true,
        school: true,
        grade: true,
        level: true,
        points: true,
        language: true,
        telegram: true,
        phone: true,
      },
    });

    res.json({ status: "success", data: user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(error.errors[0].message, 400));
    }
    next(error);
  }
});

// GET /api/profile/:userId
profileRouter.get("/:userId", async (req, res: Response, next: NextFunction) => {
  try {
    const userId = parseInt(req.params.userId as string);
    if (isNaN(userId)) throw new AppError("Invalid user ID", 400);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        surname: true,
        city: true,
        school: true,
        level: true,
        points: true,
        createdAt: true,
      },
    });

    if (!user) throw new AppError("User not found", 404);

    const solvedCount = await prisma.submission.groupBy({
      by: ["taskId"],
      where: { userId, result: "CORRECT" },
    });

    res.json({
      status: "success",
      data: { ...user, solvedTasks: solvedCount.length },
    });
  } catch (error) {
    next(error);
  }
});
