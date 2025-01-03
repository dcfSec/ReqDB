import { Item as Requirement } from "./Requirements";

export interface Item extends Record<string, unknown> {
    id: number;
    content: string;
    extraTypeId: number;
    extraType: Type;
    requirementId: number;
    requirement: Requirement
}

export interface Type extends Record<string, unknown> {
    id: number;
    title: string;
    description: string;
    children: Item;
    extraType: 1 | 2 | 3;
}