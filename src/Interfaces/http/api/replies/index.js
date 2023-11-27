const RepliesHandler = require('./handler');
const routes = require('./routes');

const replies = {
  name: 'replies',
  register: async (server, { container }) => {
    const handler = new RepliesHandler(container);
    server.route(routes(handler));
  },
};

module.exports = replies;
