export interface Item extends Record<string, unknown> {
  key: string;
  value: string;
  description: string;
  category: string;
  type: string;
  dirty?: boolean
}