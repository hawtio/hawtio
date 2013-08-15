module UI {

  export class Expandable {

    public restrict = 'C';
    public replace = false;

    public link = function (scope, element, attrs) {
      var expandable = $(element);

      var title = expandable.find('.title');
      var button = expandable.find('.cancel');

      button.bind('click', function () {
        expandable.find('.expandable-body').slideUp(400, function() {
          expandable.addClass('closed');
          expandable.removeClass('opened');
        });
        return false;
      });

      title.bind('click', function () {
        if (expandable.hasClass('opened')) {
          expandable.find('.expandable-body').slideUp(400, function() {
            expandable.toggleClass('opened');
            expandable.toggleClass('closed');
          });
        } else {
          expandable.find('.expandable-body').slideDown(400, function() {
            expandable.toggleClass('opened');
            expandable.toggleClass('closed');
          });
        }
        return false;
      });
    };

  }

}
