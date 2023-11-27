const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/comments endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when POST /comments', () => {
    it('should response 201 and new Comment', async () => {
      // Arrange
      const threadPayload = {
        id: 'thread-123',
        title: 'Thread A',
        body: 'Ini adalah sebuah body dari Thread A',
        owner: 'user-123',
      };
      const accessToken = await ServerTestHelper.getAccessToken();
      await ThreadsTableTestHelper.addThread(threadPayload);

      const requestPayload = {
        content: 'sebuah Comment A',
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
    });

    it('should response 401 if create comments with no authentication', async () => {
      // Arrange
      const threadPayload = {
        id: 'thread-123',
        title: 'Thread A',
        body: 'Ini adalah sebuah body dari Thread A',
        owner: 'user-123',
      };
      const accessToken = await ServerTestHelper.getAccessToken();
      await ThreadsTableTestHelper.addThread(threadPayload);

      const requestPayload = {
        content: 'sebuah Comment A',
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 400 if comment payload not contain needed property', async () => {
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
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: {},
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat komentar baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 if create comment payload wrong data type', async () => {
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

      const requestPayload = {
        content: 123456,
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat komentar baru karena tipe data tidak sesuai');
    });

    it('should response 404 if create comment with not found thread id', async () => {
      // Arrange
      const accessToken = await ServerTestHelper.getAccessToken();

      const server = await createServer(container);

      const requestPayload = {
        content: 'sebuah komentar terbaru',
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/xxx/comments',
        payload: requestPayload,
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

    it('should response 200 and get detail comment from threads detail', async () => {
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
        method: 'GET',
        url: '/threads/thread-123',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.comments).toBeDefined();
      expect(responseJson.data.thread.comments[0].content).toEqual(commentPayload.content);
    });

    it('should response 401 if delete comments with no authentication', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comments-123',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 if delete comment with not found thread id', async () => {
      // Arrange
      const accessToken = await ServerTestHelper.getAccessToken();

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/xxx/comments/xxx',
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

    it('should response 403 if delete comment with using other user', async () => {
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

      const accessTokenUser2 = await ServerTestHelper.getAccessTokenUser2();

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123',
        headers: {
          Authorization: `Bearer ${accessTokenUser2}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Anda tidak memiliki akses');
    });

    it('should response 200 if delete comment with correct user', async () => {
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
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.message).toEqual('Komentar berhasil dihapus');
    });
  });
});
