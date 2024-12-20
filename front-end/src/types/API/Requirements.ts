import { Item as ExtraItem } from "./Extras";
import { Item as Tag } from "./Tags";
import { Item as Comment } from "./Comments";
import { Item as Topic } from "./Topics";

export interface Item {
  id: number;
  key: string;
  title: string;
  description: string;
  parentId: number;
  parent: Topic;
  extras: Array<ExtraItem>
  tags: Array<Tag>;
  visible: boolean;

  comments: Array<Comment>

}