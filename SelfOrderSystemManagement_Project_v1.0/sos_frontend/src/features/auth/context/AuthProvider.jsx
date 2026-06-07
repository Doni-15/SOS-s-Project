import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { QUERY_KEYS } from "../../../shared/constants/appConfig";
import { authStorage } from "../../../shared/utils/storage";
import { authApi } from "../api/authApi";
import { AuthContext } from "./authContext";

function deferStateSync(callback) {
  const timer = window.setTimeout(callback, 0);
  return () => window.clearTimeout(timer);
}

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState(() => {
    return authStorage.hasValidSession() ? authStorage.getSession() : null;
  });

  const canValidateSession = Boolean(session?.accessToken);

  const currentUserQuery = useQuery({
    queryKey: QUERY_KEYS.auth.me,
    queryFn: authApi.getMe,
    enabled: canValidateSession,
    retry: false,
    staleTime: 1000 * 30,
  });

  useEffect(() => {
    if (authStorage.hasValidSession()) {
      return undefined;
    }

    return deferStateSync(() => {
      setSession(null);
    });
  }, []);

  useEffect(() => {
    if (!currentUserQuery.data) {
      return undefined;
    }

    return deferStateSync(() => {
      const currentSession = authStorage.getSession();

      if (!currentSession) {
        setSession(null);
        return;
      }

      const nextSession = authStorage.updateUser(currentUserQuery.data);
      setSession(nextSession);
    });
  }, [currentUserQuery.data]);

  useEffect(() => {
    if (!currentUserQuery.isError) {
      return undefined;
    }

    return deferStateSync(() => {
      authStorage.clearSession();
      setSession(null);
      queryClient.removeQueries({ queryKey: QUERY_KEYS.auth.all });
    });
  }, [currentUserQuery.isError, queryClient]);

  const login = useCallback(
    async ({ username, password, rememberMe }) => {
      const result = await authApi.login({ username, password });

      if (!result.accessToken || !result.user) {
        throw {
          status: 0,
          code: "INVALID_LOGIN_RESPONSE",
          message: "Login response is invalid.",
          fields: null,
        };
      }

      const nextSession = authStorage.saveSession({
        ...result,
        rememberMe,
      });

      setSession(nextSession);
      queryClient.setQueryData(QUERY_KEYS.auth.me, result.user);

      return result;
    },
    [queryClient],
  );

  const logout = useCallback(async () => {
    try {
      if (authStorage.hasValidSession()) {
        await authApi.logout();
      }
    } finally {
      authStorage.clearSession();
      setSession(null);
      queryClient.clear();
    }
  }, [queryClient]);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      token: session?.accessToken ?? null,
      expiresAt: session?.expiresAt ?? null,
      isAuthenticated: Boolean(session?.accessToken && session?.user),
      isCheckingSession: canValidateSession && currentUserQuery.isLoading,
      login,
      logout,
      refreshCurrentUser: currentUserQuery.refetch,
    }),
    [
      session,
      canValidateSession,
      currentUserQuery.isLoading,
      currentUserQuery.refetch,
      login,
      logout,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
