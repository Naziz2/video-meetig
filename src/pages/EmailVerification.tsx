import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Mail, ArrowRight, Loader, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';

export const EmailVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useStore();
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    // Extract email from the query params
    const params = new URLSearchParams(location.search);
    const emailParam = params.get('email');
    
    if (emailParam) {
      setEmail(emailParam);
    }

    // Check if the user has a valid session already (meaning they verified their email)
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error checking session:', error);
        setVerificationStatus('error');
        setError('Unable to verify your session. Please try again.');
        return;
      }
      
      if (data.session) {
        // User has a valid session
        setVerificationStatus('success');
        
        // Fetch user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', data.session.user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
        }

        // Update user in store
        setUser({
          id: data.session.user.id,
          email: data.session.user.email!,
          name: profile?.name || 'User',
        });
      }
    };

    checkSession();

    // Set up countdown for resend
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [location.search, setUser]);

  const handleResendVerification = async () => {
    if (!email || !canResend) return;

    try {
      setVerificationStatus('pending');
      setCanResend(false);
      setCountdown(60);
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (error) throw error;

      // Set up countdown for resend
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (err: any) {
      console.error('Error resending verification:', err);
      setError(err.message || 'Failed to resend verification email');
      setVerificationStatus('error');
    }
  };

  const handleGoToLogin = () => {
    navigate('/auth');
  };

  const handleGoToHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-theme-gradient flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {verificationStatus === 'success' ? (
          <div className="flex justify-center">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
        ) : (
          <div className="flex justify-center">
            <Mail className="w-16 h-16 text-wolt-blue" />
          </div>
        )}
        
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          {verificationStatus === 'success' 
            ? 'Email Verified!' 
            : 'Check Your Email'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-theme-card py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-theme">
          {verificationStatus === 'success' ? (
            <div className="text-center">
              <p className="text-lg text-white mb-6">
                Your email has been successfully verified. You can now access all features of the application.
              </p>
              <button
                onClick={handleGoToHome}
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-theme-button hover:bg-theme-button-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-600 transition-colors"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          ) : (
            <div>
              {error ? (
                <div className="mb-6 p-3 bg-red-900/20 border border-red-700 rounded-lg text-red-300 text-center">
                  {error}
                </div>
              ) : (
                <p className="text-center text-white mb-6">
                  We've sent a verification email to <span className="font-semibold">{email || 'your email address'}</span>.<br />
                  Please check your inbox and click the verification link to confirm your account.
                </p>
              )}

              <div className="space-y-4">
                <button
                  onClick={handleResendVerification}
                  disabled={!canResend}
                  className="w-full flex justify-center items-center py-2 px-4 border border-slate-700 rounded-lg shadow-sm text-sm font-medium text-white bg-slate-800/50 hover:bg-slate-800/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {canResend ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Resend Verification Email
                    </>
                  ) : (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Resend in {countdown}s
                    </>
                  )}
                </button>

                <button
                  onClick={handleGoToLogin}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-theme-button hover:bg-theme-button-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-600 transition-colors"
                >
                  Back to Login
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
