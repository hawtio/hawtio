/**
 * @module Core
 */
module Core {

  /**
   * Simple helper class for creating <a href="http://angular-ui.github.io/bootstrap/#/modal">angular ui bootstrap modal dialogs</a>
   * @class Dialog
   */
  export class Dialog {
    public show = false;

    public options = {
      backdropFade: true,
      dialogFade: true
    };

    /**
     * Opens the dialog
     * @method open
     */
    public open() {
      this.show = true;
    }

    /**
     * Closes the dialog
     * @method close
     */
    public close() {
      this.show = false;
      // lets make sure and remove any backgroup fades
      this.removeBackdropFadeDiv();
      setTimeout(this.removeBackdropFadeDiv, 100);
    }

    removeBackdropFadeDiv() {
      $("div.modal-backdrop").remove();
    }
  }
}
