const crypto = require('crypto');

const {
  generateState,
  setStateCookie,
} = require('../auth.utils');

jest.mock('crypto', () => ({ randomBytes: jest.fn() }));

describe('Auth utilities', () => {
  describe('generateState(): generates random state for CSRF protection in OAuth flow', () => {
    const toStringMock = jest.fn();
    crypto.randomBytes.mockImplementation(() => ({ toString: toStringMock }));
    
    generateState();

    test('calls crypto module randomBytes to generate 32 random bytes', () => {
      expect(crypto.randomBytes).toHaveBeenCalledWith(32);
    });

    test('calls toString on the random bytes to convert to a hex string', () => {
      expect(toStringMock).toHaveBeenCalledWith('hex');
    });
  });

  describe('setStateCookie(): sets a state verification cookie on the response object', () => {
    const state = 'some state';
    const resMock = { cookie: jest.fn() };

    // mock Date object for tests
    const globalDate = Date; // store for reset after tests
    
    const nowMock = jest.fn(() => 0);
    const dateMock = jest.fn(() => ({ now: nowMock }));
    global.Date = dateMock;
    global.Date.now = nowMock;

    setStateCookie(resMock, state);
    const [stateString, stateArg, cookieOptions] = resMock.cookie.mock.calls[0];

    // reset global Date
    afterAll(() => { global.Date = globalDate; });

    test('calls res.cookie() to create a "state"=state entry', () => {
      expect(stateString).toBe('state');
      expect(stateArg).toBe(state);
    });

    test('sets [signed, httpOnly, sameSite] flags', () => {
      ['signed', 'httpOnly', 'sameSite']
        .forEach(field => expect(cookieOptions[field]).toBe(true));
    });

    test('sets cookie path flag to [/auth/github/success] endpoint', () => {
      expect(cookieOptions.path).toBe('/auth/github/success');
    });

    test('sets expires flag to now + 10 minutes', () => {
      // nowMock returns 0, Date.now() -> 0
      expect(dateMock).toHaveBeenCalledWith(0 + (60 * 10 * 1000));
    });
  });
});
