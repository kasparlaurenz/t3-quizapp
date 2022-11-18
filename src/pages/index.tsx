import Head from "next/head";
import Link from "next/link";
import type { NextPage } from "next";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>QuizApp</title>
        <meta name="description" content="Generated by create-t3-app" />
      </Head>

      <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold text-sky-300">QuizApp</h1>

        <Link className="menu-button bg-blue-500" href="play-quiz">
          Play Game
        </Link>
        <Link className="menu-button" href="create-question">
          Create Question
        </Link>

        <Link className="menu-button" href="all-questions">
          Show all questions
        </Link>
      </main>
    </>
  );
};

export default Home;
