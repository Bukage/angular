import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface InventoryItem {
  _id?: string;
  inventoryId: string;
  userId: string;
  ingredientName: string;
  quantity: number;
  unit:
    | 'pieces'
    | 'kg'
    | 'g'
    | 'liters'
    | 'ml'
    | 'cups'
    | 'tbsp'
    | 'tsp'
    | 'dozen';
  category:
    | 'Vegetables'
    | 'Fruits'
    | 'Meat'
    | 'Dairy'
    | 'Grains'
    | 'Spices'
    | 'Beverages'
    | 'Frozen'
    | 'Canned'
    | 'Other';
  purchaseDate: string | Date;
  expirationDate: string | Date;
  location: 'Fridge' | 'Freezer' | 'Pantry' | 'Counter' | 'Cupboard';
  cost: number;
  createdDate: string | Date;
}

export interface InventoryListResponse {
  inventory: InventoryItem[];
  expiredItems: any[];
  expiringSoonItems: any[];
  lowStockItems: InventoryItem[];
  inventoryStats: {
    totalValue: number;
    totalItems: number;
    expiredCount: number;
    expiringSoonCount: number;
    lowStockCount: number;
  };
}

@Injectable({ providedIn: 'root' })
export class InventoryService {
  constructor(private http: HttpClient) {}

  async list(): Promise<InventoryListResponse> {
    return firstValueFrom(this.http.get<InventoryListResponse>(`/api/inventory-33968748`));
  }

  async get(inventoryId: string): Promise<InventoryItem> {
    const res = await firstValueFrom(
      this.http.get<{ item: InventoryItem }>(`/api/inventory-33968748/${encodeURIComponent(inventoryId)}`)
    );
    return res.item;
  }

  async create(payload: Omit<InventoryItem, 'inventoryId' | 'userId'>): Promise<InventoryItem> {
    const res = await firstValueFrom(
      this.http.post<{ item: InventoryItem }>(`/api/inventory-33968748`, payload as any)
    );
    return res.item;
  }

  async update(inventoryId: string, payload: Partial<InventoryItem>): Promise<InventoryItem> {
    const res = await firstValueFrom(
      this.http.put<{ item: InventoryItem }>(
        `/api/inventory-33968748/${encodeURIComponent(inventoryId)}`,
        payload
      )
    );
    return res.item;
  }

  async remove(inventoryId: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`/api/inventory-33968748/${encodeURIComponent(inventoryId)}`)
    );
  }
}
