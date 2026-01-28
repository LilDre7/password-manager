"use client"

import React from "react"
import {
  Users,
  Landmark,
  GraduationCap,
  Briefcase,
  Shield,
  Code,
  Globe,
} from "lucide-react"
import { Category } from "@/lib/types"

interface ServiceIconProps {
  category: Category
  className?: string
}

const categoryIcons: Record<Category, React.ComponentType<{ className?: string }>> = {
  Social: Users,
  Bank: Landmark,
  Learning: GraduationCap,
  Business: Briefcase,
  Government: Shield,
  Technology: Code,
}

export function ServiceIcon({ 
  category, 
  className = "h-5 w-5" 
}: ServiceIconProps) {
  const Icon = categoryIcons[category] || Globe
  return <Icon className={className} />
}
