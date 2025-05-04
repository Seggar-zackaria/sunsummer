import { EmailTemplate } from '@/components/mail-template/email-template';
import  ResetTemplate  from '@/components/mail-template/reset-template';
import { Resend } from 'resend';
import { NextResponse } from 'next/server';
const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (
    email: string,
    token: string
) => {
  const { data, error } = await resend.emails.send({
    from: 'SunSummer <onboarding@resend.dev>',
    to: email,
    subject: 'Email Confirmation',
    react: await EmailTemplate({ token, email }),
  });

  if (error) {
    return NextResponse.json(error, { status: 400 });
  }

  return NextResponse.json(data, { status: 200 });
};

export const sendPasswordResetEmail = async (
    email: string,
    token: string
) => {
  const { data, error } = await resend.emails.send({
    from: 'SunSummer <onboarding@resend.dev>',
    to: email,
    subject: 'Password Reset',
    react: await ResetTemplate({ token, email }),
  });

  if (error) {
    return NextResponse.json(error, { status: 400 });
  }

  return NextResponse.json(data, { status: 200 });
};
    