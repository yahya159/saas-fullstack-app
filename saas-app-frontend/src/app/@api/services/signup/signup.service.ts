import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { UserSignUPDTO } from 'src/app/@shared/signup/dto/user-signup.dto';
import { SIGNUP_API_PATHS } from '../../api-paths/signup-api-paths';
import { environment } from '../../../../environments/environment';

export interface SignupResponse {
  success: boolean;
  message: string;
  userId?: string;
}

export interface ApiError {
  message: string;
  code: string;
  details?: any;
}

@Injectable({ providedIn: 'root' })
export class SignupService {
  private httpClient = inject(HttpClient);

  signup(userSignUpDTO: UserSignUPDTO): Observable<SignupResponse> {
    const headers = this.createHeaders();

    return this.httpClient.post<SignupResponse>(
      `${environment.apiUrl}${SIGNUP_API_PATHS.SIGNUP}`,
      userSignUpDTO,
      { headers }
    ).pipe(
      retry(2), // Retry failed requests up to 2 times
      catchError(this.handleError)
    );
  }

  private createHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'client-id': environment.clientId,
      'realmId': environment.realmId,
      'X-Requested-With': 'XMLHttpRequest'
    });
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unexpected error occurred';
    let errorCode = 'UNKNOWN_ERROR';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
      errorCode = 'CLIENT_ERROR';
    } else {
      // Server-side error
      errorCode = error.error?.code || `HTTP_${error.status}`;
      errorMessage = error.error?.message || `Server Error: ${error.status} - ${error.statusText}`;
    }

    const apiError: ApiError = {
      message: errorMessage,
      code: errorCode,
      details: error.error
    };

    console.error('Signup API Error:', apiError);
    return throwError(() => apiError);
  }
}
