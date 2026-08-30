export type AuthProvider = 'LOCAL' | 'GOOGLE';
export type UserRole = 'USER' | 'ADMIN';
export type SubscriptionStatus = 'NONE' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  profileImageUrl?: string | null;
  provider: AuthProvider;
  emailVerified: boolean;
  role: UserRole;
  subscriptionStatus?: SubscriptionStatus;
  createdAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
