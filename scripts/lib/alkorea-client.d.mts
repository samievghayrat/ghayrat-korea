export const AL_ORIGIN: string;
export class ALKoreaClient {
  constructor(username: string, password: string);
  login(): Promise<void>;
  catalogue(page?: number): Promise<string>;
  detail(id: string): Promise<string>;
}
export function readPrivateCredentials(): Promise<{ username: string; password: string }>;
