"use server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, hashPassword, verifyPassword } from "@/lib/auth";
import { credentialsInput } from "@/lib/auth-validation";
function database() { if (!db) throw new Error("DATABASE_URL is not configured"); return db; }
export async function signup(form: FormData) { const parsed = credentialsInput.extend({ email: credentialsInput.shape.email.unwrap() }).safeParse(Object.fromEntries(form)); if (!parsed.success) throw new Error("Enter a valid username, email, and password"); const found = await database().select({ id: users.id }).from(users).where(eq(users.username, parsed.data.username)); if (found.length) throw new Error("Username is already taken"); const [user] = await database().insert(users).values({ username: parsed.data.username, email: parsed.data.email, passwordHash: await hashPassword(parsed.data.password) }).returning({ id: users.id }); await createSession(user.id); redirect("/"); }
export async function login(form: FormData) { const parsed = credentialsInput.pick({ username: true, password: true }).safeParse(Object.fromEntries(form)); if (!parsed.success) throw new Error("Invalid credentials"); const [user] = await database().select({ id: users.id, passwordHash: users.passwordHash }).from(users).where(eq(users.username, parsed.data.username)); if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) throw new Error("Invalid username or password"); await createSession(user.id); redirect("/"); }
