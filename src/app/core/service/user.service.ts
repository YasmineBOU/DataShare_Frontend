import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { LoginModel } from '../models/login.model';
import { RegisterModel } from '../models/register.model';
import { AuthMeModel } from '../models/auth-me.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private httpClient: HttpClient) { }

  register(user: LoginModel): Observable<Object> {
    return this.httpClient.post('/api/register', user);
  }
  
  login(user: LoginModel): Observable<{ message: string }> {
    return this.httpClient.post<{ message: string }>('/api/login', user);
  }

  me(): Observable<AuthMeModel> {
    return this.httpClient.get<AuthMeModel>('/api/auth/me');
  }
  
}
