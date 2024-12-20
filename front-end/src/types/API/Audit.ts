export interface Item {
  verb: "INSERT" | "UPDATE" | "DELETE";
  transaction: {
    issued_at: string
    user_id: string
  };
  id: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}