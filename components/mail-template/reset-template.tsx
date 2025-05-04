const ResetTemplate = ({ token, email }: { token: string, email: string }) => {
 
    const resetUrl = `${process.env.BASE_URL}/auth/reset-password?token=${token}`;
    return (
    <div>
      <h1>Reset Password {email}</h1>
      <p>Click the link below to reset your password:</p>
      <a href={resetUrl}>Reset Password</a>
    </div>
  );
};

export default ResetTemplate;