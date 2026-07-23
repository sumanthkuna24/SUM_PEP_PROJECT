import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ItemService } from '../../services/item.service';
import { ClaimService } from '../../services/claim.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  public authService = inject(AuthService);
  private itemService = inject(ItemService);
  private claimService = inject(ClaimService);

  loading = signal<boolean>(true);
  totalItems = signal<number>(0);
  openItems = signal<number>(0);
  handoverItems = signal<number>(0);
  resolvedItems = signal<number>(0);
  pendingClaims = signal<number>(0);

  ngOnInit() {
    this.fetchDashboardData();
  }

  fetchDashboardData() {
    this.loading.set(true);
    let completedRequests = 0;

    const checkComplete = () => {
      completedRequests++;
      if (completedRequests >= 2) {
        this.loading.set(false);
      }
    };

    // Fetch user items
    this.itemService.getMyItems().subscribe({
      next: (items) => {
        this.totalItems.set(items.length);
        this.openItems.set(items.filter(i => i.status === 'Open').length);
        this.handoverItems.set(items.filter(i => i.status === 'Awaiting Handover').length);
        this.resolvedItems.set(items.filter(i => i.status === 'Resolved').length);
        checkComplete();
      },
      error: () => checkComplete()
    });

    // Fetch received claims
    this.claimService.getReceivedClaims().subscribe({
      next: (claims) => {
        this.pendingClaims.set(claims.filter(c => c.status === 'Pending').length);
        checkComplete();
      },
      error: () => checkComplete()
    });
  }
}
