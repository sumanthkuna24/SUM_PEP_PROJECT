import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ItemService } from '../../services/item.service';

@Component({
  selector: 'app-postitem',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './postitem.html',
  styleUrl: './postitem.css'
})
export class Postitem {
  private fb = inject(FormBuilder);
  private itemService = inject(ItemService);
  private router = inject(Router);

  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  postForm: FormGroup = this.fb.group({
    title: ['', [Validators.required]],
    description: ['', [Validators.required]],
    category: ['', [Validators.required]],
    itemType: ['', [Validators.required]],
    location: ['', [Validators.required]],
    date: ['', [Validators.required]]
  });

  selectedFile: File | null = null;

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  inValid(field: string): boolean {
    const control = this.postForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  get f() {
    return this.postForm.controls;
  }

  onSubmit() {
    if (this.postForm.invalid) {
      this.postForm.markAllAsTouched();
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');

    const formData = new FormData();
    formData.append('title', this.postForm.get('title')?.value);
    formData.append('description', this.postForm.get('description')?.value);
    formData.append('category', this.postForm.get('category')?.value);
    formData.append('itemType', this.postForm.get('itemType')?.value);
    formData.append('location', this.postForm.get('location')?.value);
    formData.append('date', this.postForm.get('date')?.value);

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.itemService.createItem(formData).subscribe({
      next: (res) => {
        this.successMessage.set('Post created successfully!');
        setTimeout(() => {
          this.router.navigate(['/my-items']);
        }, 1500);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Error creating post');
      }
    });
  }
}
