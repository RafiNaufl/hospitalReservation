import { UserRole } from "@/generated/prisma"

export interface SessionUser {
  id: string
  email: string
  role: UserRole
  name?: string | null
}

export interface CustomSession {
  user: SessionUser
}
