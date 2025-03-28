module.exports = async () => {
  process.env.JEST_TEST_PATH = process.argv[process.argv.length - 1];
}; 