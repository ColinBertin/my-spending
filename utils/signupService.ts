import { signUpWithPassword } from "./authClient";

type SignupData = {
  username: string;
  email: string;
  password: string;
};

// Simulate network latency
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function signup(data: SignupData) {
  await delay(500);
  const { user, error } = await signUpWithPassword(
    data.email,
    data.password,
    data.username,
  );
  return { user, error };
}
