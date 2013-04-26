module Core {

  /**
   * Simple helper class for creating <a href="http://angular-ui.github.io/bootstrap/#/modal">angular ui bootstrap modal dialogs</a>
   */
  export class Dialog {
    public show = false;

    public options = {
      backdropFade: true,
      dialogFade: true
    };

    public open() {
      this.show = true;
    }

    public close() {
      this.show = false;
    }
  }
}