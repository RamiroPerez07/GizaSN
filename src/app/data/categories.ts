import { ICategory } from "../interfaces/categories.interface";

export const categories : ICategory[] = [
    {
        id: "suplementos",
        title: "Suplementos",
        level: 1,
        parentId: null,
        priority: 10,
        visible: true,
    },
    {
        id: "innovanaturals",
        title: "Innova Naturals",
        level: 2,
        parentId: "suplementos",
        priority: 10,
        visible: true,
    },
    {
        id: "nutremax",
        title: "Nutremax",
        level: 2,
        parentId: "suplementos",
        priority: 10,
        visible: true,
    },
    {
        id: "ena",
        title: "Ena",
        level: 2,
        parentId: "suplementos",
        priority: 10,
        visible: true,
    },
    {
        id: "cremas",
        title: "Cremas",
        level: 1,
        parentId: null,
        priority: 10,
        visible: true,
    },
]