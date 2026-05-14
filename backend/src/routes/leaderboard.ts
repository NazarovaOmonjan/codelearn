import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";

export const leaderboardRouter = Router();

// GET /api/leaderboard
leaderboardRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = "1", limit = "50" } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: { role: "USER" },
        orderBy: { points: "desc" },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        select: {
          id: true,
          name: true,
          surname: true,
          city: true,
          school: true,
          level: true,
          points: true,
          lastLoginAt: true,
          _count: { select: { submissions: true } },
        },
      }),
      prisma.user.count({ where: { role: "USER" } }),
    ]);

    const leaderboard = users.map((user, index) => ({
      rank: (pageNum - 1) * limitNum + index + 1,
      ...user,
      totalSubmissions: user._count.submissions,
      isOnline: user.lastLoginAt
        ? new Date().getTime() - new Date(user.lastLoginAt).getTime() < 5 * 60 * 1000
        : false,
    }));

    res.json({
      status: "success",
      data: {
        leaderboard,
        pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
      },
    });
  } catch (error) {
    next(error);
  }
});
