"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AuthorizationModel, Userset } from "@/types";

interface ModelViewerProps {
  model: AuthorizationModel;
}

export function ModelViewer({ model }: ModelViewerProps) {
  const types = model.type_definitions || [];

  const getRelationDescription = (
    relations: Record<string, Userset>,
    name: string,
  ): string => {
    const def = relations[name];
    if (!def) return "";

    if (def.union) return "union";
    if (def.intersection) return "intersection";
    if (def.difference) return "difference";
    if (def.tupleToUserset) return "from";
    if (def.computedUserset) return "computed";
    if ("this" in def) return "direct";
    return "";
  };

  return (
    <Card className="shadow-none overflow-hidden">
      <CardHeader className="pb-2 px-4 pt-3">
        <CardTitle className="text-xs font-medium">Type Definitions</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 max-h-[420px] overflow-auto">
        {types.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-8">
            No types defined
          </p>
        ) : (
          <div className="space-y-3">
            {types.map((typeDef) => {
              const relations = typeDef.relations || {};
              const relationNames = Object.keys(relations);
              return (
                <div key={typeDef.type} className="rounded-md border p-3">
                  <p className="text-sm font-semibold mb-2">{typeDef.type}</p>
                  {relationNames.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      No relations
                    </p>
                  ) : (
                    <div className="space-y-1">
                      {relationNames.map((name) => {
                        const desc = getRelationDescription(relations, name);
                        return (
                          <div
                            key={name}
                            className="flex items-center gap-2 text-xs"
                          >
                            <Badge
                              variant="secondary"
                              className="h-4 px-1.5 text-2xs font-mono"
                            >
                              {name}
                            </Badge>
                            {desc && (
                              <span className="text-2xs text-muted-foreground">
                                {desc}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
