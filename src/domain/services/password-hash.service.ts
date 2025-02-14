export interface IPasswordHashDomainService {
  hash(password: string): string;
  compare(password: string, hash: string): boolean;
}
