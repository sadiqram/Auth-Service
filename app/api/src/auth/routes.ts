import { Router } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../prisma";
import { loginSchema, registerSchema, refreshSchema, logoutSchema } from "./schema";
import { AuditAction } from "../generated/prisma/client";
import { signAccessToken, generateRefreshToken, hashRefreshToken } from "../tokens";


const router = Router();


// REGISTER
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

// LOGIN
router.post("/login", async (req, res) => {
  const ip = req.ip;
  const userAgent = req.get("user-agent") ?? undefined;

  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });

    // don’t reveal whether email exists
    if (!user) {
      await prisma.auditLog.create({
        data: { action: AuditAction.login_fail, ip, userAgent },
      });
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      await prisma.auditLog.create({
        data: { action: AuditAction.login_fail, userId: user.id, ip, userAgent },
      });
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const accessToken = signAccessToken({ sub: user.id, role: user.role });

    const { token: refreshToken, tokenHash } = generateRefreshToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    await prisma.auditLog.create({
      data: { action: AuditAction.login_success, userId: user.id, ip, userAgent },
    });

    return res.status(200).json({
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      await prisma.auditLog.create({
        data: { action: AuditAction.login_fail, ip, userAgent },
      });
      return res.status(400).json({ error: "Invalid input", details: err.issues });
    }
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// REFRESH (rotate refresh token)
router.post("/refresh", async (req, res) => {
  const ip = req.ip
  const userAgent = req.get("user-agent") ?? undefined;

  try {
    const { refreshToken } = refreshSchema.parse(req.body)
    const tokenHash = hashRefreshToken(refreshToken);

    const stored = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true }
    })



    //invalid token
    if (!stored) {
      await prisma.auditLog.create({
        data: { action: AuditAction.refresh_fail, ip, userAgent }
      })
      return res.status(401).json({ error: "Invalid refresh token" })
    }

    //revoked or expired token
    if (stored.revokedAt || stored.expiresAt <= new Date()
    ) {
      await prisma.auditLog.create({
        data: { action: AuditAction.refresh_fail, userId: stored.userId, ip, userAgent }
      })
      return res.status(401).json({ error: "Refresh token expired or revoked" })
    }

    //rotate: revoke old + create new + issue new access
    const accessToken = signAccessToken({
      sub: stored.userId, role: stored.user.role
    })

    const { token: newRefreshToken, tokenHash: newTokenHash } = generateRefreshToken();

    const newExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    await prisma.$transaction([
      prisma.refreshToken.update({
        where: { tokenHash },
        data: { revokedAt: new Date() },
      }),
      prisma.refreshToken.create({
        data: {
          userId: stored.userId,
          tokenHash: newTokenHash,
          expiresAt: newExpiresAt
        }
      }),
      prisma.auditLog.create({
        data: { action: AuditAction.refresh_success, userId: stored.userId, ip, userAgent }
      })
    ])
    return res.status(200).json({
      accessToken,
      refreshToken: newRefreshToken,
    })
  } catch (err: any) {
    if (err?.name == "ZodError") {
      await prisma.auditLog.create({
        data: { action: AuditAction.register_fail, ip, userAgent }
      })
      return res.status(400).json({ error: "Invalid input", details: err.issues })
    }
    console.error(err)
    return res.status(500).json({ error: "Internal Server Error" })
  }
})

// LOGOUT
export default router;
