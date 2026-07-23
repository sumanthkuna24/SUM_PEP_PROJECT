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

  getOpenItems(filters?: { search?: string; category?: string; itemType?: string }): Observable<any[]> {
    let params = {};
    if (filters) {
      const cleanedFilters: any = {};
      if (filters.search) cleanedFilters.search = filters.search;
      if (filters.category) cleanedFilters.category = filters.category;
      if (filters.itemType) cleanedFilters.itemType = filters.itemType;
      params = cleanedFilters;
    }
    return this.http.get<any[]>(this.apiUrl, { params });
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

  getItemSuggestions(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/suggestions`);
  }

  resolveItem(id: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/resolve`, {});
  }

  getImageUrl(imagePath: string | null | undefined): string | null {
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `http://localhost:5000${cleanPath}`;
  }
}
