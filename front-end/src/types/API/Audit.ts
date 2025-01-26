export interface Item extends Record<string, unknown> {
  id: number;
  timestamp: number;
  table: string;
  target_id: number;
  data: JSON;
  userId: string;
  verb: "INSERT" | "UPDATE" | "DELETE";
  user: {
    id: string;
    email: string;
  }
}