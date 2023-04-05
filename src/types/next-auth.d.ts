import "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user?: {
      id: string;
      role: string;
      username: string;
    };
  }

  interface User {
    role: string;
    username?: string;
    id?: string;
  }
}
