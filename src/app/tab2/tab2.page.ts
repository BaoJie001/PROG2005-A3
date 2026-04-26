/**
 * Tab2Page
 * 
 * This page allows users to add new inventory items and view featured items.
 * It provides a form for creating new items and displays a list of featured items.
 */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  refreshOutline,
  helpCircleOutline,
  star,
  pricetagOutline,
  cubeOutline,
  cashOutline,
  businessOutline,
  informationCircleOutline,
  alertCircleOutline,
  starOutline
} from 'ionicons/icons';
import { InventoryService, InventoryItem } from '../services/inventory.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class Tab2Page implements OnInit, OnDestroy {
  // New item form data
  newItem: Partial<InventoryItem> = {
    item_name: '',
    category: '',
    quantity: 0,
    price: 0,
    supplier_name: '',
    stock_status: 'in stock',
    featured_item: 0,
    special_note: ''
  };
  
  // Featured items data
  featuredItems: InventoryItem[] = [];
  
  // UI state
  loading = true;
  error = '';
  
  // Subscriptions for API calls
  private inventorySubscription: Subscription | null = null;
  private addItemSubscription: Subscription | null = null;

  /**
   * Constructor
   * @param inventoryService - Service for inventory API operations
   */
  constructor(private inventoryService: InventoryService) {
    // Register required icons for the page
    addIcons({
      refreshOutline,
      helpCircleOutline,
      star,
      pricetagOutline,
      cubeOutline,
      cashOutline,
      businessOutline,
      informationCircleOutline,
      alertCircleOutline,
      starOutline
    });
  }

  /**
   * Initialize the component
   * Loads featured items on component initialization
   */
  ngOnInit() {
    this.loadFeaturedItems();
  }

  /**
   * Clean up resources
   * Unsubscribes from API calls to prevent memory leaks
   */
  ngOnDestroy() {
    if (this.inventorySubscription) {
      this.inventorySubscription.unsubscribe();
    }
    if (this.addItemSubscription) {
      this.addItemSubscription.unsubscribe();
    }
  }

  /**
   * Load featured items from API
   * Filters items where featured_item is 1
   */
  loadFeaturedItems() {
    this.loading = true;
    
    // Cancel any existing subscription to avoid duplicate requests
    if (this.inventorySubscription) {
      this.inventorySubscription.unsubscribe();
    }

    this.inventorySubscription = this.inventoryService.getAllItems().subscribe({
      next: (data: InventoryItem[]) => {
        this.featuredItems = data.filter(item => item.featured_item === 1);
        this.loading = false;
        this.error = '';
      },
      error: (err) => {
        console.error('API Error:', err);
        this.error = `Failed to load featured items: ${err.message || 'Unknown error'}`;
        this.loading = false;
        this.featuredItems = [];
      }
    });
  }

  /**
   * Add a new inventory item
   * Validates form data and calls API to add the item
   */
  addItem() {
    // Validate required fields
    if (!this.newItem.item_name || !this.newItem.category || !this.newItem.quantity || !this.newItem.price || !this.newItem.stock_status) {
      return;
    }

    // Prepare item data for API call
    const itemToAdd: Omit<InventoryItem, 'item_id'> = {
      item_name: this.newItem.item_name,
      category: this.newItem.category,
      quantity: this.newItem.quantity,
      price: this.newItem.price,
      supplier_name: this.newItem.supplier_name || '',
      stock_status: this.newItem.stock_status,
      featured_item: this.newItem.featured_item || 0,
      special_note: this.newItem.special_note || ''
    };

    this.loading = true;
    
    // Cancel any existing subscription to avoid duplicate requests
    if (this.addItemSubscription) {
      this.addItemSubscription.unsubscribe();
    }

    this.addItemSubscription = this.inventoryService.addItem(itemToAdd).subscribe({
      next: (addedItem) => {
        console.log('Item added successfully:', addedItem);
        this.resetForm();
        this.loadFeaturedItems();
        // Show success message
        alert('Item added successfully!');
      },
      error: (err) => {
        console.error('Error adding item:', err);
        this.error = `Failed to add item: ${err.message || 'Unknown error'}`;
        this.loading = false;
      }
    });
  }

  /**
   * Reset the new item form
   * Clears all form fields to their default values
   */
  resetForm() {
    this.newItem = {
      item_name: '',
      category: '',
      quantity: 0,
      price: 0,
      supplier_name: '',
      stock_status: 'in stock',
      featured_item: 0,
      special_note: ''
    };
  }

  /**
   * Refresh featured items
   * Reloads featured items from the API
   */
  refresh() {
    // Force a full page reload to ensure data is refreshed in Android
    window.location.reload();
  }

  /**
   * Get color based on stock status
   * @param status - Stock status
   * @returns Color code for the status
   */
  getStockColor(status: string) {
    const lowerStatus = status?.toLowerCase() || '';
    if (lowerStatus === 'in stock') return '#10b981';
    if (lowerStatus === 'low stock') return '#f59e0b';
    if (lowerStatus === 'out of stock') return '#ef4444';
    return '#333';
  }

  /**
   * Show help information
   * Displays a dialog with information about stock status colors and form usage
   */
  showHelp() {
    alert('Green = In Stock\nOrange = Low Stock\nRed = Out of Stock\n\nTo add a new item, fill out all required fields marked with *');
  }
}
