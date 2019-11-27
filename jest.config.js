module.exports = {
  testEnvironment: 'node',

  expand: true,

  collectCoverageFrom: [
    'src/**/*.js'
  ],

  transform: {
    '^.+\\.js$': 'babel-jest'
  },

  moduleFileExtensions: [
    'ts',
    'js',
    'json'
  ]
}
