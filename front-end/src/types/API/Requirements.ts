import { Item as ExtraItem } from "./Extras";
import { Item as Tag } from "./Tags";
import { Item as Comment } from "./Comments";

export interface Item {
  id: number;
  key: string;
  title: string;
  description: string;
  parentId: number;
  extras: Array<ExtraItem>
  tags: Array<Tag>;
  visible: boolean;

  comments: Array<Comment>

}