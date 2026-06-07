import { useState } from "react";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { useNavigate } from "react-router";

import { Alert } from "../../../shared/components/Alert";
import { Button } from "../../../shared/components/Button";
import { TextField } from "../../../shared/components/TextField";
import { loginContent, loginMessages } from "../constants/authContent";
import { useLogin } from "../hooks/useLogin";
import { getDashboardPathByRole, getLoginErrorMessage } from "../utils";

const initialForm = {
  username: "",
  password: "",
  rememberMe: false,
};

export function LoginForm() {
  const navigate = useNavigate();
  const { login, isLoading } = useLogin();

  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const isSubmitting = isLoading;

  const updateField = (field) => (event) => {
    const value =
      event.target.type === "checkbox" ? event.target.checked : event.target.value;

    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    if (formError) {
      setFormError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const username = form.username.trim();
    const password = form.password;

    if (!username || !password) {
      setFormError(loginMessages.requiredCredentials);
      return;
    }

    try {
      const result = await login({
        username,
        password,
        rememberMe: form.rememberMe,
      });

      navigate(getDashboardPathByRole(result.user.role), { replace: true });
    } catch (error) {
      setFormError(getLoginErrorMessage(error));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-7 space-y-4">
      {formError ? <Alert message={formError} /> : null}

      <TextField
        id="username"
        name="username"
        label="Username"
        value={form.username}
        onChange={updateField("username")}
        placeholder={loginContent.usernamePlaceholder}
        icon={User}
        autoComplete="username"
        disabled={isSubmitting}
        required
      />

      <TextField
        id="password"
        name="password"
        label="Password"
        type={showPassword ? "text" : "password"}
        value={form.password}
        onChange={updateField("password")}
        placeholder={loginContent.passwordPlaceholder}
        icon={Lock}
        autoComplete="current-password"
        disabled={isSubmitting}
        required
        rightElement={
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="rounded-md p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
            disabled={isSubmitting}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        }
      />

      <div className="flex items-center justify-between gap-4">
        <label className="inline-flex cursor-pointer items-center gap-3 text-sm font-medium text-slate-600">
          <input
            type="checkbox"
            checked={form.rememberMe}
            onChange={updateField("rememberMe")}
            disabled={isSubmitting}
            className="h-5 w-5 rounded border-slate-300 text-blue-700 focus:ring-blue-200 disabled:cursor-not-allowed"
          />
          <span>{loginContent.rememberLabel}</span>
        </label>

        <button
          type="button"
          className="text-sm font-bold text-blue-700 transition hover:text-blue-800"
        >
          {loginContent.forgotPasswordLabel}
        </button>
      </div>

      <Button
        type="submit"
        isLoading={isSubmitting}
        className="mt-2 h-[52px] rounded-xl bg-blue-700 text-base font-bold shadow-lg shadow-blue-700/20 hover:bg-blue-800"
      >
        {loginContent.submitLabel}
      </Button>
    </form>
  );
}
