import { BaseItem } from "./Base";
import { Item as Topic } from "./Topics";

export interface Item extends BaseItem {
  title: string;
  description: string;
  topics: Array<Topic>
}