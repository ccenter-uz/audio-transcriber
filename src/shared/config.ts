interface Config {
  apiUrl: string;
}

export const config: Config = {
  apiUrl: import.meta.env.VITE_BASE_URL || 'http://192.168.31.50:8080',
} as const;