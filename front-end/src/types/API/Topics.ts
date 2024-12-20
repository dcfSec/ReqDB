import { Item as Requirement } from "./Requirements";
import { Item as Catalogue } from "./Catalogues";

export interface Item {
  id: number;
  key: string;
  title: string;
  description: string;
  parentId: number;
  parent: Item;
  requirements: Array<Requirement>;
  catalogues: Array<Catalogue>;
  children: Array<Item>
}