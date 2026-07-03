import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

/**
 * Hook to access the authentication context.
 * Provides { user, isAuthenticated, isLoading, login, logout }.
 *
 * Must be used inside <AuthProvider>.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
