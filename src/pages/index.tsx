import { type NextPage } from "next";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import LoginForm from "../components/Auth/LoginForm";
import Header from "../components/Header";

const Index: NextPage = () => {
  const { data: session } = useSession();

  console.log("session", session);
  return (
    <>
      <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
        <Header>Home</Header>
        <div className="radius flex w-2/5 flex-col items-center gap-2 rounded-md bg-zinc-700 p-10">
          <h2 className="text-3xl text-sky-300">Anmelden</h2>
          <p>
            {session
              ? `Du bist angemeldet als ${session.user?.username}`
              : "Du bist nicht angemeledet"}
          </p>
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
            <div className="flex w-full flex-col items-center gap-4">
              <LoginForm />
              <div className="w-2/3">
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
