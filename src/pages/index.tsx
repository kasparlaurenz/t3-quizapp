import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import LoginForm from "../components/Auth/LoginForm";
import Header from "../components/Header";

const Index: NextPage = () => {
  const { data: session } = useSession();
  const router = useRouter();

  if (session) {
    router.push("/dashboard");
  }

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
