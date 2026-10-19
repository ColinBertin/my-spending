import AuthPageShell from "../auth-page-shell";
import Signup from "./signup";

export const metadata = {
  title: "Sign up",
};

export default function SignupPage() {
  return (
    <AuthPageShell>
      <Signup />
    </AuthPageShell>
  );
}
