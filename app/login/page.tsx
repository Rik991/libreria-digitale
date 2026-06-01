import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="mx-auto w-full max-w-[1200px] flex-1 px-8 py-8">
      <h1 className="text-center text-3xl font-extrabold text-gray-900">
        Accedi o Registrati
      </h1>
      <LoginForm />
    </main>
  );
}
