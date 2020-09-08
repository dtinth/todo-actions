module.exports = {
  clearMocks: true,
  moduleFileExtensions: ['js', 'ts'],
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  verbose: true
}

// module.exports = {
//   moduleFileExtensions: ['ts', 'tsx', 'js'],
//   transform: {
//     '^.+\\.tsx?$': 'ts-jest',
//   },
//   testMatch: ['**/src/**/*.test.+(ts|tsx|js)'],
// }
