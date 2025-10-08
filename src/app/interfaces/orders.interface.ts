import { IProduct } from "./products.interface";

export interface IOrder{
    _id?: string;
    idOrder: string;
    posId: string;
    pos: string;
    status: string;
    delivered: boolean;
    charged: boolean;
    deliveryDate?: Date;
    nameBuyer: string;
    lastNameBuyer: string;
    identityDocument?: string;
    telBuyer?: string;
    paymentMethod: string;
    address: string;
    locality: string;
    items: IProduct[];
    observation?: string;
    updatedAt?: Date;
    createdAt?: Date;
}