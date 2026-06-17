"use client";

import { Check, Store as StoreIcon, Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Store } from "@/types";

interface StoreCardProps {
  store: Store;
  isSelected: boolean;
  onSelect: (store: Store) => void;
  onDelete: (storeId: string) => void;
}

export function StoreCard({
  store,
  isSelected,
  onSelect,
  onDelete,
}: StoreCardProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <Card
        className={`cursor-pointer transition-all hover:shadow-sm ${
          isSelected ? "ring-1 ring-ring" : ""
        }`}
        onClick={() => onSelect(store)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-1.5">
                <StoreIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <p className="text-sm font-medium truncate">{store.name}</p>
                {isSelected && (
                  <Badge variant="secondary" className="h-4 px-1 text-2xs">
                    <Check className="mr-0.5 h-2.5 w-2.5" />
                    Selected
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground font-mono truncate">
                {store.id}
              </p>
              <p className="text-xs text-muted-foreground">
                Created {new Date(store.created_at).toLocaleDateString()}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                setDeleteOpen(true);
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Store</DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to delete &quot;{store.name}&quot;? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="h-7 text-xs"
              onClick={() => {
                onDelete(store.id);
                setDeleteOpen(false);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
