import type { NextPage } from "next";
import Link from "next/link";
import Header from "../components/Header";

const Home: NextPage = () => {
  return (
    <>
      <Header />

      <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold text-sky-300">QuizApp</h1>

        <Link className="menu-button bg-blue-500" href="play">
          Fragebogen
        </Link>
        <Link className="menu-button" href="edit-questions">
          Bearbeiten
        </Link>
      </main>
    </>
  );
};

export default Home;