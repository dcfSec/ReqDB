import { Item as Requirement } from "./Requirements";

export interface Item {
    id: number;
    name: string;
    requirement?: Array<Requirement>
}