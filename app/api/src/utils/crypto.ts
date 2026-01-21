import crypto from "crypto";

export const hashApiKey = (key: string) =>
    crypto.createHash("sha256").update(key).digest("hex");

export const hashRefreshToken = (token: string) =>
    crypto.createHash("sha256").update(token).digest("hex");
