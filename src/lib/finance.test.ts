import { describe, expect, it } from "vitest";
import { allocateRoundedAmount, calculateExpenseShares, calculateNetBalances, generateSettlementTransfers } from "./finance";
const families = [{ id: "a", name: "A", adults: 2, children: 0, infants: 0 }, { id: "b", name: "B", adults: 1, children: 1, infants: 0 }, { id: "c", name: "C", adults: 0, children: 0, infants: 1 }];
describe("finance engine", () => {
  it("allocates every minor unit", () => expect(allocateRoundedAmount(100, [1, 1, 1]).reduce((a, b) => a + b, 0)).toBe(100));
  it("supports weighted shares", () => expect(calculateExpenseShares(100, families, "weighted")).toEqual([{ familyId: "a", amount: 57 }, { familyId: "b", amount: 43 }, { familyId: "c", amount: 0 }]));
  it("keeps balances at zero", () => { const b = calculateNetBalances(["a", "b"], [{ payerId: "a", allocations: [{ familyId: "a", amount: 50 }, { familyId: "b", amount: 50 }] }], [{ senderId: "b", receiverId: "a", amount: 20 }]); expect(b).toEqual({ a: 30, b: -30 }); expect(Object.values(b).reduce((a, v) => a + v, 0)).toBe(0); });
  it("minimizes settlement transfers", () => expect(generateSettlementTransfers({ a: 80, b: -50, c: -30 })).toEqual([{ fromId: "b", toId: "a", amount: 50 }, { fromId: "c", toId: "a", amount: 30 }]));
});
