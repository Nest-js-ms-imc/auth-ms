import {
  SecretsManagerClient,
  GetSecretValueCommandOutput,
} from '@aws-sdk/client-secrets-manager';
import { Test, TestingModule } from '@nestjs/testing';

import { AwsSecretsService } from './aws-secrets.service';

jest.mock('@aws-sdk/client-secrets-manager', () => ({
  SecretsManagerClient: jest.fn().mockImplementation(() => ({
    send: jest.fn(),
  })),
  GetSecretValueCommand: jest.fn(),
}));

describe('AwsSecretsService', () => {
  let awsSecretsService: AwsSecretsService;
  let clientMock: jest.Mocked<SecretsManagerClient>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AwsSecretsService],
    }).compile();

    awsSecretsService = module.get<AwsSecretsService>(AwsSecretsService);
    clientMock = awsSecretsService[
      'client'
    ] as jest.Mocked<SecretsManagerClient>;

    (clientMock.send as jest.Mock).mockResolvedValue({
      SecretString: '{"DB_HOST":"localhost"}',
    } as GetSecretValueCommandOutput);
  });

  it('should be defined', () => {
    expect(awsSecretsService).toBeDefined();
  });

  it('should get a secret correctly', async () => {
    const mockSecret = { SecretString: '{"DB_HOST":"localhost"}' };
    (clientMock.send as jest.Mock).mockResolvedValue(mockSecret);

    const secret = await awsSecretsService.getSecret('test-secret');

    expect(clientMock.send).toHaveBeenCalledTimes(1);
    expect(secret).toBe(mockSecret.SecretString);
  });

  it('should handle an error in obtaining a secret', async () => {
    const errorMessage = 'Error en AWS';

    (clientMock.send as jest.Mock).mockRejectedValue(new Error(errorMessage));

    const loggerSpy = jest
      .spyOn(awsSecretsService['logger'], 'error')
      .mockImplementation();

    const secret = await awsSecretsService.getSecret('test-secret');

    expect(secret).toBe('ERROR');
    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining('Failed to retrieve secret "test-secret":'),
      expect.any(Error),
    );

    loggerSpy.mockRestore();
  });

  it('should run onModuleInit and get secrets', async () => {
    const mockSecret = { SecretString: '{"auth-secrets":"some-secret"}' };
    (clientMock.send as jest.Mock).mockResolvedValue(mockSecret);

    await awsSecretsService.onModuleInit();
  });

  it('should log a warning if the secret has no string value', async () => {
    const loggerSpy = jest
      .spyOn(awsSecretsService['logger'], 'warn')
      .mockImplementation();

    const mockSecret: GetSecretValueCommandOutput = {
      ARN: 'test-arn',
      Name: 'test-secret',
      SecretString: undefined,
      VersionId: 'test-version',
      $metadata: {
        httpStatusCode: 200,
        requestId: 'test-request-id',
        extendedRequestId: 'test-extended-request-id',
        cfId: 'test-cf-id',
        attempts: 1,
        totalRetryDelay: 0,
      },
    };

    (clientMock.send as jest.Mock).mockResolvedValue(mockSecret);

    const secret = await awsSecretsService.getSecret('test-secret');

    expect(secret).toBeUndefined();
    expect(loggerSpy).toHaveBeenCalledWith(
      'Secret "test-secret" has no string value',
    );

    loggerSpy.mockRestore();
  });
});
