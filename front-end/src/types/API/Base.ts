export interface BaseItem extends Record<string, unknown> {
  id: number;
  selected?: boolean;
}