export interface PointOfSale {
  id: string;
  puntoDeVenta: string;
  telefono: string;
  contacto: string;
  direccion: string;
  localidad: string;
  imgLogoUrl?: string;
  allowedCategoryIds?: string[];
}
