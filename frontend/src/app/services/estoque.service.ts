import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Produto, CreateProdutoDto } from '../models/models';

@Injectable({ providedIn: 'root' })
export class EstoqueService {
  private readonly baseUrl = 'http://localhost:5153/api/produtos';

  constructor(private http: HttpClient) {}

  getProdutos(): Observable<Produto[]> {
    return this.http.get<Produto[]>(this.baseUrl).pipe(
      catchError(this.handleError)
    );
  }

  getProduto(id: number): Observable<Produto> {
    return this.http.get<Produto>(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createProduto(dto: CreateProdutoDto): Observable<Produto> {
    return this.http.post<Produto>(this.baseUrl, dto).pipe(
      catchError(this.handleError)
    );
  }

  deleteProduto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  updateProduto(id: number, dto: CreateProdutoDto): Observable<Produto> {
    return this.http.put<Produto>(`${this.baseUrl}/${id}`, dto).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    return throwError(() => error);
  }
}
