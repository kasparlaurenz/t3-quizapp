import type { GetServerSideProps, NextPage } from "next";
import LoginForm from "../components/Auth/LoginForm";
import { getServerAuthSession } from "../server/common/get-server-auth-session";

const Login: NextPage = () => {
  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
      <div className="radius flex w-2/5 flex-col items-center gap-2 rounded-md bg-zinc-700 p-10">
        <LoginForm />
      </div>
    </main>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerAuthSession({
    req: context.req,
    res: context.res,
  });

  if (session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return { props: {} };
};
export default Login;
