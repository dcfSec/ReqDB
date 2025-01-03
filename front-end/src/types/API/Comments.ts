import { Item as Requirement } from "./Requirements";

export interface Item extends Record<string, unknown> {
  id: number;
  comment: string;
  requirementId: number;
  requirement: Requirement;
  author: string;
  created: string;
  completed: boolean
}