import RegisterForm from "@/components/auth/register-form";
import {auth} from '@/auth'
import {redirect} from 'next/navigation'
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import Image from "next/image";

const RegisterPage = async () => {
  const defaultLoginRedirect = DEFAULT_LOGIN_REDIRECT;
  const session = await auth()

  if(session) { redirect(defaultLoginRedirect)}
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 h-screen w-full">
      <div className="hidden md:block relative h-full">
        <Image 
          src="/assets/mountains.jpg"
          alt="Mountains landscape"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/30" />
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
      <div className="grid pt-6 px-4">
        <RegisterForm />
      </div>
    </div>
  );
};

export default RegisterPage;
