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
  close
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
  items: InventoryItem[] = [];
  filteredItems: InventoryItem[] = [];
  selectedItem: InventoryItem | null = null;
  itemToDelete: InventoryItem | null = null;
  searchTerm = '';
  loading = true;
  error = '';
  showDeleteModal = false;
  
  private inventorySubscription: Subscription | null = null;
  private updateItemSubscription: Subscription | null = null;
  private deleteItemSubscription: Subscription | null = null;

  constructor(private inventoryService: InventoryService) {
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
      close
    });
  }

  ngOnInit() {
    this.loadItems();
  }

  ngOnDestroy() {
    if (this.inventorySubscription) this.inventorySubscription.unsubscribe();
    if (this.updateItemSubscription) this.updateItemSubscription.unsubscribe();
    if (this.deleteItemSubscription) this.deleteItemSubscription.unsubscribe();
  }

  loadItems() {
    this.loading = true;
    this.error = '';
    
    if (this.inventorySubscription) {
      this.inventorySubscription.unsubscribe();
    }

    this.inventorySubscription = this.inventoryService.getAllItems().subscribe({
      next: (data: InventoryItem[]) => {
        console.log('Items loaded:', data.length);
        this.items = data;
        this.filteredItems = [...data];
        this.loading = false;
      },
      error: (err) => {
        console.error('API Error:', err);
        this.error = 'Failed to load items: ' + (err.message || 'Unknown error');
        this.loading = false;
      }
    });
  }

  onSearchInput(event: any) {
    this.searchTerm = event.target.value;
    this.searchItems();
  }

  searchItems() {
    if (!this.searchTerm.trim()) {
      this.filteredItems = [...this.items];
      return;
    }
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredItems = this.items.filter(item => {
      return item.item_name.toLowerCase().includes(term);
    });
    console.log('Search results:', this.filteredItems.length);
  }

  clearSearch() {
    this.searchTerm = '';
    this.filteredItems = [...this.items];
  }

  onEditClick(item: InventoryItem) {
    console.log('Edit clicked:', item.item_name);
    console.log('Full item:', JSON.stringify(item));
    
    // 创建深拷贝
    this.selectedItem = {
      ...item,
      item_id: item.item_id,
      item_name: item.item_name || '',
      category: item.category || '',
      quantity: item.quantity || 0,
      price: item.price || 0,
      supplier_name: item.supplier_name || '',
      stock_status: item.stock_status || 'in stock',
      featured_item: item.featured_item || 0,
      special_note: item.special_note || ''
    };
    
    // 滚动到表单
    setTimeout(() => {
      const formElement = document.querySelector('.update-form-container');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
    
    // 提示用户已选中
    alert(`Editing: ${item.item_name}`);
  }

  onDeleteClick(item: InventoryItem) {
    console.log('Delete clicked:', item.item_name);
    this.itemToDelete = item;
    this.showDeleteModal = true;
  }

  updateSelectedItemField(field: string, event: any) {
    if (this.selectedItem) {
      let value = event.target.value;
      if (field === 'quantity' || field === 'price') {
        value = Number(value);
      }
      (this.selectedItem as any)[field] = value;
    }
  }

  updateSelectedItemStatus(event: any) {
    if (this.selectedItem) {
      this.selectedItem.stock_status = event.target.value;
    }
  }

  updateSelectedItemFeatured(event: any) {
    if (this.selectedItem) {
      this.selectedItem.featured_item = event.target.checked ? 1 : 0;
    }
  }

  cancelUpdate() {
    this.selectedItem = null;
  }

  updateItem() {
    console.log('Update button clicked');
    console.log('Selected item:', this.selectedItem);
    
    if (!this.selectedItem || !this.selectedItem.item_name) {
      alert('Please select an item first');
      return;
    }

    this.loading = true;
    
    if (this.updateItemSubscription) {
      this.updateItemSubscription.unsubscribe();
    }

    const updateData = {
      item_name: this.selectedItem.item_name,
      category: this.selectedItem.category,
      quantity: Number(this.selectedItem.quantity),
      price: Number(this.selectedItem.price),
      supplier_name: this.selectedItem.supplier_name || '',
      stock_status: this.selectedItem.stock_status,
      featured_item: this.selectedItem.featured_item ? 1 : 0,
      special_note: this.selectedItem.special_note || ''
    };

    console.log('Update data:', updateData);

    this.updateItemSubscription = this.inventoryService.updateItem(this.selectedItem.item_name, updateData).subscribe({
      next: (result) => {
        console.log('Update success:', result);
        alert('Item updated successfully!');
        this.loadItems();
        this.selectedItem = null;
        this.loading = false;
      },
      error: (err) => {
        console.error('Update error:', err);
        alert('Failed to update item: ' + (err.message || 'Unknown error'));
        this.loading = false;
      }
    });
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.itemToDelete = null;
  }

  confirmDeleteItem() {
    if (!this.itemToDelete || !this.itemToDelete.item_name) {
      return;
    }

    this.loading = true;
    
    if (this.deleteItemSubscription) {
      this.deleteItemSubscription.unsubscribe();
    }

    this.deleteItemSubscription = this.inventoryService.deleteItem(this.itemToDelete.item_name).subscribe({
      next: () => {
        console.log('Delete success');
        alert('Item deleted successfully!');
        this.loadItems();
        this.closeDeleteModal();
        this.loading = false;
      },
      error: (err) => {
        console.error('Delete error:', err);
        if (err.message && err.message.includes('Laptop')) {
          alert('Cannot delete "Laptop" item. This item is protected.');
        } else {
          alert('Failed to delete item: ' + (err.message || 'Unknown error'));
        }
        this.loading = false;
        this.closeDeleteModal();
      }
    });
  }

  refresh() {
    console.log('Refresh clicked');
    this.loadItems();
  }

  formatPrice(price: number): string {
    return price !== undefined && price !== null ? price.toFixed(2) : '0.00';
  }

  getStockStatusClass(status: string): string {
    const lowerStatus = (status || '').toLowerCase();
    if (lowerStatus === 'in stock') return 'in-stock';
    if (lowerStatus === 'low stock') return 'low-stock';
    if (lowerStatus === 'out of stock') return 'out-of-stock';
    return '';
  }

  getStockColor(status: string) {
    const lowerStatus = (status || '').toLowerCase();
    if (lowerStatus === 'in stock') return '#10b981';
    if (lowerStatus === 'low stock') return '#f59e0b';
    if (lowerStatus === 'out of stock') return '#ef4444';
    return '#333';
  }

  showHelp() {
    alert('Green = In Stock\nOrange = Low Stock\nRed = Out of Stock\n\nSearch for items by name, then click Edit to update or Delete to remove items.\n\nNote: "Laptop" cannot be deleted.');
  }
}