import { Router } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../prisma";
import { registerSchema } from "./schema";
import { AuditAction } from "../generated/prisma/client";

const router = Router();

router.post("/register", async (req, res) => {
  const ip = req.ip;
  const userAgent = req.get("user-agent") ?? undefined;

  try {
    const { email, password } = registerSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      await prisma.auditLog.create({
        data: { action: AuditAction.register_fail, ip, userAgent },
      });
      return res.status(409).json({ error: "Email already in use" });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        // role defaults to user
        auditLogs: {
          create: { action: AuditAction.register_success, ip, userAgent },
        },
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return res.status(201).json(user);
  } catch (err: any) {
    // validation error
    if (err?.name === "ZodError") {
      await prisma.auditLog.create({
        data: { action: AuditAction.register_fail, ip, userAgent },
      });
      return res.status(400).json({ error: "Invalid input", details: err.issues });
    }

    await prisma.auditLog.create({
      data: { action: AuditAction.register_fail, ip, userAgent },
    });
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
