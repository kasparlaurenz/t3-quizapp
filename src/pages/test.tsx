import { GetServerSideProps, NextPage } from "next";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { getServerAuthSession } from "../server/common/get-server-auth-session";

const Test: NextPage = () => {
  const { data: session, status } = useSession();

  if (status === "authenticated") {
    console.log("authenticated");
  }

  if (session?.user?.role === "ADMIN") {
    return (
      <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
        <div>Admin</div>
        <button onClick={() => signOut()} className="rounded border py-1 px-4">
          Logout
        </button>
      </main>
    );
  }

  console.log("session", session);
  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
      <div>No Admin</div>
      <button onClick={() => signOut()} className="rounded border py-1 px-4">
        Logout
      </button>
    </main>
  );
};

export default Test;

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
