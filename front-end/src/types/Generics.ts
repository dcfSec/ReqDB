import { Item as Catalogue } from './API/Catalogues';
import { Item as Extra } from './API/Extras';
import { Type } from './API/Extras';
import { Item as Requirement } from "./API/Requirements";
import { Item as Tag } from "./API/Tags";
import { Item as Topic } from "./API/Topics";

export interface Row {
  id: number
  Key: string
  Tags: Array<string>; // @TODO: define more precise
  Topics: Array<Topic>; // @TODO: define more precise
  Title: string;
  Description: string;
  Comments: Array<Comment>; // @TODO: define more precise
  [key: string]: unknown;
}

export interface BrowseState {
  data: Catalogue | null
  title: string;
  status: string;
  search: string;
  rows: {
    items: Array<Row>;
    visible: { [key: string]: boolean };
    selected: { [key: string]: boolean };
    allSelected: boolean;
  };
  selected: { [key: string]: boolean };
  tags: {
    filterItems: Array<string>;
    filterSelected: Array<string>;
    allSelected: boolean;
  };
  topics: {
    filterItems: Array<string>;
    filterSelected: Array<string>;
    allSelected: boolean;
  };
  extraHeaders: { [key: string]: 1 | 2 | 3 };
  comments: object; // @TODO: define more precise
}

export interface APIData {
  data: unknown;
  status: number;
}

export interface APISuccessData extends APIData {
  data: object | Array<object>;
  status: number;

}

export interface APIErrorData extends APIData {
  message: string | Array<string> | Record<string, Array<string>>;
  error: string;
}

export type RowObject = {
  id: number
  [key: string]: string | number;

}

export type GenericItem = Catalogue | Extra | Type | Requirement | Tag | Topic
