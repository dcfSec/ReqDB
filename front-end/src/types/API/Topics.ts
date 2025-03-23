import { Item as Requirement } from "./Requirements";
import { Item as Catalogue } from "./Catalogues";
import { BaseItem } from "./Base";


export interface MinimalItem extends BaseItem {
  key: string;
  title: string;
  children: Array<Item>

}
export interface Item extends MinimalItem {
  description: string;
  parentId: number;
  parent: Item;
  requirements: Array<Requirement>;
  catalogues: Array<Catalogue>;
}