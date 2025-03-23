import { BaseItem } from "./Base";
import { Item as Requirement } from "./Requirements";

export interface Item extends BaseItem {
    name: string;
    requirement?: Array<Requirement>
}