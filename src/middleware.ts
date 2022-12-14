import withAuth from "next-auth/middleware";
import { authOptions } from "./pages/api/auth/[...nextauth]";

export default withAuth({
  callbacks: {
    authorized: ({ token }) => token?.role === "ADMIN",
  },
  secret: authOptions.secret,
  pages: authOptions.pages,
});

export const config = {
  matcher: ["/edit-questions/:path*", "/create-question/:path*"],
};
