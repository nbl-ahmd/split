import { z } from "zod";
export const credentialsInput = z.object({ username: z.string().trim().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/), password: z.string().min(8).max(100), email: z.string().email().optional() });
