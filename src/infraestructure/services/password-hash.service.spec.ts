import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';

import { PasswordHashService } from './password-hash.service';

describe('PasswordHashService', () => {
  let service: PasswordHashService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PasswordHashService],
    }).compile();

    service = module.get<PasswordHashService>(PasswordHashService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should hash the password correctly', () => {
    const password = 'securePassword123';
    const hash = service.hash(password);

    expect(hash).toBeDefined();
    expect(hash).not.toBe(password);
    expect(bcrypt.compareSync(password, hash)).toBe(true);
  });

  it('should correctly compare a password with its hash', () => {
    const password = 'securePassword123';
    const hash = bcrypt.hashSync(password, 10);

    expect(service.compare(password, hash)).toBe(true);
    expect(service.compare('wrongPassword', hash)).toBe(false);
  });
});
