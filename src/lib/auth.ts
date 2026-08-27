import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET || "development-only-change-me");
const cookieName = "tripsplit_session";

export async function hashPassword(password: string) { return bcrypt.hash(password, 12); }
export async function verifyPassword(password: string, hash: string) { return bcrypt.compare(password, hash); }
export async function createSession(userId: string) { const token = await new SignJWT({ userId }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(secret); (await cookies()).set(cookieName, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 }); }
export async function getSessionUserId() { const token = (await cookies()).get(cookieName)?.value; if (!token) return null; try { const { payload } = await jwtVerify(token, secret); return typeof payload.userId === "string" ? payload.userId : null; } catch { return null; } }
export async function clearSession() { (await cookies()).delete(cookieName); }
