import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ItemService } from '../../services/item.service';
import { ClaimService } from '../../services/claim.service';

@Component({
  selector: 'app-suggestions',
  standalone: true,
  imports: [RouterLink, DatePipe, FormsModule],
  templateUrl: './suggestions.html',
  styleUrl: './suggestions.css'
})
export class Suggestions implements OnInit {
  private route = inject(ActivatedRoute);
  private itemService = inject(ItemService);
  private claimService = inject(ClaimService);

  targetItem = signal<any | null>(null);
  suggestions = signal<any[]>([]);
  loading = signal<boolean>(true);
  errorMessage = signal<string>('');

  activeClaimItemId = signal<string | null>(null);
  claimMessageText: string = '';
  sentClaimIds = signal<Set<string>>(new Set());
  submittingClaimId = signal<string | null>(null);

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

  openClaimForm(itemId: string) {
    this.claimMessageText = '';
    this.activeClaimItemId.set(itemId);
  }

  closeClaimForm() {
    this.activeClaimItemId.set(null);
  }

  submitClaim(itemId: string) {
    this.submittingClaimId.set(itemId);
    this.claimService.sendClaim(itemId, this.claimMessageText).subscribe({
      next: (res) => {
        this.sentClaimIds.update(prev => new Set(prev).add(itemId));
        this.submittingClaimId.set(null);
        this.activeClaimItemId.set(null);
      },
      error: (err) => {
        alert(err.error?.message || 'Error submitting claim request');
        this.submittingClaimId.set(null);
      }
    });
  }

  getImageUrl(path: string | null | undefined): string | null {
    return this.itemService.getImageUrl(path);
  }
}
