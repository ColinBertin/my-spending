import AuthPageShell from "../auth-page-shell";
import Login from "./login";

export const metadata = {
  title: "Log in",
};

export default function LoginPage() {
  return (
    <AuthPageShell>
      <Login />
    </AuthPageShell>
  );
}
