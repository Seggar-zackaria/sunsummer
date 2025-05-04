'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { verifyEmail } from '@/actions/new-verification'; 
import { Button } from '@/components/ui/button';  
import { Alert } from '@/components/ui/alert';

interface VerificationStatus {
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
}

export default function ConfirmVerificationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<VerificationStatus>({
    isLoading: true,
    isSuccess: false,
    error: null,
  });

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus({
        isLoading: false,
        isSuccess: false,
        error: 'Verification token is missing',
      });
      return;
    }

    const verifyToken = async () => {
      try {
        await verifyEmail(token);
        setStatus({
          isLoading: false,
          isSuccess: true,
          error: null,
        });
      } catch (error) {
        setStatus({
          isLoading: false,
          isSuccess: false,
          error: `Failed to verify email. Please try again. ${error}`,
        });
      }
    };

    verifyToken();
  }, [searchParams]);

  const handleRedirect = () => {
    router.push(status.isSuccess ? '/auth/login' : '/auth/register');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Email Verification
          </h2>
        </div>

        {status.isLoading && (
          <div className="text-center">
            <p className="text-gray-600">Verifying your email...</p>
          </div>
        )}

        {status.isSuccess && (
          <Alert variant="succes" className="mb-4">
            <p>Your email has been successfully verified!</p>
          </Alert>
        )}

        {status.error && (
          <Alert variant="destructive" className="mb-4">
            <p>{status.error}</p>
          </Alert>
        )}

        <Button
          onClick={handleRedirect}
          className="w-full"
          disabled={status.isLoading}
        >
          {status.isSuccess
            ? 'Proceed to Login'
            : 'Return to Sign Up'}
        </Button>
      </div>
    </div>
  );
}