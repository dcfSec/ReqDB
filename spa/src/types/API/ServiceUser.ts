export interface Item extends Record<string, unknown> {
  id: string;
  email: string;
  created: number;
  selected?: boolean;
}