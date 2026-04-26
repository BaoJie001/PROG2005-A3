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
  newItem: any = {
    item_name: '',
    category: '',
    quantity: 0,
    price: 0,
    supplier_name: '',
    stock_status: 'in stock',
    featured_item: 0,
    special_note: ''
  };
  
  featuredItems: InventoryItem[] = [];
  loading = true;
  error = '';
  
  private inventorySubscription: Subscription | null = null;
  private addItemSubscription: Subscription | null = null;

  constructor(private inventoryService: InventoryService) {
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

  ngOnInit() {
    this.loadFeaturedItems();
  }

  ngOnDestroy() {
    if (this.inventorySubscription) {
      this.inventorySubscription.unsubscribe();
    }
    if (this.addItemSubscription) {
      this.addItemSubscription.unsubscribe();
    }
  }

  loadFeaturedItems() {
    this.loading = true;
    
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

  updateItemName(event: any) {
    this.newItem.item_name = event.target.value;
  }

  updateCategory(event: any) {
    this.newItem.category = event.target.value;
  }

  updateQuantity(event: any) {
    this.newItem.quantity = parseInt(event.target.value) || 0;
  }

  updatePrice(event: any) {
    this.newItem.price = parseFloat(event.target.value) || 0;
  }

  updateSupplier(event: any) {
    this.newItem.supplier_name = event.target.value;
  }

  updateStockStatus(event: any) {
    this.newItem.stock_status = event.target.value;
  }

  updateSpecialNote(event: any) {
    this.newItem.special_note = event.target.value;
  }

  updateFeatured(event: any) {
    this.newItem.featured_item = event.target.checked ? 1 : 0;
  }

  addItem() {
    console.log('Add item called');
    console.log('Form data:', this.newItem);
    
    if (!this.newItem.item_name) {
      alert('Please enter item name');
      return;
    }
    if (!this.newItem.category) {
      alert('Please enter category');
      return;
    }
    if (!this.newItem.quantity || this.newItem.quantity <= 0) {
      alert('Please enter valid quantity');
      return;
    }
    if (!this.newItem.price || this.newItem.price <= 0) {
      alert('Please enter valid price');
      return;
    }

    const itemToAdd: any = {
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
    
    if (this.addItemSubscription) {
      this.addItemSubscription.unsubscribe();
    }

    this.addItemSubscription = this.inventoryService.addItem(itemToAdd).subscribe({
      next: (addedItem) => {
        console.log('Item added successfully:', addedItem);
        this.resetForm();
        this.loadFeaturedItems();
        alert('Item added successfully!');
      },
      error: (err) => {
        console.error('Error adding item:', err);
        this.error = `Failed to add item: ${err.message || 'Unknown error'}`;
        this.loading = false;
        alert('Failed to add item: ' + (err.message || 'Unknown error'));
      }
    });
  }

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

  refresh() {
    this.loadFeaturedItems();
  }

  getStockColor(status: string) {
    const lowerStatus = (status || '').toLowerCase();
    if (lowerStatus === 'in stock') return '#10b981';
    if (lowerStatus === 'low stock') return '#f59e0b';
    if (lowerStatus === 'out of stock') return '#ef4444';
    return '#333';
  }

  showHelp() {
    alert('Green = In Stock\nOrange = Low Stock\nRed = Out of Stock\n\nTo add a new item, fill out all required fields marked with *');
  }
}