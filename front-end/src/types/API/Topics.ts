import { Item as Requirement } from "./Requirements";
import { Item as Catalogue } from "./Catalogues";


export interface MinimalItem extends Record<string, unknown> {
  id: number;
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