export interface EmailVerifyDto {
  email: string;
  challengeId: string;
  code: string;
}
