import { LogOutUseCase } from './logout.use-case';
import { IUserRepository } from '../persistence/repositories/user.repository';
import { IUserModel } from '../persistence/models/user.model';
import { LogOutApplicationDto } from '../dto';

describe('LogOutUseCase', () => {
  let logOutUseCase: LogOutUseCase;
  let mockUserRepository: jest.Mocked<IUserRepository<IUserModel>>;

  beforeEach(() => {
    mockUserRepository = {
      logout: jest.fn().mockResolvedValue(true),
    } as unknown as jest.Mocked<IUserRepository<IUserModel>>;

    logOutUseCase = new LogOutUseCase(mockUserRepository);
  });

  it('should successfully log out a user', async () => {
    const logOutDto: LogOutApplicationDto = { token: 'valid-token' };

    const result = await logOutUseCase.execute(logOutDto);

    expect(result).toBe(true);
    expect(mockUserRepository.logout).toHaveBeenCalledWith('valid-token');
    expect(mockUserRepository.logout).toHaveBeenCalledTimes(1);
  });

  it('should return false if logout fails', async () => {
    mockUserRepository.logout.mockResolvedValue(false);
    const logOutDto: LogOutApplicationDto = { token: 'invalid-token' };

    const result = await logOutUseCase.execute(logOutDto);

    expect(result).toBe(false);
    expect(mockUserRepository.logout).toHaveBeenCalledWith('invalid-token');
    expect(mockUserRepository.logout).toHaveBeenCalledTimes(1);
  });

  it('should throw an error if repository throws', async () => {
    mockUserRepository.logout.mockRejectedValue(new Error('Database error'));
    const logOutDto: LogOutApplicationDto = { token: 'error-token' };

    await expect(logOutUseCase.execute(logOutDto)).rejects.toThrow(
      'Database error',
    );
    expect(mockUserRepository.logout).toHaveBeenCalledWith('error-token');
    expect(mockUserRepository.logout).toHaveBeenCalledTimes(1);
  });
});
