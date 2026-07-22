import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ItemService } from '../../services/item.service';

@Component({
  selector: 'app-myitems',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './myitems.html',
  styleUrl: './myitems.css'
})
export class Myitems implements OnInit {
  private itemService = inject(ItemService);
  
  items = signal<any[]>([]);
  errorMessage = signal<string>('');
  loading = signal<boolean>(true);

  getImageUrl(path: string | null | undefined): string | null {
    return this.itemService.getImageUrl(path);
  }

  ngOnInit() {
    this.fetchMyItems();
  }

  fetchMyItems() {
    this.loading.set(true);
    this.itemService.getMyItems().subscribe({
      next: (data) => {
        this.items.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set('Failed to load items.');
        this.loading.set(false);
      }
    });
  }

  deleteItem(id: string) {
    if (confirm('Are you sure you want to delete this item?')) {
      this.itemService.deleteItem(id).subscribe({
        next: (res) => {
          // Update the list of items locally
          this.items.update(prev => prev.filter(item => item._id !== id));
        },
        error: (err) => {
          alert(err.error?.message || 'Error deleting item');
        }
      });
    }
  }
}
