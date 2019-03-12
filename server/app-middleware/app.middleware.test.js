const { customMiddleware: { injectContext } } = require('./')();

const nextMock = jest.fn();

describe('App Middleware', () => {
  test('injectContext: returns a middleware function with req.context injected', () => {
    const context = { val: 'stuff' };
    const reqMock = {};

    injectContext(context)(reqMock, null, nextMock);
    expect(nextMock).toBeCalled();
    expect(reqMock.context).toEqual(context);
  }); 
});
