"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PasswordEntry, categoryColors, type Category } from "@/lib/types";
import { ServiceIcon } from "./service-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Eye,
  EyeOff,
  Copy,
  Check,
  Pencil,
  Trash2,
  ExternalLink,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface PasswordDrawerProps {
  entry: PasswordEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (entry: PasswordEntry) => void;
  onDelete: (id: string) => void;
}

export function PasswordDrawer({
  entry,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: PasswordDrawerProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<PasswordEntry | null>(null);

  const categories: Category[] = [
    "Social",
    "Bank",
    "Learning",
    "Business",
    "Government",
    "Technology",
  ];

  if (!entry) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(entry.password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartEdit = () => {
    setEditForm({ ...entry });
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (editForm) {
      onEdit(editForm);
      toast("Contraseña actualizada", {
        description: "Los cambios se han guardado correctamente",
      });
      setIsEditing(false);
      setEditForm(null);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm(null);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col overflow-hidden border-l border-border bg-card p-0 sm:max-w-lg">
        <SheetHeader className="relative overflow-hidden bg-gradient-to-br from-secondary via-secondary/80 to-accent/30 px-6 pb-8 pt-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.04),transparent_50%)]" />
          <div className="relative flex items-start gap-4">
            <div className="group relative">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 opacity-0 blur transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-border/50 bg-background/80 shadow-lg backdrop-blur-sm transition-transform duration-300 group-hover:scale-105">
                <ServiceIcon
                  category={entry.category}
                  className="h-8 w-8 text-foreground"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2 pt-1">
              <SheetTitle className="text-xl font-semibold tracking-tight text-foreground">
                {entry.service_name}
              </SheetTitle>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium shadow-sm",
                    categoryColors[entry.category]
                  )}
                >
                  {entry.category}
                </span>
                {entry.website && (
                  <a
                    href={entry.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-full bg-background/50 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Visit
                  </a>
                )}
              </div>
            </div>
          </div>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 py-6">
          {isEditing && editForm ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="edit-category" className="text-muted-foreground">
                  Category
                </Label>
                <Select
                  value={editForm.category}
                  onValueChange={(value: Category) =>
                    setEditForm({ ...editForm, category: value })
                  }
                >
                  <SelectTrigger
                    id="edit-category"
                    className="border-border bg-secondary"
                  >
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-username" className="text-muted-foreground">
                  Email / Username
                </Label>
                <Input
                  id="edit-username"
                  value={editForm.username}
                  onChange={(e) =>
                    setEditForm({ ...editForm, username: e.target.value })
                  }
                  className="border-border bg-secondary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-password" className="text-muted-foreground">
                  Password
                </Label>
                <Input
                  id="edit-password"
                  type="text"
                  value={editForm.password}
                  onChange={(e) =>
                    setEditForm({ ...editForm, password: e.target.value })
                  }
                  className="border-border bg-secondary font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-notes" className="text-muted-foreground">
                  Notes
                </Label>
                <Textarea
                  id="edit-notes"
                  value={editForm.notes || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, notes: e.target.value })
                  }
                  className="min-h-[100px] resize-none border-border bg-secondary"
                  placeholder="Add notes..."
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={handleCancelEdit}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleSaveEdit}>
                  <Check className="mr-2 h-4 w-4" />
                  Save
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Email / Username</Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 rounded-lg bg-secondary px-4 py-3 font-mono text-sm text-foreground">
                    {entry.username}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    onClick={async () => {
                      await navigator.clipboard.writeText(entry.username);
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">Password</Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 rounded-lg bg-secondary px-4 py-3 font-mono text-sm text-foreground">
                    {showPassword ? entry.password : "••••••••••••••••"}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-primary" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {entry.notes && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Notes</Label>
                  <div className="rounded-lg bg-secondary px-4 py-3 text-sm text-foreground">
                    {entry.notes}
                  </div>
                </div>
              )}

              {entry.website && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Website</Label>
                  <a
                    href={entry.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg bg-secondary px-4 py-3 text-sm text-primary transition-colors hover:bg-accent"
                  >
                    {entry.website}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-muted-foreground">Last Updated</Label>
                <div className="rounded-lg bg-secondary px-4 py-3 text-sm text-foreground">
                  {format(new Date(entry.updated_at), "MMMM d, yyyy")}
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={handleStartEdit}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => onDelete(entry.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
