/**
 * Represents the authentication status of a user.
 * This interface is used to track whether a user is authenticated and their email (if available).
 */
export interface AuthMeModel {
  /**
   * Indicates if the user is authenticated.
   */
  authenticated: boolean;
  /**
   * The email of the user. Can be `null` if the user is not authenticated.
   */
  email: string | null;
}