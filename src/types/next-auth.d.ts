import { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role?: "USER" | "STAFF" | "ADMIN";
    } & DefaultSession["user"];
  }

  interface User {
    role?: "USER" | "STAFF" | "ADMIN";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "USER" | "STAFF" | "ADMIN";
  }
}