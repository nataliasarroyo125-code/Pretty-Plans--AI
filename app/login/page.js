import { redirect } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Log in | Pretty Plans AI" };

export default async function LoginPage() {
  if (await getCurrentUser().catch(() => null)) redirect("/dashboard");
  return (
    <div className="auth-wrap">
      <h1>Welcome back</h1>
      <p>Log in to see your plans and create new ones.</p>
      <div className="alert alert-info" style={{ marginTop: 16 }}>
        <strong>Try the demo:</strong> demo@demo.com / password123! (full Pro access)
      </div>
      <AuthForm mode="login" />
    </div>
  );
}
