// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // Możesz potrzebować dodatkowej konfiguracji, np. moduleNameMapper dla aliasów jak `@/services/prisma`
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1', // Dostosuj jeśli Twoja struktura jest inna
  },
};
