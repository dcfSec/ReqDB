export interface Auth extends Record<string, unknown> {
  access_token: string;
  expires_at: number;
}