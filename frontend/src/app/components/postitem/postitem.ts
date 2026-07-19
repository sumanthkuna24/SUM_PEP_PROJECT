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

    this.itemService.createItem(this.postForm.value).subscribe({
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
