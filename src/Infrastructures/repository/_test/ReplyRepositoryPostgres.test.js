const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ReplyTableTestHelper = require('../../../../tests/ReplyTableTestHelper');
const pool = require('../../database/postgres/pool');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const NewReply = require('../../../Domains/replies/entities/NewReply');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('ReplyRepositoryPostgres', () => {
  afterEach(async () => {
    await ReplyTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addReply function', () => {
    it('should persist new Reply and return added reply correctly', async () => {
      // Arrange
      const newReply = new NewReply({
        content: 'this is new comment',
        owner: 'user-123',
        threadId: 'thread-123',
        commentId: 'comment-123',
      });
      const fakeIdGenerator = () => '123';
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedReply = await replyRepositoryPostgres.addReply(newReply);

      // Assert
      expect(addedReply.id).toEqual('reply-123');
      expect(addedReply.content).toEqual(newReply.content);
      expect(addedReply.owner).toEqual(newReply.owner);

      const foundReply = await ReplyTableTestHelper.findReplyById('reply-123');
      expect(foundReply.id).toEqual('reply-123');
      expect(foundReply.content).toEqual(newReply.content);
      expect(foundReply.owner).toEqual(newReply.owner);
      expect(foundReply.thread_id).toEqual(newReply.threadId);
      expect(foundReply.comment_id).toEqual(newReply.commentId);
      expect(foundReply.is_delete).toEqual(false);
      expect(foundReply.date).toBeDefined();
    });
  });

  describe('isReplyExist function', () => {
    it('should return true if Reply exists', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      await ReplyTableTestHelper.addReply({ id: 'reply-123' });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.isReplyExist('reply-123')).resolves.not.toThrowError(NotFoundError);
    });

    it('should return false if reply not exists', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.isReplyExist('reply-123')).rejects.toThrowError(NotFoundError);
    });
  });

  describe('isReplyOwner function', () => {
    it('should return true if user is reply owner', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      await ReplyTableTestHelper.addReply({ id: 'reply-123', userId: 'user-123' });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.isReplyOwner('reply-123', 'user-123')).resolves.not.toThrowError(AuthorizationError);
    });

    it('should return false if user is not reply owner', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      await ReplyTableTestHelper.addReply({ id: 'reply-123', owner: 'user-123' });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.isReplyOwner('reply-123', 'user-456')).rejects.toThrowError(AuthorizationError);
    });
  });

  describe('deleteReply', () => {
    it('should update is_delete to true', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      await ReplyTableTestHelper.addReply({ id: 'reply-123' });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      await replyRepositoryPostgres.deleteReply('reply-123');

      // Assert
      const foundReply = await ReplyTableTestHelper.findReplyById('reply-123');
      expect(foundReply.is_delete).toEqual(true);
    });
  });

  describe('getRepliesByCommentId', () => {
    it('should return replies correctly', async () => {
      const wait = (ms) => new Promise((resolve) => {
        setTimeout(resolve, ms);
      });

      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123' });
      await ReplyTableTestHelper.addReply({ id: 'reply-123', commentId: 'comment-123' });
      await wait(250);
      await ReplyTableTestHelper.addReply({ id: 'reply-456', commentId: 'comment-123' });
      await wait(250);
      await ReplyTableTestHelper.addReply({ id: 'reply-789', commentId: 'comment-123' });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      const replies = await replyRepositoryPostgres.getReplyByCommentThreadId('comment-123');

      // Assert
      expect(replies).toHaveLength(3);
      expect(replies[0].id).toEqual('reply-123');
      expect(replies[1].id).toEqual('reply-456');
      expect(replies[2].id).toEqual('reply-789');
    });
  });
});
