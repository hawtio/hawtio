/**
 * @module UI
 */
module UI {

  export class Expandable {

    log:Logging.Logger = Logger.get("Expandable");

    public restrict = 'C';
    public replace = false;

    public open(model, expandable, scope) {
      expandable.find('.expandable-body').slideDown(400, function() {
        if (!expandable.hasClass('opened')) {
          expandable.addClass('opened');
        }
        expandable.removeClass('closed');
        if (model) {
          model['expanded'] = true;
        }
        Core.$apply(scope);
      });
    }

    public close(model, expandable, scope) {
      expandable.find('.expandable-body').slideUp(400, function() {
        expandable.removeClass('opened');
        if (!expandable.hasClass('closed')) {
          expandable.addClass('closed');
        }
        if (model) {
          model['expanded'] = false;
        }
        Core.$apply(scope);
      });
    }

    public forceClose(model, expandable, scope) {
      expandable.find('.expandable-body').slideUp(0, function() {
        if (!expandable.hasClass('closed')) {
          expandable.addClass('closed');
        }
        expandable.removeClass('opened');
        if (model) {
          model['expanded'] = false;
        }
        Core.$apply(scope);
      });
    }

    public forceOpen(model, expandable, scope) {
      expandable.find('.expandable-body').slideDown(0, function() {
        if (!expandable.hasClass('opened')) {
          expandable.addClass('opened');
        }
        expandable.removeClass('closed');
        if (model) {
          model['expanded'] = true;
        }
        Core.$apply(scope);
      });
    }

    public link = null;

    constructor() {

      this.link = (scope, element, attrs) => {
        var self = this;
        var expandable = element;
        var modelName = null;
        var model = null;

        if (angular.isDefined(attrs['model'])) {

          modelName = attrs['model'];
          model = scope[modelName];

          if (!angular.isDefined(scope[modelName]['expanded'])) {
            model['expanded'] = expandable.hasClass('opened');
          } else {
            if (model['expanded']) {
              self.forceOpen(model, expandable, scope);
            } else {
              self.forceClose(model, expandable, scope);
            }
          }

          if (modelName) {
            scope.$watch(modelName + '.expanded', (newValue, oldValue) => {

              if (asBoolean(newValue) !== asBoolean(oldValue)) {
                if (newValue) {
                  self.open(model, expandable, scope);
                } else {
                  self.close(model, expandable, scope);
                }
              }
            });
          }
        }

        var title = expandable.find('.title');
        var button = expandable.find('.cancel');

        button.bind('click', function () {
          model = scope[modelName];
          self.forceClose(model, expandable, scope);
          return false;
        });

        title.bind('click', function () {
          model = scope[modelName];
          if (isOpen(expandable)) {
            self.close(model, expandable, scope);
          } else {
            self.open(model, expandable, scope);
          }
          return false;
        });
      };

    }


  }

  function isOpen(expandable) {
    return expandable.hasClass('opened') || !expandable.hasClass("closed");
  }

  function asBoolean(value) {
    return value ? true : false;
  }
}
