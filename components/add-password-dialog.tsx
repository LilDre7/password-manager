"use client";

import { useState } from "react";
import { Category } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Eye, EyeOff, RefreshCw, Loader2 } from "lucide-react";

interface AddPasswordDialogProps {
  onAdd: (entry: {
    service_name: string;
    username: string;
    password: string;
    website?: string;
    category: Category;
    notes?: string;
  }) => Promise<void>;
}

const categories: Category[] = [
  "Social",
  "Bank",
  "Learning",
  "Business",
  "Government",
  "Technology",
];

const PASSWORD_LENGTH = 16;
const PASSWORD_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";

function generatePassword(): string {
  return Array.from(crypto.getRandomValues(new Uint32Array(PASSWORD_LENGTH)))
    .map((n) => PASSWORD_CHARS[n % PASSWORD_CHARS.length])
    .join("");
}

export function AddPasswordDialog({ onAdd }: AddPasswordDialogProps) {
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    service_name: "",
    username: "",
    password: "",
    category: "Technology" as Category,
    website: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onAdd({
        service_name: form.service_name,
        username: form.username,
        password: form.password,
        category: form.category,
        website: form.website || undefined,
        notes: form.notes || undefined,
      });
      handleResetForm();
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePassword = () => {
    setForm((prev) => ({ ...prev, password: generatePassword() }));
  };

  const handleResetForm = () => {
    setForm({
      service_name: "",
      username: "",
      password: "",
      category: "Technology",
      website: "",
      notes: "",
    });
    setShowPassword(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Password</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="border-border bg-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add New Password</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="serviceName">Service Name *</Label>
            <Input
              id="serviceName"
              required
              value={form.service_name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, service_name: e.target.value }))
              }
              placeholder="e.g., Gmail, GitHub"
              className="border-border bg-secondary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Email / Username *</Label>
            <Input
              id="username"
              required
              value={form.username}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, username: e.target.value }))
              }
              placeholder="your@email.com or username"
              className="border-border bg-secondary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={form.password}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, password: e.target.value }))
                }
                placeholder="Enter or generate password"
                className="border-border bg-secondary pr-16 font-mono"
              />
              <div className="absolute right-1 top-1/2 flex -translate-y-1/2 gap-0.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleGeneratePassword}
                  className="h-7 w-7"
                  title="Generate password"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="h-7 w-7"
                >
                  {showPassword ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={form.category}
              onValueChange={(value) =>
                setForm((prev) => ({ ...prev, category: value as Category }))
              }
            >
              <SelectTrigger className="border-border bg-secondary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-border bg-popover">
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website (optional)</Label>
            <Input
              id="website"
              type="url"
              value={form.website}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, website: e.target.value }))
              }
              placeholder="https://example.com"
              className="border-border bg-secondary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, notes: e.target.value }))
              }
              placeholder="Additional notes..."
              className="min-h-[80px] resize-none border-border bg-secondary"
            />
          </div>

          <Button type="submit" className="mt-2 w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              "Add Password"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
