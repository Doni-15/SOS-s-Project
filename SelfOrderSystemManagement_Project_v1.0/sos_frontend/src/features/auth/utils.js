import { ROLE_HOME_PATH, ROUTES } from "../../shared/constants/appConfig";
import { loginMessages } from "./constants/authContent";

export function getDashboardPathByRole(role) {
  return ROLE_HOME_PATH[role] ?? ROUTES.login;
}

export function getLoginErrorMessage(error) {
  if (error?.status === 401) {
    return loginMessages.invalidCredentials;
  }

  if (error?.status === 403) {
    return loginMessages.forbidden;
  }

  if (error?.status === 400 || error?.status === 422) {
    return loginMessages.invalidInput;
  }

  if (error?.code === "INVALID_LOGIN_RESPONSE") {
    return loginMessages.invalidResponse;
  }

  if (error?.status === 0) {
    return loginMessages.serviceUnavailable;
  }

  return loginMessages.failed;
}
