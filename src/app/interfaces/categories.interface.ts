export interface ICategory {
    id: string;
    txt_category: string;
    priority: number;
    level: number;
    children: ICategory[] | null;
    showChildren?: boolean;
}