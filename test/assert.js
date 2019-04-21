const ampify = require("../");

module.exports.equals = async (input, output, options) => {
  const processed = await ampify(input, options);
  expect(processed).toBe(output);
};

module.exports.includes = async (input, output, options) => {
  const processed = await ampify(input, options);
  expect(processed).toEqual(expect.stringContaining(output));
};

