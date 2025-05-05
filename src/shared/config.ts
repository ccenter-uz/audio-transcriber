interface Config {
  apiUrl: string;
}

export const config: Config = {
  apiUrl: 'http://192.168.31.50:8080',
} as const;