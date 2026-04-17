import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotaFiscal, CreateNotaFiscalDto } from '../models/models';

@Injectable({ providedIn: 'root' })
export class FaturamentoService {
  private readonly baseUrl = 'http://localhost:5285/api/notasfiscais';

  constructor(private http: HttpClient) {}

  getNotas(): Observable<NotaFiscal[]> {
    return this.http.get<NotaFiscal[]>(this.baseUrl).pipe(
      catchError(this.handleError)
    );
  }

  getNota(id: number): Observable<NotaFiscal> {
    return this.http.get<NotaFiscal>(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  criarNota(dto: CreateNotaFiscalDto): Observable<NotaFiscal> {
    return this.http.post<NotaFiscal>(this.baseUrl, dto).pipe(
      catchError(this.handleError)
    );
  }

  atualizarNota(id: number, dto: CreateNotaFiscalDto): Observable<NotaFiscal> {
    return this.http.put<NotaFiscal>(`${this.baseUrl}/${id}`, dto).pipe(
      catchError(this.handleError)
    );
  }

  imprimirNota(id: number, idempotencyKey?: string): Observable<{ message: string; nota: NotaFiscal }> {
    let headers = new HttpHeaders();
    if (idempotencyKey) {
      headers = headers.set('X-Idempotency-Key', idempotencyKey);
    }

    return this.http.post<{ message: string; nota: NotaFiscal }>(
      `${this.baseUrl}/${id}/imprimir`,
      {},
      { headers }
    ).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    return throwError(() => error);
  }
}
