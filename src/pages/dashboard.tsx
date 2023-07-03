import type { GetServerSideProps, NextPage } from "next";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import Header from "../components/Header";
import { getServerAuthSession } from "../server/common/get-server-auth-session";

const Home: NextPage = () => {
  const { data: session } = useSession();
  return (
    <>
      <Header />
      <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold text-sky-300">QuizApp</h1>

        <Link className="menu-button bg-sky-500" href="play">
          Fragebogen
        </Link>

        {session?.user?.role === "ADMIN" && (
          <Link className="menu-button" href="edit-questions">
            Bearbeiten
          </Link>
        )}
        {session?.user && (
          <>
            <Link
              className="menu-button"
              href={`/profile/user/${session.user.id}`}
            >
              Profil
            </Link>
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

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerAuthSession({
    req: context.req,
    res: context.res,
  });

  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return { props: {} };
};
