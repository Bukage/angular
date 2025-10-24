import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { InventoryService, InventoryListResponse } from './inventory.service';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './inventory-list.component.html',
})
export class InventoryListComponent implements OnInit {
  data: InventoryListResponse | null = null;
  constructor(private api: InventoryService) {}
  async ngOnInit() {
    this.data = await this.api.list();
  }

  async onDelete(id: string) {
    if (!confirm('Delete this item?')) return;
    await this.api.remove(id);
    const refreshed = await this.api.list();
    this.data = refreshed;
  }
}
