import { useMutation } from "@tanstack/react-query";

import { useAuth } from "./useAuth";

export function useLogin() {
  const { login } = useAuth();

  const mutation = useMutation({
    mutationFn: login,
  });

  return {
    login: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}
