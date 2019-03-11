const { githubGetOrCreate } = require('../user.statics');

const UserMock = {
  findOne: jest.fn(),
  create: jest.fn(),
};

const consoleErrorSpy = jest.spyOn(global.console, 'error');

describe('User static methods', () => {
  describe('githubGetOrCreate: finds or creates a User through Github data', () => {
    afterEach(() => jest.clearAllMocks());

    test('error during creation: returns null and logs error', async () => {
      const error = 'an error';
      const User = { ...UserMock, githubGetOrCreate };
      User.create.mockImplementationOnce(() => { throw error });

      let output;
      try {
        output = await User.githubGetOrCreate({});
      } catch(error) {
        expect(consoleErrorSpy).toBeCalledWith(error);
      } finally {
        expect(output).toBeNull();
      }
    });

    test('existing user: updates and returns user', async () => {
      const user = { update: jest.fn() };
      const User = { ...UserMock, githubGetOrCreate };
      User.findOne.mockImplementationOnce(() => user);

      const output = await User.githubGetOrCreate({});
      expect(output).toBe(user);
      expect(user.update).toBeCalled();
    });

    test('new user: creates and returns user', async () => {
      const user = {};
      const User = { ...UserMock, githubGetOrCreate };
      User.findOne.mockImplementationOnce(() => null);
      User.create.mockImplementationOnce(() => user);

      const output = await User.githubGetOrCreate({});
      expect(output).toBe(user);
    });
  });
});
