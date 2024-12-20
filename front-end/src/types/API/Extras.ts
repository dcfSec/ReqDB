export interface Item {
    id: number;
    content: string;
    extraTypeId: number;
    extraType: Type;
    requirementId: number;
}

export interface Type {
    id: number;
    title: string;
    description: string;
    children: Item;
    extraType: 1 | 2 | 3;
}