import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router, type Href } from 'expo-router';

import { login, register, requestPasswordReset, resendVerification, resetPassword, verifyEmail, verifyResetOtp, type LoginRequest, type RegisterRequest } from '@/api/auth.api';
import { queryKeys } from '@/api/query-keys';
import { restoreSession, startAuthenticatedSession } from '@/lib/session';

function routeForSession(route: 'welcome' | 'verify-email' | 'interests' | 'home') {
  const hrefs = {
    welcome: '/welcome',
    'verify-email': '/verify-email',
    interests: '/interests',
    home: '/home',
  } as const;

  return hrefs[route] as Href;
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: LoginRequest) => login(request),
    onSuccess: async ({ accessToken, refreshToken, user }) => {
      const route = await startAuthenticatedSession({ accessToken, refreshToken }, user);
      queryClient.setQueryData(queryKeys.user.current, user);
      router.replace(routeForSession(route));
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (request: RegisterRequest) => register(request),
    onSuccess: (user) => router.replace({ pathname: '/verify-email', params: { email: user.email } } as Href),
  });
}

export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: requestPasswordReset,
    onSuccess: (_, email) => router.push({ pathname: '/verify-reset-otp', params: { email } } as Href),
  });
}

export function useVerifyResetOtp() {
  return useMutation({
    mutationFn: ({ email, otp }: { email: string; otp: string }) => verifyResetOtp(email, otp),
    onSuccess: (_, { email, otp }) => router.push({ pathname: '/reset-password', params: { email, otp } } as Href),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ email, newPassword, otp }: { email: string; newPassword: string; otp: string }) => resetPassword(email, otp, newPassword),
    onSuccess: () => router.replace('/sign-in' as Href),
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: verifyEmail,
    onSuccess: async () => {
      const route = await restoreSession();
      router.replace(route === 'welcome' ? ('/sign-in' as Href) : routeForSession(route));
    },
  });
}

export function useResendVerification() {
  return useMutation({ mutationFn: resendVerification });
}
