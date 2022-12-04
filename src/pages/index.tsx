import { type NextPage } from "next";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import Header from "../components/Header";

const Index: NextPage = () => {
  const { data: session } = useSession();

  console.log("session", session);
  return (
    <>
      <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
        <Header>Home</Header>
        <div className="radius flex flex-col items-center gap-2  bg-zinc-700 p-8">
          <h1 className="text-lg">Home</h1>
          <p>
            {session
              ? `Du bist angemeldet als ${session.user?.username}`
              : "Du bist nicht angemeledet"}
          </p>
          {session && (
            <div className="flex flex-row gap-2">
              <Link href={"/dashboard"} className="rounded border py-1 px-4">
                Dashboard
              </Link>
              <button
                onClick={() => signOut()}
                className="rounded border py-1 px-4"
              >
                Logout
              </button>
            </div>
          )}

          {!session && (
            <div className="flex flex-row gap-2">
              <Link href={"/login"} className="menu-button">
                Login
              </Link>
              <Link href={"/register"} className="menu-button">
                Register
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default Index;
