module Core {

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