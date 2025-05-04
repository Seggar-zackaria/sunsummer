import { auth } from "@/auth";
import { redirect } from "next/navigation";
import LoginForm from "@/components/auth/login-form";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";

const LoginPage = async () => {
  const defaultLoginRedirect = DEFAULT_LOGIN_REDIRECT;
  const session = await auth();

  if (session) {
    redirect(defaultLoginRedirect);
  }

  return (
    <div className="flex h-screen">
      {/* Left side - Background Image */}
      <div className="hidden md:block w-1/2 relative bg-cover bg-center" style={{ backgroundImage: "url('/assets/mountains.jpg')" }}>
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute top-4 left-6 z-10">
          <h1 className="text-white text-2xl font-bold">Sun Summer</h1>
        </div>
        <div className="flex items-center justify-center h-full relative z-10">
          <div className="text-white text-center p-8">
            <h2 className="text-3xl font-bold mb-4">Welcome to SunSummer</h2>
            <p className="text-xl">Your gateway to seamless travel experiences</p>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-8 md:p-12 lg:p-16 overflow-y-auto">
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;