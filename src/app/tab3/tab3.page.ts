/**
 * Tab3Page
 * 
 * This page allows users to update and delete existing inventory items.
 * It provides a search functionality to find items by name and form to update item details.
 */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  refreshOutline,
  helpCircleOutline,
  search,
  closeCircle,
  createOutline,
  trashOutline,
  pricetagOutline,
  cubeOutline,
  cashOutline,
  businessOutline,
  alertCircleOutline,
  searchOutline,
  close,
  checkmark
} from 'ionicons/icons';
import { InventoryService, InventoryItem } from '../services/inventory.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class Tab3Page implements OnInit, OnDestroy {
  // Inventory data
  items: InventoryItem[] = [];           // All items from API
  filteredItems: InventoryItem[] = [];     // Items after filtering
  
  // UI state
  selectedItem: InventoryItem | null = null;  // Currently selected item for editing
  itemToDelete: InventoryItem | null = null;  // Item to be deleted
  searchTerm = '';                          // Search input value
  loading = true;                           // Loading state
  error = '';                               // Error message
  showDeleteModal = false;                   // Delete confirmation modal state
  
  // Subscriptions for API calls
  private inventorySubscription: Subscription | null = null;
  private updateItemSubscription: Subscription | null = null;
  private deleteItemSubscription: Subscription | null = null;

  /**
   * Constructor
   * @param inventoryService - Service for inventory API operations
   */
  constructor(private inventoryService: InventoryService) {
    // Register required icons for the page
    addIcons({
      refreshOutline,
      helpCircleOutline,
      search,
      closeCircle,
      createOutline,
      trashOutline,
      pricetagOutline,
      cubeOutline,
      cashOutline,
      businessOutline,
      alertCircleOutline,
      searchOutline,
      close,
      checkmark
    });
  }

  /**
   * Initialize the component
   * Loads inventory items on component initialization
   */
  ngOnInit() {
    this.loadItems();
  }

  /**
   * Clean up resources
   * Unsubscribes from API calls to prevent memory leaks
   */
  ngOnDestroy() {
    if (this.inventorySubscription) {
      this.inventorySubscription.unsubscribe();
    }
    if (this.updateItemSubscription) {
      this.updateItemSubscription.unsubscribe();
    }
    if (this.deleteItemSubscription) {
      this.deleteItemSubscription.unsubscribe();
    }
  }

  /**
   * Load inventory items from API
   */
  loadItems() {
    this.loading = true;
    
    // Cancel any existing subscription to avoid duplicate requests
    if (this.inventorySubscription) {
      this.inventorySubscription.unsubscribe();
    }

    this.inventorySubscription = this.inventoryService.getAllItems().subscribe({
      next: (data: InventoryItem[]) => {
        this.items = data;
        this.filteredItems = data;
        this.loading = false;
        this.error = '';
      },
      error: (err) => {
        console.error('API Error:', err);
        this.error = `Failed to load items: ${err.message || 'Unknown error'}`;
        this.loading = false;
        this.items = [];
        this.filteredItems = [];
      }
    });
  }

  /**
   * Search items by name
   * Filters items based on search term
   */
  searchItems() {
    if (!this.searchTerm.trim()) {
      this.filteredItems = this.items;
      return;
    }

    const term = this.searchTerm.toLowerCase().trim();
    this.filteredItems = this.items.filter(item => {
      return item.item_name.toLowerCase().includes(term);
    });
  }

  /**
   * Clear search input
   * Resets search term and filter
   */
  clearSearch() {
    this.searchTerm = '';
    this.filteredItems = this.items;
  }

  /**
   * Select an item for editing
   * @param item - Inventory item to edit
   */
  selectItem(item: InventoryItem) {
    // Create a deep copy of the item to avoid direct modification
    this.selectedItem = JSON.parse(JSON.stringify(item));
  }

  /**
   * Cancel item editing
   * Clears the selected item
   */
  cancelUpdate() {
    this.selectedItem = null;
  }

  /**
   * Update an inventory item
   * Validates form data and calls API to update the item
   */
  updateItem() {
    if (!this.selectedItem || !this.selectedItem.item_name) return;

    this.loading = true;
    
    // Cancel any existing subscription to avoid duplicate requests
    if (this.updateItemSubscription) {
      this.updateItemSubscription.unsubscribe();
    }

    this.updateItemSubscription = this.inventoryService.updateItem(this.selectedItem.item_name, this.selectedItem).subscribe({
      next: (updatedItem) => {
        console.log('Item updated successfully:', updatedItem);
        this.loadItems();
        this.selectedItem = null;
        // Show success message
        alert('Item updated successfully!');
      },
      error: (err) => {
        console.error('Error updating item:', err);
        this.error = `Failed to update item: ${err.message || 'Unknown error'}`;
        this.loading = false;
      }
    });
  }

  /**
   * Confirm item deletion
   * Shows delete confirmation modal
   * @param item - Inventory item to delete
   */
  confirmDelete(item: InventoryItem) {
    this.itemToDelete = item;
    this.showDeleteModal = true;
  }

  /**
   * Delete an inventory item
   * Calls API to delete the item
   */
  deleteItem() {
    if (!this.itemToDelete || !this.itemToDelete.item_name) return;

    this.loading = true;
    
    // Cancel any existing subscription to avoid duplicate requests
    if (this.deleteItemSubscription) {
      this.deleteItemSubscription.unsubscribe();
    }

    this.deleteItemSubscription = this.inventoryService.deleteItem(this.itemToDelete.item_name).subscribe({
      next: () => {
        console.log('Item deleted successfully:', this.itemToDelete);
        this.loadItems();
        this.showDeleteModal = false;
        this.itemToDelete = null;
        // Show success message
        alert('Item deleted successfully!');
      },
      error: (err) => {
        console.error('Error deleting item:', err);
        this.error = `Failed to delete item: ${err.message || 'Unknown error'}`;
        this.loading = false;
        this.showDeleteModal = false;
      }
    });
  }

  /**
   * Refresh inventory data
   * Reloads items from the API
   */
  refresh() {
    this.loadItems();
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
   * Displays a dialog with information about page functionality
   */
  showHelp() {
    alert('🟢 Green = In Stock\n🟠 Orange = Low Stock\n🔴 Red = Out of Stock\n\nSearch for items by name, then click Edit to update or Delete to remove items.');
  }
}
