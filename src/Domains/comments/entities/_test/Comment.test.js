const Reply = require('../../../replies/entities/Reply');
const Thread = require('../../../threads/entities/Thread');
const Comment = require('../Comment');

describe('Comment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'dicoding',
      date: '2021-08-08T07:59:57.000Z',
      content: 'sebuah comment',
    };

    // Action and Assert
    expect(() => new Comment(payload)).toThrowError('COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'dicoding',
      date: '2021-08-08T07:59:57.000Z',
      content: 'sebuah comment',
      isDelete: 'false',
    };

    // Action and Assert
    expect(() => new Comment(payload)).toThrowError('COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create comment object correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'dicoding',
      date: '2021-08-08T07:59:57.000Z',
      content: 'sebuah comment',
      isDelete: false,
    };

    // Action
    const comment = new Comment(payload);

    // Assert
    expect(comment.id).toEqual(payload.id);
    expect(comment.username).toEqual(payload.username);
    expect(comment.date).toEqual(payload.date);
    expect(comment.content).toEqual(payload.content);
  });

  it('should create deleted comment object correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'dicoding',
      date: '2021-08-08T07:59:57.000Z',
      content: 'sebuah comment',
      isDelete: true,
    };

    // Action
    const comment = new Comment(payload);

    // Assert
    expect(comment.id).toEqual(payload.id);
    expect(comment.username).toEqual(payload.username);
    expect(comment.date).toEqual(payload.date);
    expect(comment.content).toEqual('**komentar telah dihapus**');
  });

  it('should throw error when reply not contain array', () => {
    // Arrange
    const commentPayload = {
      id: 'comment-123',
      username: 'dicoding',
      date: '2021-08-08T07:59:57.000Z',
      content: 'sebuah comment',
      isDelete: false,
    };

    // Action
    const comment = new Comment(commentPayload);
    // Action and Assert
    expect(() => comment.setReplies({})).toThrowError('COMMENT.REPLY_NOT_ARRAY');
  });

  it('should throw error when replies not contain Reply object', () => {
    // Arrange
    const commentPayload = {
      id: 'comment-123',
      username: 'dicoding',
      date: '2021-08-08T07:59:57.000Z',
      content: 'sebuah comment',
      isDelete: true,
    };

    // Action
    const comment = new Comment(commentPayload);

    // Action and Assert
    expect(() => comment.setReplies([{}])).toThrowError('COMMENT.REPLAIS_CONTAINS_INVALID_MEMBER');
  });

  it('should set replies correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'dummy title',
      body: 'dummy body',
      date: '2021-08-08T07:59:18.807Z',
      username: 'dicoding',
    };

    const thread = new Thread(payload);

    const commentPayload = {
      id: 'comment-123',
      username: 'dicoding',
      date: '2021-08-08T07:59:57.000Z',
      content: 'sebuah comment',
      isDelete: true,
    };

    const replyPayload = {
      id: 'reply-123',
      username: 'dicoding',
      date: '2021-08-08T07:59:57.000Z',
      content: 'sebuah balasan',
      isDelete: true,
    };

    // Action
    const comment = new Comment(commentPayload);
    const reply = new Reply(replyPayload);
    comment.setReplies([reply]);
    thread.setComments([comment]);

    // Assert
    expect(thread.comments[0].replies).toEqual([reply]);
  });
});
