const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ReplyTableTestHelper = require('../../../../tests/ReplyTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/Replies endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await ReplyTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when POST /replies', () => {
    it('should response 201 and new Reply', async () => {
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

      const requestPayload = {
        content: 'sebuah Balasai untuk komentar A',
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-123/replies',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply).toBeDefined();
    });

    it('should response 401 if create reply with no authentication', async () => {
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

      const requestPayload = {
        content: 'sebuah Balasai untuk komentar A',
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-123/replies',
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 400 if reply payload not contain needed property', async () => {
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
        method: 'POST',
        url: '/threads/thread-123/comments/comment-123/replies',
        payload: {},
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat balasan baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 if create reply payload wrong data type', async () => {
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

      const requestPayload = {
        content: 123456,
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-123/replies',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat balasan karena tipe data tidak sesuai');
    });

    it('should response 404 if create reply with not found thread id', async () => {
      // Arrange
      const accessToken = await ServerTestHelper.getAccessToken();

      const server = await createServer(container);

      const requestPayload = {
        content: 'sebuah balasan terbaru',
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/xxx/comments/comment-123/replies',
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

    it('should response 404 if create reply with not found comment id', async () => {
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
        content: 'sebuah balasan terbaru',
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/xxx/replies',
        payload: requestPayload,
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
      const replyPayload = {
        id: 'reply-123',
        threadId: 'thread-123',
        commentId: 'comment-123',
        content: 'Ini adalah sebuah balasai dari komentar A',
        userId: 'user-123',
      };
      const accessToken = await ServerTestHelper.getAccessToken();
      await ThreadsTableTestHelper.addThread(threadPayload);
      await CommentsTableTestHelper.addComment(commentPayload);
      await ReplyTableTestHelper.addReply(replyPayload);

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
      expect(responseJson.data.thread.comments[0].replies).toBeDefined();
      expect(responseJson.data.thread.comments[0].replies[0].content).toEqual(replyPayload.content);
    });

    it('should response 401 if delete reply with no authentication', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123/replies/reply-123',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 if delete reply with not found thread id', async () => {
      // Arrange
      const accessToken = await ServerTestHelper.getAccessToken();

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/xxx/comments/comment-123/replies/reply-123',
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
      const replyPayload = {
        id: 'reply-123',
        threadId: 'thread-123',
        commentId: 'comment-123',
        content: 'Ini adalah sebuah balasai dari komentar A',
        userId: 'user-123',
      };
      const accessToken = await ServerTestHelper.getAccessToken();
      await ThreadsTableTestHelper.addThread(threadPayload);
      await CommentsTableTestHelper.addComment(commentPayload);
      await ReplyTableTestHelper.addReply(replyPayload);

      const accessTokenUser2 = await ServerTestHelper.getAccessTokenUser2();

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123/replies/reply-123',
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
      const replyPayload = {
        id: 'reply-123',
        threadId: 'thread-123',
        commentId: 'comment-123',
        content: 'Ini adalah sebuah balasai dari komentar A',
        userId: 'user-123',
      };
      const accessToken = await ServerTestHelper.getAccessToken();
      await ThreadsTableTestHelper.addThread(threadPayload);
      await CommentsTableTestHelper.addComment(commentPayload);
      await ReplyTableTestHelper.addReply(replyPayload);

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123/replies/reply-123',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.message).toEqual('Balasan berhasil dihapus');
    });
  });
});
