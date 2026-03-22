import { object, string } from "zod";

export const signInSchema = object({
  email: string().min(1, "Email is required").email("Invalid email"),
  password: string().min(1, "Password is required").min(8, "Password must be at least 8 characters"),
});
