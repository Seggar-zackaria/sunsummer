import * as React from 'react';

interface EmailTemplateProps {
  email: string;
  token: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  email,
  token,
}) => {
  const confirmationLink = `${process.env.BASE_URL}/auth/new-verification?token=${token}`;
  return (
    <div>
      <h1>Welcome, {email}!</h1>
      <p>Please click the link below to confirm your email address:</p>
      <a href={confirmationLink}>Confirm email</a>
    </div>
  );
}