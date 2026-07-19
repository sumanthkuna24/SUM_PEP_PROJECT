import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5000/api/items';

  createItem(itemData: any): Observable<any> {
    return this.http.post(this.apiUrl, itemData);
  }

  getMyItems(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/my-items`);
  }

  getOpenItems(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getItemById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  updateItem(id: string, itemData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, itemData);
  }

  deleteItem(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
