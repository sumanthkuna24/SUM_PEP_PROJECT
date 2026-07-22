import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClaimService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5000/api/claims';

  sendClaim(itemId: string, message?: string): Observable<any> {
    return this.http.post(this.apiUrl, { itemId, message });
  }

  getReceivedClaims(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/received`);
  }

  getSentClaims(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/sent`);
  }

  updateClaimStatus(id: string, status: 'Approved' | 'Rejected'): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, { status });
  }
}
