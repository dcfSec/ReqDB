import { BaseItem } from "./Base";
import { Item as Topic } from "./Topics";
import { Item as Tag } from "./Tags";

export interface Item extends BaseItem {
  title: string;
  description: string;
  topics: Array<Topic>
  tags: Array<Tag>
}