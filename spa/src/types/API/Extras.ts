import { BaseItem } from "./Base";
import { Item as Requirement } from "./Requirements";

export interface Item extends BaseItem {
    content: string;
    extraTypeId: number;
    extraType: Type;
    requirementId: number;
    requirement: Requirement
}

export interface Type extends BaseItem {
    title: string;
    description: string;
    children: Item;
    extraType: 1 | 2 | 3;
}