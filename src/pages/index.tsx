import type { NextPage } from "next";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import LoginForm from "../components/Auth/LoginForm";
import Header from "../components/Header";

const Index: NextPage = () => {
  const { data: session } = useSession();

  return (
    <>
      <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
        <Header>Home</Header>
        <div className="radius flex w-full max-w-2xl flex-col items-center gap-2 rounded-md bg-zinc-700 p-10">
          <h2 className="text-3xl text-sky-300">Anmelden</h2>
          <div className="max-w-md ">
            <p className="text-center">
              {session
                ? `Du bist angemeldet als ${session.user?.username}  mit der Rolle ${session.user?.role}`
                : "Du bist nicht angemeldet."}
            </p>
            <p>
              {session &&
                session.user?.role === "GUEST" &&
                "Warte auf die Bestätigung deines Accounts durch einen Admin"}
            </p>
          </div>
          {session && (
            <div className="flex flex-col gap-4">
              <Link
                href={"/dashboard"}
                className="menu-button  bg-sky-500 hover:bg-white hover:text-zinc-800"
              >
                Dashboard
              </Link>
              <button
                onClick={() => signOut()}
                className="menu-button mt-0  bg-zinc-500 hover:bg-white hover:text-zinc-800"
              >
                Abmelden
              </button>
            </div>
          )}

          {!session && (
            <div className="flex w-full max-w-sm flex-col items-center gap-4">
              <LoginForm />
              <div className="w-full">
                <span>
                  Keinen Account?
                  <Link href={"/register"} className="text-sky-400">
                    {" "}
                    Registrieren
                  </Link>
                </span>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default Index;
