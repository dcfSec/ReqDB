import { Item as Topic } from "./Topics";

export interface Item {
  id: number;
  title: string;
  description: string;
  topics: Array<Topic>
}