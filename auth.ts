import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { ZodError } from "zod";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/db/supabase";
import { signInSchema } from "@/lib/auth/schema";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        try {
          const { email, password } = await signInSchema.parseAsync(credentials);

          const { data: admin, error } = await supabase
            .from("admin")
            .select("id, email, password_hash")
            .eq("email", email.toLowerCase().trim())
            .single();

          if (error || !admin) {
            return null;
          }

          const valid = await bcrypt.compare(password, admin.password_hash);
          if (!valid) {
            return null;
          }

          return {
            id: admin.id,
            email: admin.email,
            name: "Admin",
          };
        } catch (error) {
          if (error instanceof ZodError) {
            return null;
          }
          throw error;
        }
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    authorized: ({ auth, request }) => {
      const { pathname } = request.nextUrl;
      const isAdminRoute = pathname.startsWith("/admin");
      const isLoginPage = pathname === "/admin/login";
      const isForgotPage = pathname === "/admin/forgot-password";

      if (!isAdminRoute) return true;
      if (isLoginPage || isForgotPage) return true;
      return !!auth;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  trustHost: true,
});
