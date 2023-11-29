const CommentRepository = require('../../../Domains/comments/CommentRepository');
const LikeRepository = require('../../../Domains/likes/LikeRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const LikeDislikeCommentUseCase = require('../LikeDislikeCommentUseCase');

describe('LikeDislikeCommentUseCase', () => {
  it('should orchestrating unlike action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'comment-123',
      commentId: 'comment-123',
      owner: 'user-123',
    };
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    mockThreadRepository.isThreadExist = jest.fn(() => Promise.resolve());
    mockCommentRepository.isCommentExist = jest.fn(() => Promise.resolve());
    mockLikeRepository.isLikeCommentExist = jest.fn(() => Promise.resolve(true));
    mockLikeRepository.unlikeComment = jest.fn(() => Promise.resolve());

    const useCase = new LikeDislikeCommentUseCase({
      likeRepository: mockLikeRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const likeComment = await useCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.isThreadExist).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.isCommentExist).toBeCalledWith(
      useCasePayload.commentId,
    );
    expect(mockLikeRepository.isLikeCommentExist).toBeCalledWith(
      useCasePayload.commentId,
      useCasePayload.owner,
    );
    expect(mockLikeRepository.unlikeComment).toBeCalledWith(
      useCasePayload.commentId,
      useCasePayload.owner,
    );
    expect(mockLikeRepository.unlikeComment).toBeCalledTimes(1);
  });

  it('should orchestrating like action correctly', async () => {
    // Arrange
    const threadId = 'thread-123';
    const useCasePayload = {
      commentId: 'comment-123',
      owner: 'user-123',
    };
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    mockThreadRepository.isThreadExist = jest.fn(() => Promise.resolve());
    mockCommentRepository.isCommentExist = jest.fn(() => Promise.resolve());
    mockLikeRepository.isLikeCommentExist = jest.fn(() => Promise.resolve(false));
    mockLikeRepository.likeComment = jest.fn(() => Promise.resolve());

    const useCase = new LikeDislikeCommentUseCase({
      likeRepository: mockLikeRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await useCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.isThreadExist).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.isCommentExist).toBeCalledWith(
      useCasePayload.commentId,
    );
    expect(mockLikeRepository.isLikeCommentExist).toBeCalledWith(
      useCasePayload.commentId,
      useCasePayload.owner,
    );
    expect(mockLikeRepository.likeComment).toBeCalledWith(
      useCasePayload.commentId,
      useCasePayload.owner,
    );
    expect(mockLikeRepository.likeComment).toBeCalledTimes(1);
  });
});
