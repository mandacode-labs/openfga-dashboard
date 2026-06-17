import type { Userset } from "@/types";

export function getRelationDescription(
  relations: Record<string, Userset>,
  name: string,
): string {
  const def = relations[name];
  if (!def) return "";

  if (def.union) return "union";
  if (def.intersection) return "intersection";
  if (def.difference) return "difference";
  if (def.tupleToUserset) return "from";
  if (def.computedUserset) return "computed";
  if ("this" in def) return "direct";
  return "";
}
