import { AuthHeader } from "../components/AuthHeader";
import { AuthSecurityNote } from "../components/AuthSecurityNote";
import { AuthShell } from "../components/AuthShell";
import { LoginForm } from "../components/LoginForm";

export function LoginPage() {
  return (
    <AuthShell>
      <AuthHeader />
      <LoginForm />
      <AuthSecurityNote />
    </AuthShell>
  );
}
