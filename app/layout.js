import Link from "next/link";
import "./globals.css";
import { getCurrentUser } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";

export const metadata = {
  title: "Pretty Plans AI | Natalia Arroyo",
  description:
    "Pretty Plans AI is a personalized AI planning app for students and young adults — organize schedules, plan events, and design your room around your budget and style.",
};

async function safeUser() {
  try {
    return await getCurrentUser();
  } catch {
    return null;
  }
}

export default async function RootLayout({ children }) {
  const user = await safeUser();
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="container">
            <Link href="/" className="logo">✦ Pretty Plans AI</Link>
            <nav className="nav" aria-label="Main">
              <Link href="/#features">Features</Link>
              <Link href="/pricing">Pricing</Link>
              {user ? (
                <>
                  <Link href="/dashboard">My Planner</Link>
                  <LogoutButton />
                </>
              ) : (
                <>
                  <Link href="/login">Log in</Link>
                  <Link href="/signup" className="btn btn-small">Get started</Link>
                </>
              )}
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          Pretty Plans AI · Created by <strong>Natalia Arroyo</strong> · 2026
        </footer>
      </body>
    </html>
  );
}
