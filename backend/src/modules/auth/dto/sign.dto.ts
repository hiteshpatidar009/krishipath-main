export interface SignDto {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
  acceptedTerms: boolean;
  phone?: string;
  captchaToken?: string;
  captchaCode?: string;
}
