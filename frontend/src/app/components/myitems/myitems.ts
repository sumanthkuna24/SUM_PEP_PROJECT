import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ItemService } from '../../services/item.service';

@Component({
  selector: 'app-myitems',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './myitems.html',
  styleUrl: './myitems.css'
})
export class Myitems implements OnInit {
  private itemService = inject(ItemService);
  
  items = signal<any[]>([]);
  errorMessage = signal<string>('');
  loading = signal<boolean>(true);

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
}
