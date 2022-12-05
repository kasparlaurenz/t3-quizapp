import type { GetServerSideProps, NextPage } from "next";
import RegisterForm from "../components/Auth/RegisterForm";
import { getServerAuthSession } from "../server/common/get-server-auth-session";

const Register: NextPage = () => {
  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
      <RegisterForm />
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

export default Register;
