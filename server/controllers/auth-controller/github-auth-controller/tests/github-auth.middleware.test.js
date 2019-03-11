const axios = require('axios');
const jwt = require('jsonwebtoken');
const { getGithubPrimaryEmail } = require('../github-auth.utils');
const { getOrCreateChinguAccount } = require('../../../../db/db-utils');
const {
  verifyStates,
  getGithubAccessToken,
  getGithubUserData,
  getChinguAccountByGithub,
  signAuthToken,
} = require('../auth-middleware');

jest.mock('axios');
jest.mock('jsonwebtoken');

// already tested, can mock
jest.mock('../auth-utils.js', () => ({ getGithubPrimaryEmail: jest.fn() }));
jest.mock('../../../../db/db-utils', () => ({
  getOrCreateChinguAccount: jest.fn(),
}));

const nextMock = jest.fn();
const resMock = { sendStatus: jest.fn() };

describe('Auth Controller middleware', () => {
  describe('verifyStates(): verifies the qs and cookie states match', () => {
    afterAll(() => jest.clearAllMocks());

    test('states match: calls next()', () => {
      const state = 'matches';
      const reqMock = { signedCookies: { state }, query: { state } };

      verifyStates(reqMock, resMock, nextMock);
      expect(nextMock).toBeCalled();
    });

    test('states do not match: returns 401 response', () => {
      const reqMock = {
        signedCookies: { state: 'wrong' },
        query: { state: 'match' },
      };

      verifyStates(reqMock, resMock);
      expect(resMock.sendStatus).toBeCalledWith(401);
    });
  });

  describe('getGithubAccessToken(): exchanges the GitHub OAuth handshake "code" for a User access token', () => {
    const query = { code: 'code', state: 'state' };
    const env = {
      DOMAIN: 'domain',
      GITHUB_CLIENT_ID: 'clientID',
      GITHUB_CLIENT_SECRET: 'clientSecret',
    };
    const reqMock = { query, context: { env } };

    afterEach(() => jest.resetAllMocks());

    test('success: injects req.context.access_token and calls next()', async () => {
      const accessToken = 'token';
      axios.post.mockImplementation(() => ({
        data: { access_token: accessToken },
      }));

      await getGithubAccessToken(reqMock, resMock, nextMock);
      expect(reqMock.context.access_token).toBe(accessToken);
      expect(nextMock).toBeCalled();
    });

    test('GitHub API call failure: returns 401 response', async () => {
      axios.post.mockImplementation(() => {
        throw 'error';
      });

      await getGithubAccessToken(reqMock, resMock);
      expect(resMock.sendStatus).toBeCalledWith(401);

      jest.resetAllMocks();
    });
  });

  describe('getGithubUserData(): Authenticates the GitHub User by retrieving their data using their access token', () => {
    const accessToken = 'token';
    const reqMock = { context: { access_token: accessToken } };

    afterEach(() => jest.resetAllMocks());

    test('success: injects req.context.githubUserData and calls next()', async () => {
      const githubUserData = {
        username: 'the-vampiire',
        email: 'vampiirecodes@gmail.com',
      };

      getGithubPrimaryEmail.mockImplementation(() => githubUserData.email);
      axios.get.mockImplementation(() => ({ data: { login: 'the-vampiire' } }));

      await getGithubUserData(reqMock, resMock, nextMock);
      expect(reqMock.context.githubUserData).toEqual(githubUserData);
      expect(nextMock).toBeCalled();
    });

    test('GitHub API call failure: returns 401 response', async () => {
      axios.get.mockImplementation(() => ({ data: { login: 'the-vampiire' } }));

      await getGithubUserData(reqMock, resMock);
      expect(resMock.sendStatus).toBeCalledWith(401);
    });

    test('primary email not found: returns 401 response', async () => {
      getGithubPrimaryEmail.mockImplementation(() => null);
      axios.get.mockImplementation(() => ({ data: { login: 'the-vampiire' } }));

      await getGithubUserData(reqMock, resMock);
      expect(resMock.sendStatus).toBeCalledWith(401);
    });
  });

  describe('getChinguAccountByGithub(): Gets and injects the GitHub associated Chingu Account', () => {
    afterEach(() => jest.resetAllMocks());

    const reqMock = {
      context: {
        models: 'models',
        githubUserData: 'data',
        access_token: 'token',
      },
    };

    test('successful account lookup: injects newAccount flag and chinguAccount into context and calls next()', async () => {
      getOrCreateChinguAccount.mockImplementation(() => ({
        newAccount: true,
        chinguAccount: 'account',
      }));

      await getChinguAccountByGithub(reqMock, resMock, nextMock);
      expect(reqMock.context.newAccount).toBe(true);
      expect(reqMock.context.chinguAccount).toBe('account');
      expect(nextMock).toBeCalled();
    });

    test('account lookup failure: returns 500 response', async () => {
      getOrCreateChinguAccount.mockImplementation(() => {
        throw 'some error';
      });

      await getChinguAccountByGithub(reqMock, resMock);
      expect(resMock.sendStatus).toBeCalledWith(500);
    });
  });

  describe('signAuthToken(): signs and injects a Chingu Auth JWT', () => {
    const reqMock = { context: { chinguAccount: 'account', env: 'env' } };

    test('injects the signed JWT in req.context.authToken and calls next()', () => {
      signAuthToken(reqMock, resMock, nextMock);
      expect(reqMock.context.authToken).toBe(jwt.sign());
      expect(nextMock).toBeCalled();
    });
  });
});
