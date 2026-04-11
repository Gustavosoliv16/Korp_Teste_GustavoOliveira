import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
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

  criarNota(dto: CreateNotaFiscalDto): Observable<NotaFiscal> {
    return this.http.post<NotaFiscal>(this.baseUrl, dto).pipe(
      catchError(this.handleError)
    );
  }

  imprimirNota(id: number): Observable<{ message: string; nota: NotaFiscal }> {
    return this.http.post<{ message: string; nota: NotaFiscal }>(
      `${this.baseUrl}/${id}/imprimir`,
      {}
    ).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    return throwError(() => error);
  }
}
