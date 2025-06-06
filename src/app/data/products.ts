import { IProduct } from "../interfaces/products.interface";

export const products: IProduct[] = [
// Ena
{
    id: 1,
    description: "Proteína Whey Isolate 2lbs",
    brand: "Ena",
    idCategories: ["suplementos","ena"],
    priority: 1,
    visible: true,
    price: 19990,
    iva: 21,
    discount1: 10,
    discount2: null,
    discount3: null,
    updatedAt: new Date("2024-03-15"),
    urlImg: "https://res.cloudinary.com/dr0rbyqrk/image/upload/v1713823127/whey_prot_chocolat_2_LB-removebg-preview_bxelxb.png",
    inStock: true,
    status: "active",
    tags: ["suplementos","proteinas"]
  },
  {
    id: 2,
    description: "BCAA 2:1:1 200g",
    brand: "Ena",
    idCategories: ["suplementos","ena"],
    priority: 2,
    visible: true,
    price: 7490,
    iva: 21,
    discount1: 5,
    discount2: 3,
    discount3: 2,
    updatedAt: new Date("2024-03-18"),
    urlImg: "https://res.cloudinary.com/dr0rbyqrk/image/upload/v1713823301/whey_prot_vainilla_2_LB-removebg-preview_y2xvrk.png",
    inStock: true,
    status: "active",
    tags: ["suplementos","proteinas"]
  },
  {
    id: 3,
    description: "Glutamina 300g",
    brand: "Ena",
    idCategories: ["suplementos","ena"],
    priority: 3,
    visible: true,
    price: 8990,
    iva: 21,
    discount1: null,
    discount2: null,
    discount3: null,
    updatedAt: new Date("2024-03-20"),
    urlImg: "https://res.cloudinary.com/dr0rbyqrk/image/upload/v1713824863/whey_prot_chocolat_1_lb-removebg-preview_xstbhr.png",
    inStock: false,
    status: "inactive",
    tags: ["suplementos","proteinas"]
  },
  {
    id: 4,
    description: "Pre Entreno Shot 60ml",
    brand: "Ena",
    idCategories: ["suplementos","ena"],
    priority: 4,
    visible: true,
    price: 1490,
    iva: 21,
    discount1: 2,
    discount2: null,
    discount3: null,
    updatedAt: new Date("2024-03-22"),
    urlImg: "https://res.cloudinary.com/dr0rbyqrk/image/upload/v1713824869/whey_prot_cookies_and_cream_1lb-removebg-preview_tfqevv.png",
    inStock: true,
    status: "active",
    tags: ["suplementos","proteinas"]
  },

  // Nutremax
  {
    id: 5,
    description: "Creatina Monohidratada 300g",
    brand: "Nutremax",
    idCategories: ["suplementos","nutremax"],
    priority: 1,
    visible: true,
    price: 8990,
    iva: 21,
    discount1: 5,
    discount2: 3,
    discount3: null,
    updatedAt: new Date("2024-03-25"),
    urlImg: "https://res.cloudinary.com/dr0rbyqrk/image/upload/v1713824874/whey_prot_chocolat_900_g-removebg-preview_moe9t6.png",
    inStock: true,
    status: "active",
    tags: ["suplementos","proteinas"]
  },
  {
    id: 6,
    description: "Proteína Vegana 1kg",
    brand: "Nutremax",
    idCategories: ["suplementos","nutremax"],
    priority: 2,
    visible: true,
    price: 15990,
    iva: 21,
    discount1: 8,
    discount2: 2,
    discount3: null,
    updatedAt: new Date("2024-04-01"),
    urlImg: "https://res.cloudinary.com/dr0rbyqrk/image/upload/v1713825203/whey_prot_frutilla_1_lb-removebg-preview_awnupx.png",
    inStock: true,
    status: "active",
    tags: ["suplementos","proteinas"]
  },
  {
    id: 7,
    description: "Barritas Proteicas x6",
    brand: "Nutremax",
    idCategories: ["suplementos","nutremax"],
    priority: 3,
    visible: true,
    price: 4290,
    iva: 10.5,
    discount1: null,
    discount2: null,
    discount3: null,
    updatedAt: new Date("2024-04-03"),
    urlImg: "https://res.cloudinary.com/dr0rbyqrk/image/upload/v1713825353/whey_prot_true_made_neutro_1lb-removebg-preview_fwgari.png",
    inStock: false,
    status: "inactive",
    tags: ["suplementos","proteinas"],
  },

  // Innova Naturals
  {
    id: 8,
    description: "Multivitamínico para Mujeres",
    brand: "Innova Naturals",
    idCategories: ["suplementos","nutremax"],
    priority: 1,
    visible: true,
    price: 11490,
    iva: 10.5,
    discount1: null,
    discount2: null,
    discount3: null,
    updatedAt: new Date("2024-04-05"),
    urlImg: "https://res.cloudinary.com/dr0rbyqrk/image/upload/v1713823862/creatina_microniz_frutilla_300_g-removebg-preview_ztgsxe.png",
    inStock: true,
    status: "active",
    tags: ["suplementos","proteinas"],
  }
]