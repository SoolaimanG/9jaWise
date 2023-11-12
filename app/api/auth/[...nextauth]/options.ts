import { beneficiariesProps, findUserById, userProps } from "@/Models/user";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// NextAuth Configuration
export const authOptions: NextAuthOptions = {
  // Providers Configuration
  providers: [
    CredentialsProvider({
      name: "Authentication",
      credentials: {
        loginID: { label: "Email or PhoneNumber", type: "text" },
        otp: { type: "text", label: "OTP" },
        password: { type: "text", label: "Password" },
      },

      // Authorization Function
      async authorize(credentials) {
        // User Payload to send to signIn route for processing
        const payload = {
          loginID: credentials?.loginID,
          otp: credentials?.otp,
          password: credentials?.password,
        };

        // API route for signing in users
        const res = await fetch(`https://9ja-wise.vercel.app/api/auth/signIn`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          throw new Error(res.statusText);
        }

        // Parsing the response from the backend
        const {
          data,
        }: {
          data: {
            email?: string;
            phoneNumber?: string;
            username: string;
            profileImage?: string;
          };
        } = await res.json();

        return {
          id: "",
          email: data.email || data.phoneNumber,
          name: data.username,
          image: data.profileImage || "Not available",
        };
      },
    }),
  ],

  // Callbacks
  callbacks: {
    async session({ session }) {
      // Perform additional actions when a session is created
      return session;
    },
  },

  // Debugging
  debug: true,

  // Session Strategy
  session: { strategy: "jwt" },

  // Secret Key for Token Generation
  secret: process.env.NEXTAUTH_SECRET,

  // Custom Pages Configuration
  pages: {
    signIn: process.env.NEXTAUTH_URL + "/auth/signin",
  },
};
