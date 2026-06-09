/**
 * Service responsible for handling user registration, login, and profile retrieval.
 * This service interacts with the backend API to manage user authentication and authorization.
 * It includes methods for registering new users, logging in existing users, and fetching the current user's profile.
 *
 * @see LoginModel
 * @see AuthMeModel
 * @see HttpClient
 */

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AuthMeModel } from '../models/auth-me.model';
import { LoginModel } from '../models/login.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  /**
   * Constructs a new UserService with the injected HttpClient.
   * @param httpClient - The HttpClient used to make HTTP requests to the backend API.
   */
  constructor(private httpClient: HttpClient) { }

  /**
   * Registers a new user.
   * Sends a POST request to the `/api/register` endpoint with the user's registration data.
   *
   * @param user - The {@link LoginModel} containing the user's email and password.
   * @returns An {@link Observable} of type `Object` representing the registration response.
   */
  register(user: LoginModel): Observable<Object> {
    return this.httpClient.post('/api/register', user);
  }
  
  /**
   * Logs in an existing user.
   * Sends a POST request to the `/api/login` endpoint with the user's login data.
   *
   * @param user - The {@link LoginModel} containing the user's email and password.
   * @returns An {@link Observable} of type `{ message: string }` representing the login response.
   */
  login(user: LoginModel): Observable<{ message: string }> {
    return this.httpClient.post<{ message: string }>('/api/login', user);
  }

  /**
   * Retrieves the profile of the currently authenticated user.
   * Sends a GET request to the `/api/auth/me` endpoint to fetch the user's profile.
   *
   * @returns An {@link Observable} of type {@link AuthMeModel} representing the user's profile.
   */
  me(): Observable<AuthMeModel> {
    return this.httpClient.get<AuthMeModel>('/api/auth/me');
  }
  
}
