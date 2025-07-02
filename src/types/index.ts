export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
  allergies?: UserAllergy[];
}

export interface UserAllergy {
  id: number;
  user_id: number;
  allergy_text: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  name: string;
  upc_code: string;
  ingredient_image_path?: string;
  ingredient_image_url?: string;
  created_at: string;
  updated_at: string;
  ingredients?: Ingredient[];
  ingredients_count?: number;
  allergens_count?: number;
}

export interface Ingredient {
  id: number;
  product_id: number;
  title: string;
  created_at: string;
  updated_at: string;
  allergens?: Allergen[];
}

export interface Allergen {
  id: number;
  ingredient_id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface ProductSearchResult {
  id: number;
  name: string;
  upc_code: string;
  ingredient_image_url?: string;
  ingredients_count: number;
  allergens_count: number;
  created_at: string;
  matching_allergens?: string[];
}

export interface ProductSafetyCheck {
  message: string;
  product: {
    id: number;
    name: string;
    upc_code: string;
  };
  is_safe: boolean;
  potential_conflicts: string[];
  product_allergens: string[];
}

export interface ApiResponse<T> {
  message: string;
  data?: T;
}

export interface PaginationResponse<T> {
  message: string;
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface SearchResponse<T> {
  message: string;
  products: T[];
  total: number;
  searched_allergens?: string[];
} 