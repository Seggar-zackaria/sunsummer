import CardWrapper from "@/components/auth/card-wrapper";
import ResetPasswordForm from "@/components/auth/reset-password-form";
export default function ForgotPassword() {
  return (
    <section className="flex h-screen w-screen items-center justify-center">

    <CardWrapper
      headerLabel="Reset Password"
      backButtonLabel="Back to login"
      backButtonHref="/auth/login"
      showSocial={false}
      >
      <ResetPasswordForm />
    </CardWrapper>
      </section>
  );
}