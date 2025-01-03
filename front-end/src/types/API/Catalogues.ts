import { Item as Topic } from "./Topics";

export interface Item extends Record<string, unknown> {
  id: number;
  title: string;
  description: string;
  topics: Array<Topic>
}