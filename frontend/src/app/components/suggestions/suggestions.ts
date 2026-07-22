import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ItemService } from '../../services/item.service';

@Component({
  selector: 'app-suggestions',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './suggestions.html',
  styleUrl: './suggestions.css'
})
export class Suggestions implements OnInit {
  private route = inject(ActivatedRoute);
  private itemService = inject(ItemService);

  targetItem = signal<any | null>(null);
  suggestions = signal<any[]>([]);
  loading = signal<boolean>(true);
  errorMessage = signal<string>('');

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.fetchSuggestions(id);
    } else {
      this.errorMessage.set('Invalid item ID');
      this.loading.set(false);
    }
  }

  fetchSuggestions(id: string) {
    this.loading.set(true);
    this.itemService.getItemSuggestions(id).subscribe({
      next: (res) => {
        this.targetItem.set(res.item);
        this.suggestions.set(res.suggestions || []);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Failed to load matching suggestions.');
        this.loading.set(false);
      }
    });
  }

  getImageUrl(path: string | null | undefined): string | null {
    return this.itemService.getImageUrl(path);
  }
}
