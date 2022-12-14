import type { NextPage } from "next";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import Header from "../components/Header";

const Home: NextPage = () => {
  const { data: session } = useSession();

  return (
    <>
      <Header />
      <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold text-sky-300">QuizApp</h1>

        <Link className="menu-button bg-blue-500" href="play">
          Fragebogen
        </Link>

        {session?.user?.role === "ADMIN" && (
          <Link className="menu-button" href="edit-questions">
            Bearbeiten
          </Link>
        )}
        {session?.user && (
          <>
            <p>{session.user.username}</p>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="menu-button"
            >
              Abmelden
            </button>
          </>
        )}
      </main>
    </>
  );
};

export default Home;
