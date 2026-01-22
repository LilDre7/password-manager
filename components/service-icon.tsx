"use client"

import React from "react"

import {
  Mail,
  Github,
  Instagram,
  Landmark,
  Linkedin,
  GraduationCap,
  Twitter,
  Building2,
  Cloud,
  MessageSquare,
  BookOpen,
  Globe,
} from "lucide-react"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Gmail: Mail,
  GitHub: Github,
  Instagram: Instagram,
  "Chase Bank": Landmark,
  LinkedIn: Linkedin,
  Coursera: GraduationCap,
  "Twitter / X": Twitter,
  "IRS.gov": Building2,
  AWS: Cloud,
  Slack: MessageSquare,
  Udemy: BookOpen,
  "Bank of America": Landmark,
}

interface ServiceIconProps {
  serviceName: string
  className?: string
}

export function ServiceIcon({ serviceName, className = "h-5 w-5" }: ServiceIconProps) {
  const Icon = iconMap[serviceName] || Globe
  return <Icon className={className} />
}
