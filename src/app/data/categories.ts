import { ICategory } from "../interfaces/categories.interface";

export const categories : ICategory[] = [
    {
        id: "1",
        txt_category: "Suplementos",
        priority: 10,
        level: 1,
        children: [
            {
                id: "1.1",
                txt_category: "Ena",
                priority: 10,
                level: 2,
                children: null,
            },
            {
                id: "1.2",
                txt_category: "Nutremax",
                priority: 20,
                level: 2,
                children: null,
            },
            {
                id: "1.3",
                txt_category: "Innova Naturals",
                priority: 30,
                level: 2,
                children: null,
            },
        ],
    },
    {
        id: "2",
        txt_category: "Cremas",
        priority: 20,
        level: 1,
        children: null,
    }
]