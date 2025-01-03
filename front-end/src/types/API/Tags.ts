import { Item as Requirement } from "./Requirements";

export interface Item extends Record<string, unknown> {
    id: number;
    name: string;
    requirement?: Array<Requirement>
}