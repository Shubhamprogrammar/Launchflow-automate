import { createAuthClient } from "better-auth/client";

const getAuthBaseURL = () => {
  const apiURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  if (typeof window !== "undefined") {
    const isLocalhost = ["localhost", "127.0.0.1"].includes(window.location.hostname);

    if (!isLocalhost) {
      return window.location.origin;
    }
  }

  try {
    return new URL(apiURL).origin;
  } catch {
    if (typeof window !== "undefined") {
      return window.location.origin;
    }

    return "http://localhost:5000";
  }
};

export const authClient = createAuthClient({
  baseURL: getAuthBaseURL(),
  basePath: "/api/auth",
});
