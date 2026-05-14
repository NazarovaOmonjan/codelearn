import { Router, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { authenticate, requireAdmin, AuthRequest } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";

export const usersRouter = Router();

// GET /api/users (admin only)
usersRouter.get("/", authenticate, requireAdmin, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { search, city, school, grade, page = "1", limit = "20" } = req.query;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { surname: { contains: search as string } },
        { email: { contains: search as string } },
      ];
    }

    if (city) where.city = { contains: city as string };
    if (school) where.school = { contains: school as string };
    if (grade) where.grade = grade as string;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
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
          role: true,
          createdAt: true,
          lastLoginAt: true,
          _count: { select: { submissions: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      status: "success",
      data: {
        users,
        pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/users/:id (admin only)
usersRouter.get("/:id", authenticate, requireAdmin, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) throw new AppError("Invalid user ID", 400);

    const user = await prisma.user.findUnique({
      where: { id },
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
        role: true,
        language: true,
        telegram: true,
        phone: true,
        createdAt: true,
        lastLoginAt: true,
        submissions: {
          orderBy: { createdAt: "desc" },
          take: 50,
          select: {
            id: true,
            taskId: true,
            language: true,
            result: true,
            points: true,
            createdAt: true,
            task: { select: { title: true, category: true } },
          },
        },
      },
    });

    if (!user) throw new AppError("User not found", 404);
    res.json({ status: "success", data: user });
  } catch (error) {
    next(error);
  }
});

// PUT /api/users/:id (admin only)
usersRouter.put("/:id", authenticate, requireAdmin, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) throw new AppError("Invalid user ID", 400);

    const { level, points, role } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(level !== undefined && { level }),
        ...(points !== undefined && { points }),
        ...(role !== undefined && { role }),
      },
      select: { id: true, name: true, surname: true, level: true, points: true, role: true },
    });

    await prisma.adminLog.create({
      data: {
        adminId: req.user!.id,
        action: "UPDATE_USER",
        details: JSON.stringify({ userId: id, changes: { level, points, role } }),
      },
    });

    res.json({ status: "success", data: user });
  } catch (error) {
    next(error);
  }
});
