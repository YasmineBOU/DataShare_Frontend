/**
 * Represents the data required for user login.
 * This interface encapsulates the email and password provided by the user.
 */
export interface LoginModel {
  /**
   * The email of the user.
   */
  email: string;
  
  /**
   * The password of the user.
   */
  password: string;
}