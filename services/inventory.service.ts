/**
 * InventoryService
 * 
 * This service handles all API interactions for inventory management.
 * It provides methods for CRUD operations on inventory items.
 */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * InventoryItem interface
 * 
 * Represents a single inventory item with all its properties.
 * @property item_id - Unique identifier for the item (auto-incrementing)
 * @property item_name - Name of the item (required, unique)
 * @property category - Category of the item (Electronics, Furniture, Clothing, Tools, Miscellaneous)
 * @property quantity - Quantity of the item in stock (required, integer)
 * @property price - Price of the item (required, integer)
 * @property supplier_name - Name of the supplier (required)
 * @property stock_status - Stock status of the item (In Stock, Low Stock, Out of Stock)
 * @property featured_item - Whether the item is featured (0 = not featured, 1 = featured)
 * @property special_note - Optional special notes about the item
 */
export interface InventoryItem {
  item_id?: number;         // Unique identifier (auto-incrementing)
  item_name: string;        // Item name (required, unique)
  category: string;         // Item category
  quantity: number;         // Quantity in stock (required)
  price: number;            // Item price (required)
  supplier_name: string;    // Supplier name (required)
  stock_status: string;     // Stock status
  featured_item?: number;   // Featured status (0 = no, 1 = yes)
  special_note?: string;    // Optional special notes
}

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  // API endpoint for inventory operations
  private apiUrl = 'https://prog2005.it.scu.edu.au/ArtGalley';

  /**
   * Constructor
   * @param http - HttpClient instance for making API requests
   */
  constructor(private http: HttpClient) {}

  /**
   * Get all inventory items
   * @returns Observable of InventoryItem array
   */
  getAllItems(): Observable<InventoryItem[]> {
    return this.http.get<InventoryItem[]>(this.apiUrl);
  }

  /**
   * Get a single inventory item by name
   * @param name - Name of the item to retrieve
   * @returns Observable of InventoryItem
   */
  getItem(name: string): Observable<InventoryItem> {
    return this.http.get<InventoryItem>(`${this.apiUrl}/${name}`);
  }

  /**
   * Add a new inventory item
   * @param item - Inventory item to add (without item_id)
   * @returns Observable of the added InventoryItem
   */
  addItem(item: Omit<InventoryItem, 'item_id'>): Observable<InventoryItem> {
    return this.http.post<InventoryItem>(this.apiUrl, item);
  }

  /**
   * Update an existing inventory item
   * @param name - Name of the item to update
   * @param item - Updated inventory item data
   * @returns Observable of the updated InventoryItem
   */
  updateItem(name: string, item: InventoryItem): Observable<InventoryItem> {
    return this.http.put<InventoryItem>(`${this.apiUrl}/${name}`, item);
  }

  /**
   * Delete an inventory item
   * @param name - Name of the item to delete
   * @returns Observable of void
   */
  deleteItem(name: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${name}`);
  }
}