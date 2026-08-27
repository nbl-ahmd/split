export type SplitMethod = "equal" | "perPerson" | "weighted" | "selected";
export type Family = { id: string; name: string; adults: number; children: number; infants: number };
export type Allocation = { familyId: string; amount: number };
export type Contribution = { senderId: string; receiverId: string; amount: number };

export function allocateRoundedAmount(amount: number, weights: number[]): number[] {
  if (amount < 0 || weights.some((w) => w < 0) || weights.every((w) => w === 0)) throw new Error("Invalid split weights");
  const total = weights.reduce((a, b) => a + b, 0);
  const exact = weights.map((w) => (amount * w) / total);
  const result = exact.map(Math.floor);
  let remainder = amount - result.reduce((a, b) => a + b, 0);
  exact.map((value, index) => ({ index, fraction: value - result[index] }))
    .sort((a, b) => b.fraction - a.fraction || a.index - b.index)
    .forEach(({ index }) => { if (remainder > 0) { result[index]++; remainder--; } });
  return result;
}

export function calculateExpenseShares(amount: number, families: Family[], method: SplitMethod, selectedIds = families.map((f) => f.id)): Allocation[] {
  const selected = families.filter((f) => selectedIds.includes(f.id));
  if (!selected.length) throw new Error("Select at least one family");
  const weights = selected.map((f) => method === "equal" || method === "selected" ? 1 : method === "perPerson" ? f.adults + f.children + f.infants : f.adults + f.children * 0.5 + f.infants * 0);
  if (weights.every((w) => w === 0)) throw new Error("Selected families have no members");
  return selected.map((f, i) => ({ familyId: f.id, amount: allocateRoundedAmount(amount, weights)[i] }));
}

export function calculateFamilyTotals(familyIds: string[], expenses: { payerId: string; allocations: Allocation[] }[]) {
  const paid = Object.fromEntries(familyIds.map((id) => [id, 0]));
  const owed = Object.fromEntries(familyIds.map((id) => [id, 0]));
  expenses.forEach((expense) => { paid[expense.payerId] += expense.allocations.reduce((s, a) => s + a.amount, 0); expense.allocations.forEach((a) => { owed[a.familyId] += a.amount; }); });
  return { paid, owed };
}

export function calculateNetBalances(familyIds: string[], expenses: { payerId: string; allocations: Allocation[] }[], contributions: Contribution[]) {
  const { paid, owed } = calculateFamilyTotals(familyIds, expenses);
  const sent = Object.fromEntries(familyIds.map((id) => [id, 0]));
  const received = Object.fromEntries(familyIds.map((id) => [id, 0]));
  contributions.forEach((c) => { sent[c.senderId] += c.amount; received[c.receiverId] += c.amount; });
  return Object.fromEntries(familyIds.map((id) => [id, paid[id] + sent[id] - owed[id] - received[id]]));
}

export function generateSettlementTransfers(balances: Record<string, number>) {
  const debtors = Object.entries(balances).filter(([, v]) => v < 0).map(([id, amount]) => ({ id, amount: -amount })).sort((a, b) => b.amount - a.amount);
  const creditors = Object.entries(balances).filter(([, v]) => v > 0).map(([id, amount]) => ({ id, amount })).sort((a, b) => b.amount - a.amount);
  const transfers: { fromId: string; toId: string; amount: number }[] = [];
  let d = 0, c = 0;
  while (d < debtors.length && c < creditors.length) { const amount = Math.min(debtors[d].amount, creditors[c].amount); if (amount) transfers.push({ fromId: debtors[d].id, toId: creditors[c].id, amount }); debtors[d].amount -= amount; creditors[c].amount -= amount; if (!debtors[d].amount) d++; if (!creditors[c].amount) c++; }
  return transfers;
}
