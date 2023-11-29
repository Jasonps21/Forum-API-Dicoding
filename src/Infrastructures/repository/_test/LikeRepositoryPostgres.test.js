const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikeTableTestHelper');
const pool = require('../../database/postgres/pool');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const LikeRepositoryPostgres = require('../LikeRepositoryPostgres');

describe('ReplyRepositoryPostgres', () => {
  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('likeComment function', () => {
    it('should persist Like Comment and return message success', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      await likeRepositoryPostgres.likeComment('comment-123', 'user-123');

      // Assert
      const likes = await LikesTableTestHelper.findLikeByCommentIdAndOwner(
        'comment-123',
        'user-123',
      );
      expect(likes[0].id).toEqual('comment_like-123');
      expect(likes[0].comment_id).toEqual('comment-123');
      expect(likes[0].owner).toEqual('user-123');
    });
  });

  describe('unlikeComment function', () => {
    it('should persist Like Comment and return message success', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      await LikesTableTestHelper.likeComment({ id: 'comment_like-123' });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      await likeRepositoryPostgres.unlikeComment('comment-123', 'user-123');

      // Assert
      const likes = await LikesTableTestHelper.findLikeByCommentIdAndOwner(
        'comment-123',
        'user-123',
      );
      expect(likes).toHaveLength(0);
    });
  });

  describe('isLikeCommentExist function', () => {
    it('should return true if like exists', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      await LikesTableTestHelper.likeComment({
        id: 'comment_like-123',
        commentId: 'comment-123',
        userId: 'user-123',
      });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action & Assert
      const like = await likeRepositoryPostgres.isLikeCommentExist('comment-123', 'user-123');
      expect(like).toBe(true);
    });

    it('should return true if like not exists', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action & Assert
      const like = await likeRepositoryPostgres.isLikeCommentExist('comment-123', 'user-123');
      expect(like).toBe(false);
    });
  });

  describe('getTotalLikeComment', () => {
    it('should return the like for thread detail', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
      });
      await LikesTableTestHelper.likeComment({ id: 'comment_like-123' });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      const likes = await likeRepositoryPostgres.getTotalLikeComment(
        'comment-123',
      );

      // Assert
      expect(likes).toEqual(1);
    });
  });
});
