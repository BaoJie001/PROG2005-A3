/**
 * Tab4Page
 * 
 * This page presents information about privacy and security requirements for the inventory management system.
 * It provides details about data protection, security measures, and compliance with regulations.
 */
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  helpCircleOutline,
  checkmarkCircle,
  shieldCheckmark,
  lockClosed,
  refreshCircle,
  alertCircle,
  mail,
  call,
  location
} from 'ionicons/icons';

@Component({
  selector: 'app-tab4',
  templateUrl: 'tab4.page.html',
  styleUrls: ['tab4.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class Tab4Page {
  /**
   * Constructor
   * Registers required icons for the page
   */
  constructor() {
    // Register required icons for the page
    addIcons({
      helpCircleOutline,
      checkmarkCircle,
      shieldCheckmark,
      lockClosed,
      refreshCircle,
      alertCircle,
      mail,
      call,
      location
    });
  }

  /**
   * Show help information
   * Displays a dialog with information about the privacy and security page
   */
  showHelp() {
    alert('Privacy & Security Page\n\nThis page provides information about how we protect your inventory data.\n\nKey features:\n• Data encryption\n• Access control\n• Regular backups\n• Compliance with regulations\n\nIf you have any questions, please contact our support team.');
  }

  /**
   * Refresh page
   * Reloads the page content
   */
  refresh() {
    // Refresh logic here
    window.location.reload();
  }
}
