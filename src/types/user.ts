export type UserRole = "super_admin" | "ops_manager" | "accountant" | "driver" | "passenger";

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  full_name?: string;
  phone?: string;
  created_at: string;
}
