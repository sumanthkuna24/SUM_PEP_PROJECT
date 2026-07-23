import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ClaimService } from '../../services/claim.service';
import { ItemService } from '../../services/item.service';

@Component({
  selector: 'app-claims',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './claims.html',
  styleUrl: './claims.css'
})
export class Claims implements OnInit {
  private claimService = inject(ClaimService);
  private itemService = inject(ItemService);

  activeTab = signal<'received' | 'sent'>('received');
  receivedClaims = signal<any[]>([]);
  sentClaims = signal<any[]>([]);
  loading = signal<boolean>(true);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');
  updatingClaimId = signal<string | null>(null);

  ngOnInit() {
    this.fetchAllClaims();
  }

  setTab(tab: 'received' | 'sent') {
    this.activeTab.set(tab);
  }

  fetchAllClaims() {
    this.loading.set(true);
    
    // Fetch received claims
    this.claimService.getReceivedClaims().subscribe({
      next: (received) => {
        this.receivedClaims.set(received);
        
        // Fetch sent claims
        this.claimService.getSentClaims().subscribe({
          next: (sent) => {
            this.sentClaims.set(sent);
            this.loading.set(false);
          },
          error: (err) => {
            this.errorMessage.set('Failed to load sent claims.');
            this.loading.set(false);
          }
        });
      },
      error: (err) => {
        this.errorMessage.set('Failed to load received claims.');
        this.loading.set(false);
      }
    });
  }

  updateClaimStatus(claimId: string, status: 'Approved' | 'Rejected') {
    this.updatingClaimId.set(claimId);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.claimService.updateClaimStatus(claimId, status).subscribe({
      next: (res) => {
        this.successMessage.set(`Claim request ${status.toLowerCase()} successfully!`);
        this.receivedClaims.update(prev =>
          prev.map(c => (c._id === claimId ? { ...c, status } : c))
        );
        this.updatingClaimId.set(null);
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Error updating claim status');
        this.updatingClaimId.set(null);
        setTimeout(() => this.errorMessage.set(''), 3000);
      }
    });
  }

  getImageUrl(path: string | null | undefined): string | null {
    return this.itemService.getImageUrl(path);
  }
}
