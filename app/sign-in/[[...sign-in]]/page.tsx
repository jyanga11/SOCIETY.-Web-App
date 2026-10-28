import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="relative z-50 flex min-h-screen items-center justify-center p-6">
      <SignIn />
    </main>
  );
}