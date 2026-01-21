import type { Request, Response, NextFunction } from "express";
import { prisma } from "../prisma";

import { hashApiKey } from "../utils/crypto";

export async function requireProject(req: Request, res: Response, next: NextFunction) {
    const rawKey = req.header("x-api-key");

    if (!rawKey) {
        return res.status(401).json({ error: "Missing x-api-key" });
    }

    const apiKeyHash = hashApiKey(rawKey);

    const project = await prisma.project.findUnique({
        where: { apiKeyHash },
        select: {
            id: true,
            name: true,
            slug: true,
            jwtAccessSecret: true,
            jwtRefreshSecret: true,
        },
    });

    if (!project) {
        return res.status(401).json({ error: "Invalid API key" });
    }

    // attach for later handlers
    (req as any).project = project;

    return next();
}
