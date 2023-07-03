import z from "zod";

export const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export const registerSchema = loginSchema;

export type ILogin = z.infer<typeof loginSchema>;
export type IRegister = {
  username: string;
  password: string;
  password_confirm: string;
};
