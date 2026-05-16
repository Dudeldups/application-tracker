function parseBooleanEnv(value: string | undefined) {
  if (!value) {
    return false;
  }

  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

export const config = {
  apiUrl: import.meta.env.VITE_API_URL ?? "",
  demoMode: parseBooleanEnv(import.meta.env.VITE_DEMO_MODE),
};
