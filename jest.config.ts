import { Config } from 'jest';

const config: Config = {
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['src/**/*.(t|j)s'],
  coverageDirectory: './coverage',
  testTimeout: 30000,
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '\\.d\\.ts$',
    '\\.module\\.ts$',
  ],
};

export default config;
