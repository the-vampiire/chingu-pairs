const authUtils = require('../../auth.utils');
const githubAuthUtils = require('../github-auth.utils');
const { loginViewHandler, successHandler } = require('../github-auth.handlers');


jest.mock('../../auth.utils.js');

const loginLink = 'login link';
jest.mock('../github-auth.utils.js');
githubAuthUtils.buildLoginLink.mockImplementation(() => loginLink);

const resMock = {
  render: jest.fn(),
  redirect: jest.fn(),
  cookie: jest.fn(),
};

describe('Auth Controller handlers', () => {
  describe('loginViewHandler(): renders the login view with a state cookie', () => {
    const reqMock = { context: { env: {} } };

    beforeAll(() => loginViewHandler(reqMock, resMock));
    afterAll(() => jest.resetAllMocks());

    test('sets state cookie on response', () => {
      expect(authUtils.setStateCookie).toBeCalledWith(
        resMock,
        authUtils.generateState()
      );
    });

    test('renders the auth view with loginLink param', () => {
      expect(resMock.render).toBeCalledWith('auth', { loginLink });
    });
  });

  describe('successHandler(): manages redirection and auth token transport', () => {
    const env = {
      CHINGU_REGISTRATION: 'chingu/register',
      CHINGU_HOME: 'chingu',
    };
    const context = { authToken: 'tokie', newAccount: true, env };
    const reqMock = { context };

    test('newAccount flag true: attaches auth token cookie and redirects to [env.CHINGU_REGISTRATION]', () => {
      successHandler(reqMock, resMock);
      expect(resMock.cookie).toBeCalledWith('token', context.authToken);
      expect(resMock.redirect).toBeCalledWith(env.CHINGU_REGISTRATION);
    });

    test('newAccount flag false: attaches auth token cookie and redirects to [env.CHINGU_HOME]', () => {
      const existingContext = { ...context, newAccount: false };

      successHandler({ context: existingContext }, resMock);
      expect(resMock.cookie).toBeCalledWith('token', context.authToken);
      expect(resMock.redirect).toBeCalledWith(env.CHINGU_HOME);
    });
  });
});
