import { createAuthClient } from "better-auth/client";

const getAuthBaseURL = () => {
  const apiURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  try {
    return new URL(apiURL).origin;
  } catch {
    return "http://localhost:5000";
  }
};

export const authClient = createAuthClient({
  baseURL: getAuthBaseURL(),
  basePath: "/api/auth",
});
