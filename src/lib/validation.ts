import { z } from "zod";

export const tripInput = z.object({ name: z.string().trim().min(2).max(100), destination: z.string().trim().max(100).optional(), currency: z.string().length(3).default("INR") });
export const expenseInput = z.object({ tripId: z.string().uuid(), payerId: z.string().uuid(), title: z.string().trim().min(1).max(120), category: z.string().trim().min(1).max(40), amount: z.number().int().positive(), splitMethod: z.enum(["equal", "perPerson", "weighted", "selected"]), allocations: z.array(z.object({ familyId: z.string().uuid(), amount: z.number().int().nonnegative() })).min(1) });
