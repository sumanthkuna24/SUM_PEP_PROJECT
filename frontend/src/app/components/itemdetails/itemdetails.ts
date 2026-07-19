import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ItemService } from '../../services/item.service';

@Component({
  selector: 'app-itemdetails',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './itemdetails.html',
  styleUrl: './itemdetails.css'
})
export class Itemdetails implements OnInit {
  private route = inject(ActivatedRoute);
  private itemService = inject(ItemService);

  item = signal<any | null>(null);
  loading = signal<boolean>(true);
  errorMessage = signal<string>('');

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.fetchItemDetails(id);
    } else {
      this.errorMessage.set('Invalid item ID');
      this.loading.set(false);
    }
  }

  fetchItemDetails(id: string) {
    this.itemService.getItemById(id).subscribe({
      next: (data) => {
        this.item.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Failed to fetch item details.');
        this.loading.set(false);
      }
    });
  }
}
