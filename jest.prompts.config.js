module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/prompts/**/*.test.ts'],
  collectCoverageFrom: [
    'src/prompts/**/*.ts',
    '!src/prompts/**/*.d.ts',
    '!src/prompts/**/*.test.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  globals: {
    'ts-jest': {
      isolatedModules: true
    }
  }
};
