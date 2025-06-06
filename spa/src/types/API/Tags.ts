import { BaseItem } from "./Base";
import { Item as Requirement } from "./Requirements";
import { Item as Catalogue } from "./Catalogues";

export interface Item extends BaseItem {
    name: string;
    requirements?: Array<Requirement>
    catalogues?: Array<Catalogue>
}