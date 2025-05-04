import CardWrapper from "@/components/auth/card-wrapper";
import ForgotPasswordForm from "@/components/auth/forgot-password-form";
export default function ForgotPassword() {
  return (
    <section className="flex h-screen w-screen items-center justify-center">

    <CardWrapper
      headerLabel="Forgot Password"
      backButtonLabel="Back to login"
      backButtonHref="/auth/login"
      showSocial={false}
      >
      <ForgotPasswordForm />
    </CardWrapper>
      </section>
  );
}