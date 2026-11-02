const { handleRequest } = require('../src/server');

module.exports = async (req, res) => {
  return handleRequest(req, res);
};

