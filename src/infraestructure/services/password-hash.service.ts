import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { IPasswordHashDomainService } from 'src/domain/services/password-hash.service';

@Injectable()
export class PasswordHashService implements IPasswordHashDomainService {
  hash(password: string): string {
    return bcrypt.hashSync(password, 10);
  }
  compare(password: string, hash: string): boolean {
    return bcrypt.compareSync(password, hash);
  }
}
