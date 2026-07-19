import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ItemService } from '../../services/item.service';

@Component({
  selector: 'app-edititem',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './edititem.html',
  styleUrl: './edititem.css'
})
export class Edititem implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private itemService = inject(ItemService);

  itemId: string = '';
  errorMessage = signal<string>('');
  successMessage = signal<string>('');
  loading = signal<boolean>(true);

  editForm: FormGroup = this.fb.group({
    title: ['', [Validators.required]],
    description: ['', [Validators.required]],
    category: ['', [Validators.required]],
    itemType: ['', [Validators.required]],
    location: ['', [Validators.required]],
    date: ['', [Validators.required]]
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.itemId = id;
      this.fetchItemDetails(id);
    } else {
      this.errorMessage.set('Invalid item ID');
      this.loading.set(false);
    }
  }

  fetchItemDetails(id: string) {
    this.itemService.getItemById(id).subscribe({
      next: (data) => {
        // Format date string to YYYY-MM-DD for date input binding
        let formattedDate = '';
        if (data.date) {
          formattedDate = new Date(data.date).toISOString().substring(0, 10);
        }
        
        this.editForm.patchValue({
          title: data.title,
          description: data.description,
          category: data.category,
          itemType: data.itemType,
          location: data.location,
          date: formattedDate
        });
        
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Failed to load item details.');
        this.loading.set(false);
      }
    });
  }

  inValid(field: string): boolean {
    const control = this.editForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  get f() {
    return this.editForm.controls;
  }

  onSubmit() {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');

    this.itemService.updateItem(this.itemId, this.editForm.value).subscribe({
      next: (res) => {
        this.successMessage.set('Changes saved successfully!');
        setTimeout(() => {
          this.router.navigate(['/my-items']);
        }, 1500);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Failed to save changes.');
      }
    });
  }
}
