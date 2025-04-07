import { VerifyTokenUseCase } from '../use-cases/verify-token.use-case';
import { IJwtApplicationService } from '../service/jwt.service';
import { TokenApplicationDto, UserApplicationDto } from '../dto';
import { UseCaseException } from '../exceptions/use-case.exception';

describe('VerifyTokenUseCase', () => {
  let verifyTokenUseCase: VerifyTokenUseCase;
  let mockJwtService: jest.Mocked<IJwtApplicationService>;

  beforeEach(() => {
    mockJwtService = {
      verifyToken: jest.fn(),
      generateToken: jest.fn(),
    } as jest.Mocked<IJwtApplicationService>;

    verifyTokenUseCase = new VerifyTokenUseCase(mockJwtService);
  });

  it('should verify a valid token and return user data with a new token', async () => {
    const mockToken = 'valid-token';
    const mockUser: Omit<UserApplicationDto, 'password'> = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
    };

    mockJwtService.verifyToken.mockResolvedValue({
      user: mockUser,
      token: mockToken,
    });

    mockJwtService.generateToken.mockReturnValue('new-token');

    const tokenApplicationDto: TokenApplicationDto = { token: mockToken };
    const result = await verifyTokenUseCase.execute(tokenApplicationDto);

    expect(mockJwtService.verifyToken).toHaveBeenCalledWith(mockToken);
    expect(result).toEqual({ user: mockUser });
  });

  it('should throw UseCaseException for an invalid token', async () => {
    const invalidToken = 'invalid.token.here';
    const tokenApplicationDto: TokenApplicationDto = { token: invalidToken };

    mockJwtService.verifyToken.mockRejectedValue(new Error('Invalid token'));

    await expect(
      verifyTokenUseCase.execute(tokenApplicationDto),
    ).rejects.toThrow(Error);

    expect(mockJwtService.verifyToken).toHaveBeenCalledWith(invalidToken);
  });
});
