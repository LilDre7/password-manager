export type Category =
  | "Social"
  | "Bank"
  | "Learning"
  | "Business"
  | "Government"
  | "Technology";

export interface PasswordEntry {
  id: string;
  user_id: string;
  service_name: string;
  username: string;
  password: string;
  website: string | null;
  category: Category;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const categoryColors: Record<Category, string> = {
  Social: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Bank: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Learning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Business: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  Government: "bg-red-500/10 text-red-400 border-red-500/20",
  Technology: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
};
