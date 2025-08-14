export interface PointOfSale {
  id: string;
  puntoDeVenta: string;
  telefono: string;
  contacto: string;
  direccion: string;
  ofreceRetiro: boolean;
  localidad: string;
  imgLogoUrl?: string;
  allowedCategoryIds?: string[];
}
