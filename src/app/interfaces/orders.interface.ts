import { IProduct } from "./products.interface";

export interface IOrder{
    _id?: string;
    username?: string;
    idOrder: string;
    posId: string;
    pos: string;
    status: string;
    origin: string;
    delivered: boolean;
    charged: boolean;
    deliveryDate?: Date | null;
    nameBuyer: string;
    lastNameBuyer: string;
    identityDocument?: string;
    telBuyer?: string;
    paymentMethod: string;
    addressType?: string;
    address: string;
    locality: string;
    items: IProduct[];
    observation?: string;
    updatedAt?: Date;
    createdAt?: Date;
}

export interface PaginatedOrders {
  total: number;
  page: number;
  totalPages: number;
  limit: number;
  orders: IOrder[];
}