export type Category = 
  | "Social" 
  | "Bank" 
  | "Learning" 
  | "Business" 
  | "Government" 
  | "Technology"

export interface PasswordEntry {
  id: string
  serviceName: string
  email: string
  username?: string
  password: string
  category: Category
  lastUpdated: Date
  notes?: string
  website?: string
}

export const mockPasswords: PasswordEntry[] = [
  {
    id: "1",
    serviceName: "Gmail",
    email: "john.doe@gmail.com",
    password: "Str0ng!P@ssw0rd#2024",
    category: "Technology",
    lastUpdated: new Date("2024-01-15"),
    website: "https://gmail.com",
    notes: "Primary email account"
  },
  {
    id: "2",
    serviceName: "GitHub",
    email: "johndoe@github.com",
    username: "johndoe",
    password: "G!tHub$ecure123",
    category: "Technology",
    lastUpdated: new Date("2024-01-10"),
    website: "https://github.com",
    notes: "Work and personal projects"
  },
  {
    id: "3",
    serviceName: "Instagram",
    email: "john.doe@gmail.com",
    username: "johndoe_official",
    password: "1nst@Gr@m!2024",
    category: "Social",
    lastUpdated: new Date("2024-01-08"),
    website: "https://instagram.com"
  },
  {
    id: "4",
    serviceName: "Chase Bank",
    email: "john.doe@email.com",
    username: "johndoe_chase",
    password: "B@nk!ng$ecure456",
    category: "Bank",
    lastUpdated: new Date("2024-01-05"),
    website: "https://chase.com",
    notes: "Primary checking account"
  },
  {
    id: "5",
    serviceName: "LinkedIn",
    email: "john.doe@gmail.com",
    password: "L!nked1n#Prof",
    category: "Business",
    lastUpdated: new Date("2024-01-03"),
    website: "https://linkedin.com",
    notes: "Professional networking"
  },
  {
    id: "6",
    serviceName: "Coursera",
    email: "john.doe@gmail.com",
    password: "Le@rn!ng#2024",
    category: "Learning",
    lastUpdated: new Date("2024-01-02"),
    website: "https://coursera.org",
    notes: "Online courses"
  },
  {
    id: "7",
    serviceName: "Twitter / X",
    email: "john.doe@gmail.com",
    username: "johndoe_x",
    password: "Tw!tter$ecure789",
    category: "Social",
    lastUpdated: new Date("2023-12-28"),
    website: "https://x.com"
  },
  {
    id: "8",
    serviceName: "IRS.gov",
    email: "john.doe@email.com",
    password: "G0v3rnm3nt!S@fe",
    category: "Government",
    lastUpdated: new Date("2023-12-20"),
    website: "https://irs.gov",
    notes: "Tax filing account"
  },
  {
    id: "9",
    serviceName: "AWS",
    email: "john.doe@work.com",
    password: "@WS_Cl0ud#Admin",
    category: "Technology",
    lastUpdated: new Date("2023-12-15"),
    website: "https://aws.amazon.com",
    notes: "Cloud infrastructure"
  },
  {
    id: "10",
    serviceName: "Slack",
    email: "john.doe@work.com",
    password: "Sl@ck!Work2024",
    category: "Business",
    lastUpdated: new Date("2023-12-10"),
    website: "https://slack.com",
    notes: "Team communication"
  },
  {
    id: "11",
    serviceName: "Udemy",
    email: "john.doe@gmail.com",
    password: "Ud3my#Learn!ng",
    category: "Learning",
    lastUpdated: new Date("2023-12-05"),
    website: "https://udemy.com"
  },
  {
    id: "12",
    serviceName: "Bank of America",
    email: "john.doe@email.com",
    username: "johndoe_boa",
    password: "B0A_$ecure!999",
    category: "Bank",
    lastUpdated: new Date("2023-12-01"),
    website: "https://bankofamerica.com",
    notes: "Savings account"
  }
]

export const categoryColors: Record<Category, string> = {
  Social: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Bank: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  Learning: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Business: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  Government: "bg-red-500/20 text-red-400 border-red-500/30",
  Technology: "bg-violet-500/20 text-violet-400 border-violet-500/30"
}
