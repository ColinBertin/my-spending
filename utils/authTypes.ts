export type AuthUser = {
  id: string;
  email: string | null;
  user_metadata?: {
    username?: string;
    [key: string]: unknown;
  };
  app_metadata?: Record<string, unknown>;
};
