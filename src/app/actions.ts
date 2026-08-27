"use server";
import { db } from "@/db";
import { expenses, expenseAllocations } from "@/db/schema";
import { expenseInput } from "@/lib/validation";

function requireDb() { if (!db) throw new Error("DATABASE_URL is not configured"); return db; }

export async function createExpense(input: unknown) {
  const data = expenseInput.parse(input); const database = requireDb();
  const allocationTotal = data.allocations.reduce((sum, allocation) => sum + allocation.amount, 0);
  if (allocationTotal !== data.amount) throw new Error("Allocations must equal the expense amount");
  const [expense] = await database.insert(expenses).values({ tripId: data.tripId, payerId: data.payerId, title: data.title, category: data.category, amount: data.amount, splitMethod: data.splitMethod }).returning();
  await database.insert(expenseAllocations).values(data.allocations.map((allocation) => ({ expenseId: expense.id, ...allocation })));
  return expense;
}
