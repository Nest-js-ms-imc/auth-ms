import * as joi from 'joi';

jest.mock('dotenv/config');

describe('Environment Variables Validation', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = process.env;
    process.env = {
      PORT: '3000',
      JWT_SECRET: 'Jw7S3cr3tN357',
      DB_HOST: 'localhost',
      DB_NAME: 'AuthDB',
      DB_USERNAME: 'postgres',
      DB_PASSWORD: 'M1S3Cr37P4s5w0rd',
      DB_PORT: '5432',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should throw an error if an environment variable is missing', () => {
    delete process.env.PORT;

    const schema = joi
      .object({
        PORT: joi.number().required(),
        JWT_SECRET: joi.string().required(),
        DB_HOST: joi.string().required(),
        DB_NAME: joi.string().required(),
        DB_USERNAME: joi.string().required(),
        DB_PASSWORD: joi.string().required(),
        DB_PORT: joi.number().required(),
      })
      .unknown(true);

    const { error } = schema.validate(process.env);
    expect(error).toBeDefined();
  });
});
