import { redirect } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Sign up | Pretty Plans AI" };

export default async function SignupPage() {
  if (await getCurrentUser().catch(() => null)) redirect("/dashboard");
  return (
    <div className="auth-wrap">
      <h1>Create your account</h1>
      <p>Start with 3 free AI plans. No credit card needed.</p>
      <AuthForm mode="signup" />
    </div>
  );
}
