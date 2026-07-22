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

  existingImage = signal<string>('');
  selectedFile: File | null = null;

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
        
        this.existingImage.set(data.image || '');

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

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  inValid(field: string): boolean {
    const control = this.editForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  get f() {
    return this.editForm.controls;
  }

  getImageUrl(imagePath: string): string | null {
    return this.itemService.getImageUrl(imagePath);
  }

  onSubmit() {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');

    const formData = new FormData();
    formData.append('title', this.editForm.get('title')?.value);
    formData.append('description', this.editForm.get('description')?.value);
    formData.append('category', this.editForm.get('category')?.value);
    formData.append('itemType', this.editForm.get('itemType')?.value);
    formData.append('location', this.editForm.get('location')?.value);
    formData.append('date', this.editForm.get('date')?.value);

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.itemService.updateItem(this.itemId, formData).subscribe({
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
