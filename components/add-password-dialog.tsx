"use client";

import React from "react"

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

function generatePassword(length = 16): string {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  return Array.from(crypto.getRandomValues(new Uint32Array(length)))
    .map((n) => chars[n % chars.length])
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

  const handleSubmit = async (e: React.FormEvent) => {
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
      setForm({
        service_name: "",
        username: "",
        password: "",
        category: "Technology",
        website: "",
        notes: "",
      });
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePassword = () => {
    setForm((prev) => ({ ...prev, password: generatePassword() }));
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
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, password: e.target.value }))
                  }
                  placeholder="••••••••"
                  className="border-border bg-secondary pr-10 font-mono"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleGeneratePassword}
                title="Generate password"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
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
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
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
