import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WidgetExport, WidgetApiRequest } from '../models/widget-export.models';

@Injectable({
  providedIn: 'root'
})
export class WidgetApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/widgets';
  private readonly publicUrl = '/api/public/widgets';

  // Widget management endpoints
  createWidget(request: WidgetApiRequest): Observable<WidgetExport> {
    return this.http.post<WidgetExport>(`${this.baseUrl}/create`, request);
  }

  getAllWidgets(): Observable<WidgetExport[]> {
    return this.http.get<WidgetExport[]>(`${this.baseUrl}`);
  }

  getWidget(widgetId: string): Observable<WidgetExport> {
    return this.http.get<WidgetExport>(`${this.baseUrl}/${widgetId}`);
  }

  updateWidget(widgetId: string, request: Partial<WidgetApiRequest>): Observable<WidgetExport> {
    return this.http.put<WidgetExport>(`${this.baseUrl}/${widgetId}`, request);
  }

  deleteWidget(widgetId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${widgetId}`);
  }

  togglePublic(widgetId: string): Observable<WidgetExport> {
    return this.http.put<WidgetExport>(`${this.baseUrl}/${widgetId}/toggle-public`, {});
  }

  toggleActive(widgetId: string): Observable<WidgetExport> {
    return this.http.put<WidgetExport>(`${this.baseUrl}/${widgetId}/toggle-active`, {});
  }

  searchWidgets(query: string): Observable<WidgetExport[]> {
    return this.http.get<WidgetExport[]>(`${this.baseUrl}/search?q=${encodeURIComponent(query)}`);
  }

  getWidgetsByApplication(applicationId: string): Observable<WidgetExport[]> {
    return this.http.get<WidgetExport[]>(`${this.baseUrl}/application/${applicationId}`);
  }

  // Public endpoints for embed
  getPublicWidget(widgetId: string): Observable<any> {
    return this.http.get<any>(`${this.publicUrl}/${widgetId}`);
  }

  getWidgetEmbedHtml(widgetId: string): Observable<string> {
    return this.http.get(`${this.publicUrl}/${widgetId}/embed`, { responseType: 'text' });
  }

  getWidgetConfig(widgetId: string): Observable<any> {
    return this.http.get<any>(`${this.publicUrl}/${widgetId}/config`);
  }

  getWidgetEmbedCode(widgetId: string): Observable<string> {
    return this.http.get(`${this.publicUrl}/${widgetId}/embed-code`, { responseType: 'text' });
  }
}
