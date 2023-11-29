const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikeTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/Likes endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when PUT /likes', () => {
    it('should response 200 and Like Comment', async () => {
      // Arrange
      const threadPayload = {
        id: 'thread-123',
        title: 'Thread A',
        body: 'Ini adalah sebuah body dari Thread A',
        owner: 'user-123',
      };
      const commentPayload = {
        id: 'comment-123',
        threadId: 'thread-123',
        content: 'Ini adalah sebuah komentar Thread A',
        userId: 'user-123',
      };
      const accessToken = await ServerTestHelper.getAccessToken();
      await ThreadsTableTestHelper.addThread(threadPayload);
      await CommentsTableTestHelper.addComment(commentPayload);

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: '/threads/thread-123/comments/comment-123/likes',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 401 if like comment with no authentication', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: '/threads/thread-123/comments/comment-123/likes',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 if Like comment with not found thread id', async () => {
      // Arrange
      const accessToken = await ServerTestHelper.getAccessToken();

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: '/threads/xxx/comments/comment-123/likes',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Thread tidak ditemukan');
    });

    it('should response 404 if like comment with not found comment id', async () => {
      // Arrange
      const threadPayload = {
        id: 'thread-123',
        title: 'Thread A',
        body: 'Ini adalah sebuah body dari Thread A',
        owner: 'user-123',
      };
      const accessToken = await ServerTestHelper.getAccessToken();
      await ThreadsTableTestHelper.addThread(threadPayload);

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: '/threads/thread-123/comments/xxx/likes',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Komentar tidak ditemukan');
    });

    it('should response 200 and like count comment from threads detail', async () => {
      // Arrange
      const threadPayload = {
        id: 'thread-123',
        title: 'Thread A',
        body: 'Ini adalah sebuah body dari Thread A',
        owner: 'user-123',
      };
      const commentPayload = {
        id: 'comment-123',
        threadId: 'thread-123',
        content: 'Ini adalah sebuah komentar Thread A',
        userId: 'user-123',
      };
      const accessToken = await ServerTestHelper.getAccessToken();
      await ThreadsTableTestHelper.addThread(threadPayload);
      await CommentsTableTestHelper.addComment(commentPayload);
      await LikesTableTestHelper.likeComment({ id: 'comment_like-123' });

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/threads/thread-123',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.comments).toBeDefined();
      expect(responseJson.data.thread.comments[0].likeCount).toBeDefined();
      expect(responseJson.data.thread.comments[0].likeCount).toEqual(1);
    });
  });
});
