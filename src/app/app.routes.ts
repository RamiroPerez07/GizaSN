import { Routes } from '@angular/router';
import { ProductsComponent } from './components/products/products.component';
import { CartComponent } from './components/cart/cart.component';
import { HeroComponent } from './components/hero/hero.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';

export const routes: Routes = [
    {path: "", component: HeroComponent},
    {path: "products", component: ProductsComponent},
    { path: "products/:id", component: ProductDetailComponent },
    {path: "cart", component: CartComponent}
];
