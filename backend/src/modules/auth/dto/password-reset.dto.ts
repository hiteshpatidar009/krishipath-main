export interface PasswordResetStartDto {
  email: string;
}

export interface PasswordResetConfirmDto {
  token: string;
  password: string;
}

export interface PasswordResetValidateDto {
  token: string;
}
