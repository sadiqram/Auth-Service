import crypto from "crypto";
import jwt from "jsonwebtoken";

export function signAccessToken(payload: { sub: string, role: string }) {
    const secret = process.env.JWT_ACCESS_SECRET!;
    return jwt.sign(payload, secret, { expiresIn: "15m" });
}

export function generateRefreshToken() {
    //raw token sent to client
    const token = crypto.randomBytes(48).toString("base64url");
    //store only hash in DB
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    return { token, tokenHash }
}

export function hashRefreshToken(token: string) {
    return crypto.createHash("sha256").update(token).digest("hex")
}