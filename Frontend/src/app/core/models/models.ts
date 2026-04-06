// Auth
export interface AuthRequest  { username: string; password: string; email?: string; }
export interface AuthResponse { token: string; username: string; role: string; }

// Product
export interface Product {
  id: number;
  name: string;
  category: string;
  area: string;
  brand: string;
  estimatedPrice: number;
  calories: number;
  nutrients: string;
  ingredients: string;
  thumbnail: string;
  approved: boolean;
  createdAt?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

// Meal (TheMealDB)
export interface Meal {
  idMeal: string;
  strMeal: string;
  strCategory: string;
  strArea: string;
  strMealThumb: string;
  strInstructions?: string;
}

// Shopping List
export interface ShoppingItem {
  id: number;
  productId: number;
  productName: string;
  productThumbnail: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

// Import
export interface ImportRequest {
  estimatedPrice: number;
  calories: number;
  brand: string;
  approved: boolean;
}

export interface BulkImportRequest {
  externalIds: string[];
  defaultPrice: number;
  defaultCalories: number;
  autoApprove: boolean;
}

export interface BulkImportResult {
  importedCount: number;
  skipped: string[];
  failed: string[];
}
