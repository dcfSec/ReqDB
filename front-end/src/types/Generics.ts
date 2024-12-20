import { Item as Comment } from "./API/Comments";
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
  data: object; // @TODO: define more precise
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