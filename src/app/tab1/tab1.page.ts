/**
 * Tab1Page - Inventory List Page
 * 
 * This page displays the inventory list with search, filter, and sort functionality.
 * It fetches data from the backend API and allows users to interact with the inventory.
 * 
 * Features:
 * - Display all inventory items
 * - Statistics cards showing totals
 * - Search by item name, category, or supplier
 * - Filter by stock status (In Stock, Low Stock, Out of Stock)
 * - Sort by name, category, price, or quantity
 * - Color-coded stock status (Green/Orange/Red)
 * - Refresh button to reload data
 * - Help button to show usage instructions
 * 
 * @component Tab1Page
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
  // ==================== DATA PROPERTIES ====================
  
  /** All inventory items fetched from the API */
  items: InventoryItem[] = [];
  
  /** Items after applying search, filter, and sort operations */
  filteredItems: InventoryItem[] = [];
  
  // ==================== UI STATE PROPERTIES ====================
  
  /** Current search term entered by the user */
  searchTerm: string = '';
  
  /** Currently selected stock status filter ('all', 'in stock', 'low stock', 'out of stock') */
  selectedStatus: string = 'all';
  
  /** Current sort field ('item_name', 'category', 'price', 'quantity') */
  sortField: string = 'item_name';
  
  /** Available stock status options for filter buttons */
  stockStatuses: string[] = ['in stock', 'low stock', 'out of stock'];
  
  /** Indicates whether data is currently being loaded */
  loading = true;
  
  /** Error message to display if API call fails */
  error = '';
  
  // ==================== SUBSCRIPTIONS ====================
  
  /** Subscription to the API call for cleanup to prevent memory leaks */
  private inventorySubscription: Subscription | null = null;

  // ==================== LIFECYCLE HOOKS ====================
  
  /**
   * Constructor - Initializes the component and registers icons
   * @param inventoryService - Service for inventory API operations
   */
  constructor(private inventoryService: InventoryService) {
    // Register all required icons for this page
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
   * ngOnInit lifecycle hook - Called after component initialization
   * Loads inventory items when the page is first created
   */
  ngOnInit() {
    this.loadItems();
  }

  /**
   * ngOnDestroy lifecycle hook - Called before component destruction
   * Cleans up subscriptions to prevent memory leaks
   */
  ngOnDestroy() {
    if (this.inventorySubscription) {
      this.inventorySubscription.unsubscribe();
    }
  }

  // ==================== DATA FETCHING METHODS ====================
  
  /**
   * Loads all inventory items from the API
   * Handles loading state and error handling
   * Once data is received, applies filters and sorting
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
   * Refresh button handler - Reloads all inventory data from the API
   * Called when user clicks the refresh icon in the header
   */
  refresh() {
    this.loadItems();
  }

  // ==================== SEARCH METHODS ====================
  
  /**
   * Handles search input changes
   * Updates search term and reapplies filters and sorting
   * @param event - Input change event containing the new search value
   */
  onSearchChange(event: any) {
    this.searchTerm = event.target.value;
    this.applyFiltersAndSort();
  }

  /**
   * Clears the search input field
   * Resets search term and reapplies filters and sorting
   */
  clearSearch() {
    this.searchTerm = '';
    this.applyFiltersAndSort();
  }

  // ==================== FILTER METHODS ====================
  
  /**
   * Filters items by stock status
   * Updates selected status and reapplies filters and sorting
   * @param status - Stock status to filter by ('all', 'in stock', 'low stock', 'out of stock')
   */
  filterByStatus(status: string) {
    console.log('Filter by status:', status);
    this.selectedStatus = status;
    this.applyFiltersAndSort();
  }

  // ==================== SORT METHODS ====================
  
  /**
   * Handles sort field changes
   * Updates sort field and reapplies filters and sorting
   * @param event - Change event containing the new sort field value
   */
  onSortChange(event: any) {
    console.log('Sort changed:', event.target.value);
    this.sortField = event.target.value;
    this.applyFiltersAndSort();
  }

  // ==================== CORE PROCESSING METHOD ====================
  
  /**
   * Core method that applies search, filter, and sort operations to the inventory data
   * This is called whenever the user interacts with search, filter, or sort controls
   * 
   * Processing steps:
   * 1. Create a copy of the original items array
   * 2. Apply search filter if search term exists
   * 3. Apply status filter if not 'all'
   * 4. Apply sorting based on selected field
   * 5. Store the result in filteredItems for display
   */
  applyFiltersAndSort() {
    // Step 1: Create a copy of the original items
    let filtered = [...this.items];
    
    // Step 2: Apply search filter - matches item name, category, or supplier
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(item => {
        return (
          (item.item_name && item.item_name.toLowerCase().includes(term)) ||
          (item.category && item.category.toLowerCase().includes(term)) ||
          (item.supplier_name && item.supplier_name.toLowerCase().includes(term))
        );
      });
    }

    // Step 3: Apply status filter - filters by stock status
    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(item => {
        const itemStatus = (item.stock_status || '').toLowerCase();
        return itemStatus === this.selectedStatus.toLowerCase();
      });
    }

    // Step 4: Apply sorting based on selected field
    // Handle string comparison for name and category
    const aValue = filtered[0]?.[this.sortField as keyof InventoryItem];
    const bValue = filtered[1]?.[this.sortField as keyof InventoryItem];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      // String sorting (for name and category)
      filtered.sort((a, b) => {
        const valA = (a[this.sortField as keyof InventoryItem] as string || '').toLowerCase();
        const valB = (b[this.sortField as keyof InventoryItem] as string || '').toLowerCase();
        return valA.localeCompare(valB);
      });
    } else {
      // Numeric sorting (for price and quantity)
      filtered.sort((a, b) => {
        const valA = a[this.sortField as keyof InventoryItem] as number || 0;
        const valB = b[this.sortField as keyof InventoryItem] as number || 0;
        return valA - valB;
      });
    }

    // Step 5: Store the processed result
    this.filteredItems = filtered;
  }

  // ==================== STATISTICS METHODS ====================
  
  /**
   * Calculates the number of featured items in the filtered list
   * Featured items are those with featured_item === 1
   * @returns Number of featured items
   */
  getFeaturedCount() {
    return this.filteredItems.filter(item => item.featured_item === 1).length;
  }

  /**
   * Calculates the number of low stock items in the filtered list
   * Low stock items are those with stock_status === 'low stock'
   * @returns Number of low stock items
   */
  getLowStockCount() {
    return this.filteredItems.filter(item => {
      const itemStatus = (item.stock_status || '').toLowerCase();
      return itemStatus === 'low stock';
    }).length;
  }

  // ==================== HELPER METHODS ====================
  
  /**
   * Returns the color code for a given stock status
   * Used for color-coding stock status text in the UI
   * 
   * @param status - Stock status string ('in stock', 'low stock', 'out of stock')
   * @returns Hex color code
   *   - '#10b981' (green) for In Stock
   *   - '#f59e0b' (orange) for Low Stock
   *   - '#ef4444' (red) for Out of Stock
   *   - '#333' (dark gray) for unknown status
   */
  getStockColor(status: string) {
    const lowerStatus = (status || '').toLowerCase();
    if (lowerStatus === 'in stock') return '#10b981';
    if (lowerStatus === 'low stock') return '#f59e0b';
    if (lowerStatus === 'out of stock') return '#ef4444';
    return '#333';
  }

  /**
   * Help button handler - Displays usage instructions
   * Shows an alert dialog with information about stock status colors
   * Meets the assignment requirement for a Help Widget on every page
   */
  showHelp() {
    alert('Green = In Stock\nOrange = Low Stock\nRed = Out of Stock');
  }
}