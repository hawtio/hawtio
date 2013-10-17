module UI {

  export class ZeroClipboardDirective {
    public restrict = 'A';

    public link = ($scope, $element, $attr) => {
      var clip = new (<any>window).ZeroClipboard($element.get(0), {
        moviePath: "img/ZeroClipboard.swf"
      });

      clip.on('complete', (client, args) => {
        notification('info', "Copied text to clipboard: " + args.text);
      });

    };
  }
}
