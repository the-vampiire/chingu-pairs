const {
  buildGithubLoginLink,
  getGithubPrimaryEmail,
} = require('../github-auth.utils');

jest.mock('axios', () => ({ get: jest.fn() }));

describe('buildGithubLoginLink(): builds a URL for initiating GitHub OAuth flow', () => {
  const state = 'some state';
  const env = { DOMAIN: 'localhost', GITHUB_CLIENT_ID: 'clientID' };

  const loginLink = buildGithubLoginLink(state, env);

  test('begins with GitHub OAuth auth url [https://github.com/login/oauth/authorize]', () => {
    expect(
      /^https:\/\/github.com\/login\/oauth\/authorize/.test(loginLink)
    ).toBe(true);
  });

  test('appends ?client_id param using env.GITHUB_CLIENT_ID in qs', () => {
    const hasClientID = loginLink.includes(
      `?client_id=${env.GITHUB_CLIENT_ID}`
    );
    expect(hasClientID).toBe(true);
  });

  test('appends &redirect_uri [DOMAIN/auth/github/success] param using env.DOMAIN in qs', () => {
    const hasRedirectURI = loginLink.includes(
      `&redirect_uri=${env.DOMAIN}/auth/github/success`
    );
    expect(hasRedirectURI).toBe(true);
  });

  test('appends &state param using state arg in qs', () => {
    const hasState = loginLink.includes(`&state=${state}`);
    expect(hasState).toBe(true);
  });

  test('throws error if DOMAIN or GITHUB_CLIENT_ID env vars are undefined', () => {
    try {
      buildGithubLoginLink(state, {});
    } catch (error) {
      expect(error.message).toBe(
        'Requires DOMAIN and GITHUB_CLIENT_ID env vars'
      );
    }
  });
});

describe("getGithubPrimaryEmail(): gets the GitHub User's primary email address", () => {
  const accessToken = 'token';
  const primaryEmail = 'vampiirecodes@gmail.com';
  const emails = [
    {
      email: 'pcleary@mail.usf.edu',
      primary: false,
      verified: true,
      visibility: null,
    },
    {
      email: '25523682+the-vampiire@users.noreply.github.com',
      primary: false,
      verified: true,
      visibility: null,
    },
    {
      email: 'vampiirecodes@gmail.com',
      primary: true,
      verified: true,
      visibility: 'private',
    },
  ];

  describe('successful path', () => {
    axios.get.mockImplementationOnce(() => ({ data: emails }));

    let result;
    beforeAll(async () => {
      result = await getGithubPrimaryEmail(accessToken);
    });

    test('calls the GitHub API /user/emails endpoint with access token auth header', () => {
      expect(axios.get).toHaveBeenCalledWith(
        'https://api.github.com/user/emails',
        {
          headers: { authorization: `Bearer ${accessToken}` },
        }
      );
    });

    test('returns the primary email address', () => {
      expect(result).toBe(primaryEmail);
    });
  });

  test('API call failure: returns null', async () => {
    axios.get.mockImplementationOnce(() => {
      throw 'error';
    });
    const result = await getGithubPrimaryEmail('token');
    expect(result).toBeNull();
  });

  test('no primary email address: returns null', async () => {
    const noPrimary = emails.map(data => ({ ...data, primary: false }));
    axios.get.mockImplementationOnce(() => ({ data: noPrimary }));

    const result = await getGithubPrimaryEmail('token');
    expect(result).toBeNull();
  });
});
