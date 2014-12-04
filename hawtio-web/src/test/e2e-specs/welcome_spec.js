describe('hawtio welcome page', function() {
  it('should have a title', function() {
    browser.get('');

    expect(element(by.css('h3.help-header')).getText()).toEqual('Welcome to');
  });
});