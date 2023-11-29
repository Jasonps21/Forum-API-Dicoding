const LikesHandler = require('./handler');
const routes = require('./routes');

const likes = {
  name: 'likes',
  register: async (server, { container }) => {
    const handler = new LikesHandler(container);
    server.route(routes(handler));
  },
};

module.exports = likes;
