/**
 * Tab1Page
 * 
 * This page displays the inventory list with search, filter, and sort functionality.
 * It provides a comprehensive view of all inventory items with real-time filtering and sorting.
 */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  refreshOutline,
  helpCircleOutline,
  cubeOutline,
  starOutline,
  warningOutline,
  star,
  pricetagOutline,
  cashOutline,
  businessOutline,
  informationCircleOutline,
  alertCircleOutline,
  searchOutline,
  closeCircleOutline
} from 'ionicons/icons';
import { InventoryService, InventoryItem } from '../services/inventory.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class Tab1Page implements OnInit, OnDestroy {
  // Inventory data
  items: InventoryItem[] = [];           // All items from API
  filteredItems: InventoryItem[] = [];     // Items after filtering and sorting
  
  // UI state
  searchTerm: string = '';                // Search input value
  selectedStatus: string = 'all';         // Selected stock status filter
  sortField: string = 'item_name';        // Current sort field
  stockStatuses: string[] = ['in stock', 'low stock', 'out of stock'];  // Available stock statuses
  loading = true;                         // Loading state
  error = '';                             // Error message
  
  // Subscription for API calls
  private inventorySubscription: Subscription | null = null;

  /**
   * Constructor
   * @param inventoryService - Service for inventory API operations
   */
  constructor(private inventoryService: InventoryService) {
    // Register required icons for the page
    addIcons({
      refreshOutline,
      helpCircleOutline,
      cubeOutline,
      starOutline,
      warningOutline,
      star,
      pricetagOutline,
      cashOutline,
      businessOutline,
      informationCircleOutline,
      alertCircleOutline,
      searchOutline,
      closeCircleOutline
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
  }

  /**
   * Load inventory items from API
   * Handles loading state and error handling
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
        this.applyFiltersAndSort();
        this.loading = false;
        this.error = '';
      },
      error: (err) => {
        console.error('API Error:', err);
        this.error = `Failed to load inventory data: ${err.message || 'Unknown error'}`;
        this.loading = false;
        this.items = [];
        this.filteredItems = [];
      }
    });
  }

  /**
   * Refresh inventory data
   * Reloads items from the API
   */
  refresh() {
    // Force a full page reload to ensure data is refreshed in Android
    window.location.reload();
  }

  /**
   * Handle search input changes
   * Applies filters and sorting when search term changes
   */
  onSearchChange() {
    this.applyFiltersAndSort();
  }

  /**
   * Filter items by stock status
   * @param status - Stock status to filter by
   */
  filterByStatus(status: string) {
    this.selectedStatus = status;
    this.applyFiltersAndSort();
  }

  /**
   * Handle sort field changes
   * Applies filters and sorting when sort field changes
   */
  onSortChange() {
    this.applyFiltersAndSort();
  }

  /**
   * Clear search input
   * Resets search term and applies filters
   */
  clearSearch() {
    this.searchTerm = '';
    this.applyFiltersAndSort();
  }

  /**
   * Apply search, filter, and sort operations
   * This is the core method that processes the inventory data based on user input
   */
  applyFiltersAndSort() {
    // Apply search filter
    let filtered = this.items;
    
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(item => {
        return (
          item.item_name.toLowerCase().includes(term) ||
          item.category.toLowerCase().includes(term) ||
          (item.supplier_name && item.supplier_name.toLowerCase().includes(term))
        );
      });
    }

    // Apply status filter
    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(item => {
        const itemStatus = item.stock_status?.toLowerCase() || '';
        const selectedStatus = this.selectedStatus.toLowerCase();
        return itemStatus === selectedStatus;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[this.sortField as keyof InventoryItem];
      const bValue = b[this.sortField as keyof InventoryItem];
      
      // Handle undefined values
      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return 1;
      if (bValue === undefined) return -1;
      
      // Handle string comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue);
      }
      
      // Handle numeric comparison
      if (aValue < bValue) {
        return -1;
      }
      if (aValue > bValue) {
        return 1;
      }
      return 0;
    });

    this.filteredItems = filtered;
  }

  /**
   * Get number of featured items
   * @returns Number of featured items in the filtered list
   */
  getFeaturedCount() {
    return this.filteredItems.filter(item => item.featured_item === 1).length;
  }

  /**
   * Get number of low stock items
   * @returns Number of low stock items in the filtered list
   */
  getLowStockCount() {
    return this.filteredItems.filter(item => {
      const itemStatus = item.stock_status?.toLowerCase() || '';
      return itemStatus === 'low stock';
    }).length;
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
   * Displays a dialog with information about stock status colors
   */
  showHelp() {
    alert('Green = In Stock\nOrange = Low Stock\nRed = Out of Stock');
  }
}
