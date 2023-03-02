import type { NextPage } from "next";
import { useRouter } from "next/router";

import React from "react";
import Header from "../../../components/Header";

const ProfilePage: NextPage = () => {
  const { query } = useRouter();
  const userId = query.userId as string;

  return (
    <>
      <Header />
      <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold text-sky-300">{userId}</h1>
        <p>Hallo</p>
      </main>
    </>
  );
};

export default ProfilePage;
