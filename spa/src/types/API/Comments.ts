import { BaseItem } from "./Base";
import { Item as Requirement } from "./Requirements";

export interface Item extends BaseItem {
  comment: string;
  requirementId: number;
  requirement: Requirement;
  author: {
    id: string;
    email: string;
  };
  created: number;
  completed: boolean;
  children: Item[];
  parentId: number | null;
  parent: Item | null
}