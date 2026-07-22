import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ItemService } from '../../services/item.service';

@Component({
  selector: 'app-browse',
  standalone: true,
  imports: [DatePipe, RouterLink, ReactiveFormsModule],
  templateUrl: './browse.html',
  styleUrl: './browse.css'
})
export class Browse implements OnInit {
  private fb = inject(FormBuilder);
  private itemService = inject(ItemService);

  items = signal<any[]>([]);
  loading = signal<boolean>(true);
  errorMessage = signal<string>('');

  getImageUrl(path: string | null | undefined): string | null {
    return this.itemService.getImageUrl(path);
  }

  filterForm: FormGroup = this.fb.group({
    search: [''],
    category: [''],
    itemType: ['']
  });

  ngOnInit() {
    this.fetchItems();
    
    // Subscribe to form value changes to filter in real-time
    this.filterForm.valueChanges.subscribe(() => {
      this.fetchItems();
    });
  }

  fetchItems() {
    this.loading.set(true);
    const filters = this.filterForm.value;
    this.itemService.getOpenItems(filters).subscribe({
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
