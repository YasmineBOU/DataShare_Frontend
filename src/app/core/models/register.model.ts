/**
 * Represents the data required for user registration.
 * This interface includes the email, password, and password confirmation.
 */
export interface RegisterModel {
  /**
   * The email of the user.
   */
  email: string;
  
  /**
   * The password chosen by the user.
   */
  password: string;
  
  /**
   * The confirmation of the password (must match the password field).
   */
  confirmPassword: string;
}