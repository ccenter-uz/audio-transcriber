interface Config {
  apiUrl: string;
}

export const config: Config = {
  apiUrl: import.meta.env.VITE_BASE_URL,
} as const;