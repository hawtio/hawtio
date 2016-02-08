package io.hawt.web.plugin.karaf.terminal;

import jline.TerminalSupport;

public class WebTerminal extends TerminalSupport {

    private int width;
    private int height;

    public WebTerminal(int width, int height) {
        super(true);
        this.width = width;
        this.height = height;
    }

    public void init() throws Exception {
    }

    public void restore() throws Exception {
    }

    public int getWidth() {
        return width;
    }

    public int getHeight() {
        return height;
    }

}
