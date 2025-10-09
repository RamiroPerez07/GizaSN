import { Routes } from '@angular/router';
import { ProductsComponent } from './components/products/products.component';
import { CartComponent } from './components/cart/cart.component';
import { HeroComponent } from './components/hero/hero.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { OrdersComponent } from './components/orders/orders.component';
import { OrderDetailComponent } from './components/order-detail/order-detail.component';

export const routes: Routes = [
    {path: "", component: HeroComponent},
    {path: "products", component: ProductsComponent},
    { path: "products/category/:categoryId", component: ProductsComponent },
    { path: "products/category/:categoryId/product/:id", component: ProductDetailComponent },
    {path: "products/:id", component: ProductDetailComponent},
    {path: "orders", component: OrdersComponent},
    {path: "orders/:id", component: OrderDetailComponent },
    {path: "cart", component: CartComponent},
];
