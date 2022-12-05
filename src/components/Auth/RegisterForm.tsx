import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { IRegister } from "../../utils/authValidation";
import { trpc } from "../../utils/trpc";

const RegisterForm = () => {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const mutation = trpc.auth.register.useMutation({
    onError: (e) => setErrorMessage(e.message),
    onSuccess: () => router.push("/login"),
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<IRegister>();

  const onSubmit: SubmitHandler<IRegister> = async (data) => {
    setErrorMessage(undefined);
    await mutation.mutateAsync(data);
  };

  return (
    <div className="radius flex w-2/5 flex-col items-center gap-2 rounded-md bg-zinc-700 p-10">
      <h2 className="text-3xl text-sky-300">Registrieren</h2>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex w-2/3 flex-col gap-2"
      >
        {errorMessage && (
          <p className="text-center text-red-600">{errorMessage}</p>
        )}
        <label>Username</label>
        <input
          className="w-full rounded-md border-2 border-white bg-zinc-400 p-2 text-zinc-800 placeholder-gray-100"
          type="username"
          placeholder="Username"
          {...register("username", { required: "Geben Sie ein Password ein" })}
        />
        {errors.username && (
          <p className="text-center text-red-600">This field is required</p>
        )}
        <label>Password</label>
        <input
          placeholder="Passwort"
          className="rounded-md border-2 border-white bg-zinc-400 p-2 text-zinc-800 placeholder-gray-100"
          type="password"
          {...register("password", { required: true })}
        />
        {errors.password && (
          <p className="text-center text-red-600">This field is required</p>
        )}
        <label>Password wiederholen</label>
        <input
          className="rounded-md border-2 border-white bg-zinc-400 p-2 text-zinc-800 placeholder-gray-100"
          type="password"
          placeholder="Passwort wiederholen"
          {...register("password_confirm", {
            required: "Bestätigen Sie ihr Passwort",
            validate: (val: string) => {
              if (watch("password") !== val) {
                console.log("Passwörter stimmen nicht überein");
                return "";
              }
            },
          })}
        />
        {errors.password_confirm && (
          <p className="text-center  text-rose-500">
            Passwörter stimmen nicht überein
          </p>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            className="menu-button  bg-sky-500 hover:bg-white hover:text-zinc-800"
          >
            Registrieren
          </button>
          <Link
            className="menu-button  bg-zinc-500 hover:bg-white hover:text-zinc-800"
            href="/"
          >
            Zurück
          </Link>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
