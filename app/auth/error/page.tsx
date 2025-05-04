'use client'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'There is a problem with the server configuration. Please try again later.'
      case 'AccessDenied':
        return 'Access was denied to your account. Please contact support if you think this is a mistake.'
      case 'OAuthSignin':
        return 'Could not connect to the authentication provider. Please try again.'
      case 'OAuthCallback':
        return 'There was a problem with the authentication callback. Please try again.'
      case 'Default':
      default:
        return 'An unexpected authentication error occurred. Please try again.'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Authentication Error
          </h2>
          <div className="mt-4">
            <div className="text-center text-red-600">
              {getErrorMessage(error)}
            </div>
          </div>
        </div>
        <div className="mt-4 text-center">
          <Link 
            href="/auth/login"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Return to Login
          </Link>
        </div>
      </div>
    </div>
  )
}