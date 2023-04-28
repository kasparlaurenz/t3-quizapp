import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useForm, type SubmitHandler } from "react-hook-form";
import { type ILogin } from "../../utils/authValidation";

const LoginForm = () => {
  const router = useRouter();
  const { error } = router.query;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ILogin>();

  const onSubmit: SubmitHandler<ILogin> = async (data) => {
    await signIn("credentials", { ...data, callbackUrl: "/dashboard" });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full max-w-sm flex-col gap-2"
    >
      {error && (
        <p className="text-center text-red-600">Login failed, try again!</p>
      )}
      <label>Username</label>
      <input
        placeholder="Username"
        className="w-full rounded-md border-2 border-white bg-zinc-400 p-2 text-zinc-800 placeholder-gray-100"
        type="text"
        {...register("username", { required: true })}
      />
      {errors.username && <span>This field is required</span>}
      <label>Passwort</label>
      <input
        className="w-full rounded-md border-2 border-white bg-zinc-400 p-2 text-zinc-800 placeholder-gray-100"
        type="password"
        placeholder="Passwort"
        {...register("password", { required: true })}
      />
      {errors.password && <span>This field is required</span>}

      <button
        type="submit"
        className="menu-button  bg-sky-500 hover:bg-white hover:text-zinc-800"
      >
        Anmelden
      </button>
    </form>
  );
};

export default LoginForm;
