export interface ICategory {
    id: string;
    title: string;
    priority: number;
    level: number;
    parentId: string | null;
    visible: boolean;
    showChildren?: boolean;
}