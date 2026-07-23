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
  successMessage = signal<string>('');
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
        this.errorMessage.set('Failed to load items. Please try again.');
        this.loading.set(false);
      }
    });
  }

  deleteItem(id: string) {
    if (confirm('Are you sure you want to delete this item report?')) {
      this.itemService.deleteItem(id).subscribe({
        next: (res) => {
          this.successMessage.set('Item deleted successfully!');
          this.items.update(prev => prev.filter(item => item._id !== id));
          setTimeout(() => this.successMessage.set(''), 3000);
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'Error deleting item');
          setTimeout(() => this.errorMessage.set(''), 3000);
        }
      });
    }
  }

  resolveItem(id: string) {
    if (confirm('Confirm that this item has been returned and handover is complete?')) {
      this.itemService.resolveItem(id).subscribe({
        next: (res) => {
          this.successMessage.set('Item marked as Resolved!');
          this.items.update(prev =>
            prev.map(item => (item._id === id ? { ...item, status: 'Resolved' } : item))
          );
          setTimeout(() => this.successMessage.set(''), 3000);
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'Error marking item as resolved');
          setTimeout(() => this.errorMessage.set(''), 3000);
        }
      });
    }
  }
}
