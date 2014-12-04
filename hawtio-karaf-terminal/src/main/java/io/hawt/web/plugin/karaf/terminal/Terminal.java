/**
 * Based on http://antony.lesuisse.org/software/ajaxterm/
 *  Public Domain License
 */

/**
 * See http://www.ecma-international.org/publications/standards/Ecma-048.htm
 *       and http://vt100.net/docs/vt510-rm/
 */
package io.hawt.web.plugin.karaf.terminal;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;

public class Terminal {

    enum State {
        None,
        Esc,
        Str,
        Csi,
    }

    private int width;
    private int height;
    private int attr;
    private boolean eol;
    private int cx;
    private int cy;
    private int[] screen;
    private int[] screen2;
    private State vt100_parse_state = State.None;
    private int vt100_parse_len;
    private int vt100_lastchar;
    private int vt100_parse_func;
    private String vt100_parse_param;
    private boolean vt100_mode_autowrap;
    private boolean vt100_mode_insert;
    private boolean vt100_charset_is_single_shift;
    private boolean vt100_charset_is_graphical;
    private boolean vt100_mode_lfnewline;
    private boolean vt100_mode_origin;
    private boolean vt100_mode_inverse;
    private boolean vt100_mode_cursorkey;
    private boolean vt100_mode_cursor;
    private boolean vt100_mode_alt_screen;
    private boolean vt100_mode_backspace;
    private boolean vt100_mode_column_switch;
    private boolean vt100_keyfilter_escape;
    private int[] vt100_charset_graph = new int[]{
            0x25ca, 0x2026, 0x2022, 0x3f,
            0xb6, 0x3f, 0xb0, 0xb1,
            0x3f, 0x3f, 0x2b, 0x2b,
            0x2b, 0x2b, 0x2b, 0xaf,
            0x2014, 0x2014, 0x2014, 0x5f,
            0x2b, 0x2b, 0x2b, 0x2b,
            0x7c, 0x2264, 0x2265, 0xb6,
            0x2260, 0xa3, 0xb7, 0x7f
    };
    private int vt100_charset_g_sel;
    private int[] vt100_charset_g = {0, 0};
    private Map<String, Object> vt100_saved;
    private Map<String, Object> vt100_saved2;
    private int vt100_saved_cx;
    private int vt100_saved_cy;
    private String vt100_out;

    private int scroll_area_y0;
    private int scroll_area_y1;

    private List<Integer> tab_stops;

    private int utf8_char;
    private int utf8_units_count;
    private int utf8_units_received;

    private AtomicBoolean dirty = new AtomicBoolean(true);

    public Terminal() {
        this(80, 24);
    }

    public Terminal(int width, int height) {
        this.width = width;
        this.height = height;
        reset_hard();
    }

    private void reset_hard() {
        // Attribute mask: 0x0XFB0000
        //	X:	Bit 0 - Underlined
        //		Bit 1 - Negative
        //		Bit 2 - Concealed
        //	F:	Foreground
        //	B:	Background
        attr = 0x00fe0000;
        // UTF-8 decoder
        utf8_units_count = 0;
        utf8_units_received = 0;
        utf8_char = 0;
        // Key filter
        vt100_keyfilter_escape = false;
        // Last char
        vt100_lastchar = 0;
        // Control sequences
        vt100_parse_len = 0;
        vt100_parse_state = State.None;
        vt100_parse_func = 0;
        vt100_parse_param = "";
        // Buffers
        vt100_out = "";
        // Invoke other resets
        reset_screen();
        reset_soft();
    }

    private void reset_soft() {
        // Attribute mask: 0x0XFB0000
        //	X:	Bit 0 - Underlined
        //		Bit 1 - Negative
        //		Bit 2 - Concealed
        //	F:	Foreground
        //	B:	Background
        attr = 0x00fe0000;
        // Scroll parameters
        scroll_area_y0 = 0;
        scroll_area_y1 = height;
        // Character sets
        vt100_charset_is_single_shift = false;
        vt100_charset_is_graphical = false;
        vt100_charset_g_sel = 0;
        vt100_charset_g = new int[]{0, 0};
        // Modes
        vt100_mode_insert = false;
        vt100_mode_lfnewline = false;
        vt100_mode_cursorkey = false;
        vt100_mode_column_switch = false;
        vt100_mode_inverse = false;
        vt100_mode_origin = false;
        vt100_mode_autowrap = true;
        vt100_mode_cursor = true;
        vt100_mode_alt_screen = false;
        vt100_mode_backspace = false;
        // Init DECSC state
        esc_DECSC();
        vt100_saved2 = vt100_saved;
        esc_DECSC();
    }

    private void reset_screen() {
        // Screen
        screen = new int[width * height];
        Arrays.fill(screen, attr | 0x0020);
        screen2 = new int[width * height];
        Arrays.fill(screen2, attr | 0x0020);
        // Scroll parameters
        scroll_area_y0 = 0;
        scroll_area_y1 = height;
        // Cursor position
        cx = 0;
        cy = 0;
        // Tab stops
        tab_stops = new ArrayList<Integer>();
        for (int i = 7; i < width; i += 8) {
            tab_stops.add(i);
        }
    }

    //
    // UTF-8 functions
    //

    private String utf8_decode(String d) {
        StringBuilder o = new StringBuilder();
        for (char c : d.toCharArray()) {
            if (utf8_units_count != utf8_units_received) {
                utf8_units_received++;
                if ((c & 0xc0) == 0x80) {
                    utf8_char = (utf8_char << 6) | (c & 0x3f);
                    if (utf8_units_count == utf8_units_received) {
                        if (utf8_char < 0x10000) {
                            o.append((char) utf8_char);
                        }
                        utf8_units_count = utf8_units_received = 0;
                    }
                } else {
                    o.append('?');
                    while (utf8_units_received-- > 0) {
                        o.append('?');
                    }
                    utf8_units_count = 0;
                }
            } else {
                if ((c & 0x80) == 0x00) {
                    o.append(c);
                } else if ((c & 0xe0) == 0xc0) {
                    utf8_units_count = 1;
                    utf8_char = c & 0x1f;
                } else if ((c & 0xf0) == 0xe0) {
                    utf8_units_count = 2;
                    utf8_char = c & 0x0f;
                } else if ((c & 0xf8) == 0xf0) {
                    utf8_units_count = 3;
                    utf8_char = c & 0x07;
                } else {
                    o.append('?');
                }

            }
        }
        return o.toString();
    }

    private int utf8_charwidth(int c) {
        if (c >= 0x2e80) {
            return 2;
        } else {
            return 1;
        }
    }

    //
    // Low-level terminal functions
    //

    private int[] peek(int y0, int x0, int y1, int x1) {
        int from = width * y0 + x0;
        int to = width * (y1 - 1) + x1;
        int newLength = to - from;
        if (newLength < 0)
            throw new IllegalArgumentException(from + " > " + to);
        int[] copy = new int[newLength];
        System.arraycopy(screen, from, copy, 0,
                Math.min(screen.length - from, newLength));
        return copy;
    }

    private void poke(int y, int x, int[] s) {
        System.arraycopy(s, 0, screen, width * y + x, s.length);
        setDirty();
    }

    private void fill(int y0, int x0, int y1, int x1, int c) {
        int d0 = width * y0 + x0;
        int d1 = width * (y1 - 1) + x1;
        if (d0 <= d1) {
            Arrays.fill(screen, width * y0 + x0, width * (y1 - 1) + x1, c);
            setDirty();
        }
    }

    private void clear(int y0, int x0, int y1, int x1) {
        fill(y0, x0, y1, x1, attr | 0x20);
    }

    //
    // Scrolling functions
    //

    private void scroll_area_up(int y0, int y1) {
        scroll_area_up(y0, y1, 1);
    }

    private void scroll_area_up(int y0, int y1, int n) {
        n = Math.min(y1 - y0, n);
        poke(y0, 0, peek(y0 + n, 0, y1, width));
        clear(y1 - n, 0, y1, width);
    }

    private void scroll_area_down(int y0, int y1) {
        scroll_area_down(y0, y1, 1);
    }

    private void scroll_area_down(int y0, int y1, int n) {
        n = Math.min(y1 - y0, n);
        poke(y0 + n, 0, peek(y0, 0, y1 - n, width));
        clear(y0, 0, y0 + n, width);
    }

    private void scroll_area_set(int y0, int y1) {
        y0 = Math.max(0, Math.min(height - 1, y0));
        y1 = Math.max(1, Math.min(height, y1));
        if (y1 > y0) {
            scroll_area_y0 = y0;
            scroll_area_y1 = y1;
        }
    }

    private void scroll_line_right(int y, int x) {
        scroll_line_right(y, x, 1);
    }

    private void scroll_line_right(int y, int x, int n) {
        if (x < width) {
            n = Math.min(width - cx, n);
            poke(y, x + n, peek(y, x, y + 1, width - n));
            clear(y, x, y + 1, x + n);
        }
    }

    private void scroll_line_left(int y, int x) {
        scroll_line_left(y, x, 1);
    }

    private void scroll_line_left(int y, int x, int n) {
        if (x < width) {
            n = Math.min(width - cx, n);
            poke(y, x, peek(y, x + n, y + 1, width));
            clear(y, width - n, y + 1, width);
        }
    }

    //
    // Cursor functions
    //

    private int[] cursor_line_width(int next_char) {
        int wx = utf8_charwidth(next_char);
        int lx = 0;
        for (int x = 0; x < Math.min(cx, width); x++) {
            int c = peek(cy, x, cy + 1, x + 1)[0] & 0xffff;
            wx += utf8_charwidth(c);
            lx += 1;
        }
        return new int[]{wx, lx};
    }

    private void cursor_up() {
        cursor_up(1);
    }

    private void cursor_up(int n) {
        cy = Math.max(scroll_area_y0, cy - n);
        setDirty();
    }

    private void cursor_down() {
        cursor_down(1);
    }

    private void cursor_down(int n) {
        cy = Math.min(scroll_area_y1 - 1, cy + n);
        setDirty();
    }

    private void cursor_left() {
        cursor_left(1);
    }

    private void cursor_left(int n) {
        eol = false;
        cx = Math.max(0, cx - n);
        setDirty();
    }

    private void cursor_right() {
        cursor_right(1);
    }

    private void cursor_right(int n) {
        eol = cx + n >= width;
        cx = Math.min(width - 1, cx + n);
        setDirty();
    }

    private void cursor_set_x(int x) {
        eol = false;
        cx = Math.max(0, x);
        setDirty();
    }

    private void cursor_set_y(int y) {
        cy = Math.max(0, Math.min(height - 1, y));
        setDirty();
    }

    private void cursor_set(int y, int x) {
        cursor_set_x(x);
        cursor_set_y(y);
    }

    //
    // Dumb terminal
    //

    private void ctrl_BS() {
        int dy = (cx - 1) / width;
        cursor_set(Math.max(scroll_area_y0, cy + dy), (cx - 1) % width);
    }

    private void ctrl_HT() {
        ctrl_HT(1);
    }

    private void ctrl_HT(int n) {
        if (n > 0 && cx >= width) {
            return;
        }
        if (n <= 0 && cx == 0) {
            return;
        }
        int ts = -1;
        for (int i = 0; i < tab_stops.size(); i++) {
            if (cx >= tab_stops.get(i)) {
                ts = i;
            }
        }
        ts += n;
        if (ts < tab_stops.size() && ts >= 0) {
            cursor_set_x(tab_stops.get(ts));
        } else {
            cursor_set_x(width - 1);
        }
    }

    private void ctrl_LF() {
        if (vt100_mode_lfnewline) {
            ctrl_CR();
        }
        if (cy == scroll_area_y1 - 1) {
            scroll_area_up(scroll_area_y0, scroll_area_y1);
        } else {
            cursor_down();
        }
    }

    private void ctrl_CR() {
        cursor_set_x(0);
    }

    private boolean dumb_write(int c) {
        if (c < 32) {
            if (c == 8) {
                ctrl_BS();
            } else if (c == 9) {
                ctrl_HT();
            } else if (c >= 10 && c <= 12) {
                ctrl_LF();
            } else if (c == 13) {
                ctrl_CR();
            }
            return true;
        }
        return false;
    }

    private void dumb_echo(int c) {
        if (eol) {
            if (vt100_mode_autowrap) {
                ctrl_CR();
                ctrl_LF();
            } else {
                cx = cursor_line_width(c)[1] - 1;
            }
        }
        if (vt100_mode_insert) {
            scroll_line_right(cy, cx);
        }
        if (vt100_charset_is_single_shift) {
            vt100_charset_is_single_shift = false;
        } else if (vt100_charset_is_graphical && ((c & 0xffe0) == 0x0060)) {
            c = vt100_charset_graph[c - 0x60];
        }
        poke(cy, cx, new int[]{attr | c});
        cursor_right();
    }

    //
    // VT100
    //

    private void vt100_charset_update() {
        vt100_charset_is_graphical = (vt100_charset_g[vt100_charset_g_sel] == 2);
    }

    private void vt100_charset_set(int g) {
        // Invoke active character set
        vt100_charset_g_sel = g;
        vt100_charset_update();
    }

    private void vt100_charset_select(int g, int charset) {
        // Select charset
        vt100_charset_g[g] = charset;
        vt100_charset_update();
    }

    private void vt100_setmode(String p, boolean state) {
        // Set VT100 mode
        String[] ps = vt100_parse_params(p, new String[0]);
        for (String m : ps) {
            // 1 : GATM: Guarded area transfer
            // 2 : KAM: Keyboard action
            // 3 : CRM: Control representation
            if ("4".equals(m)) {
                // Insertion replacement mode
                vt100_mode_insert = state;
                // 5 : SRTM: Status reporting transfer
                // 7 : VEM: Vertical editing
                // 10 : HEM: Horizontal editing
                // 11 : PUM: Positioning nit
                // 12 : SRM: Send/receive
                // 13 : FEAM: Format effector action
                // 14 : FETM: Format effector transfer
                // 15 : MATM: Multiple area transfer
                // 16 : TTM: Transfer termination
                // 17 : SATM: Selected area transfer
                // 18 : TSM: Tabulation stop
                // 19 : EBM: Editing boundary
            } else if ("20".equals(m)) {
                // LNM: Line feed/new line
                vt100_mode_lfnewline = state;
            } else if ("?1".equals(m)) {
                // DECCKM: Cursor keys
                vt100_mode_cursorkey = state;
                // ?2 : DECANM: ANSI
            } else if ("?3".equals(m)) {
                // DECCOLM: Column
                if (vt100_mode_column_switch) {
                    if (state) {
                        width = 132;
                    } else {
                        width = 80;
                    }
                    reset_screen();
                }
                // ?4 : DECSCLM: Scrolling
            } else if ("?5".equals(m)) {
                // DECSCNM: Screen
                vt100_mode_inverse = state;
            } else if ("?6".equals(m)) {
                // DECOM: Origin
                vt100_mode_origin = state;
                if (state) {
                    cursor_set(scroll_area_y0, 0);
                } else {
                    cursor_set(0, 0);
                }
            } else if ("?7".equals(m)) {
                // DECAWM: Autowrap
                vt100_mode_autowrap = state;
                // ?8 : DECARM: Autorepeat
                // ?9 : Interlacing
                // ?18 : DECPFF: Print form feed
                // ?19 : DECPEX: Printer extent
            } else if ("?25".equals(m)) {
                // DECTCEM: Text cursor enable
                vt100_mode_cursor = state;
                // ?34 : DECRLM: Cursor direction, right to left
                // ?35 : DECHEBM: Hebrew keyboard mapping
                // ?36 : DECHEM: Hebrew encoding mode
            } else if ("?40".equals(m)) {
                // Column switch control
                vt100_mode_column_switch = state;
                // ?42 : DECNRCM: National replacement character set
            } else if ("?47".equals(m)) {
                // Alternate screen mode
                if ((state && !vt100_mode_alt_screen) || (!state && vt100_mode_alt_screen)) {
                    int[] s = screen;
                    screen = screen2;
                    screen2 = s;
                    Map<String, Object> map = vt100_saved;
                    vt100_saved = vt100_saved2;
                    vt100_saved2 = map;
                }
                vt100_mode_alt_screen = state;
                // ?57 : DECNAKB: Greek keyboard mapping
            } else if ("?67".equals(m)) {
                // DECBKM: Backarrow key
                vt100_mode_backspace = state;
            }
            // ?98 : DECARSM: auto-resize
            // ?101 : DECCANSM: Conceal answerback message
            // ?109 : DECCAPSLK: caps lock
        }
    }

    private void ctrl_SO() {
        vt100_charset_set(1);
    }

    private void ctrl_SI() {
        vt100_charset_set(0);
    }

    private void esc_CSI() {
        vt100_parse_reset(State.Csi);
    }

    private void esc_DECALN() {
        fill(0, 0, height, width, 0x00fe0045);
    }

    private void esc_G0_0() {
        vt100_charset_select(0, 0);
    }

    private void esc_G0_1() {
        vt100_charset_select(0, 1);
    }

    private void esc_G0_2() {
        vt100_charset_select(0, 2);
    }

    private void esc_G0_3() {
        vt100_charset_select(0, 3);
    }

    private void esc_G0_4() {
        vt100_charset_select(0, 4);
    }

    private void esc_G1_0() {
        vt100_charset_select(1, 0);
    }

    private void esc_G1_1() {
        vt100_charset_select(1, 1);
    }

    private void esc_G1_2() {
        vt100_charset_select(1, 2);
    }

    private void esc_G1_3() {
        vt100_charset_select(1, 3);
    }

    private void esc_G1_4() {
        vt100_charset_select(1, 4);
    }

    private void esc_DECSC() {
        vt100_saved = new HashMap<String, Object>();
        vt100_saved.put("cx", cx);
        vt100_saved.put("cy", cy);
        vt100_saved.put("attr", attr);
        vt100_saved.put("vt100_charset_g_sel", vt100_charset_g_sel);
        vt100_saved.put("vt100_charset_g", vt100_charset_g);
        vt100_saved.put("vt100_mode_autowrap", vt100_mode_autowrap);
        vt100_saved.put("vt100_mode_origin", vt100_mode_origin);
    }

    private void esc_DECRC() {
        cx = (Integer) vt100_saved.get("cx");
        cy = (Integer) vt100_saved.get("cy");
        attr = (Integer) vt100_saved.get("attr");
        vt100_charset_g_sel = (Integer) vt100_saved.get("vt100_charset_g_sel");
        vt100_charset_g = (int[]) vt100_saved.get("vt100_charset_g");
        vt100_charset_update();
        vt100_mode_autowrap = (Boolean) vt100_saved.get("vt100_mode_autowrap");
        vt100_mode_origin = (Boolean) vt100_saved.get("vt100_mode_origin");
    }

    private void esc_IND() {
        ctrl_LF();
    }

    private void esc_NEL() {
        ctrl_CR();
        ctrl_LF();
    }

    private void esc_HTS() {
        csi_CTC("0");
    }

    private void esc_RI() {
        if (cy == scroll_area_y0) {
            scroll_area_down(scroll_area_y0, scroll_area_y1);
        } else {
            cursor_up();
        }
    }

    private void esc_SS2() {
        vt100_charset_is_single_shift = true;
    }

    private void esc_SS3() {
        vt100_charset_is_single_shift = true;
    }

    private void esc_DCS() {
        vt100_parse_reset(State.Str);
    }

    private void esc_SOS() {
        vt100_parse_reset(State.Str);
    }

    private void esc_DECID() {
        csi_DA("0");
    }

    private void esc_ST() {
    }

    private void esc_OSC() {
        vt100_parse_reset(State.Str);
    }

    private void esc_PM() {
        vt100_parse_reset(State.Str);
    }

    private void esc_APC() {
        vt100_parse_reset(State.Str);
    }

    private void esc_RIS() {
        reset_hard();
    }

    private void csi_ICH(String p) {
        int[] ps = vt100_parse_params(p, new int[]{1});
        scroll_line_right(cy, cx, ps[0]);
    }

    private void csi_CUU(String p) {
        int[] ps = vt100_parse_params(p, new int[]{1});
        cursor_up(Math.max(1, ps[0]));
    }

    private void csi_CUD(String p) {
        int[] ps = vt100_parse_params(p, new int[]{1});
        cursor_down(Math.max(1, ps[0]));
    }

    private void csi_CUF(String p) {
        int[] ps = vt100_parse_params(p, new int[]{1});
        cursor_right(Math.max(1, ps[0]));
    }

    private void csi_CUB(String p) {
        int[] ps = vt100_parse_params(p, new int[]{1});
        cursor_left(Math.max(1, ps[0]));
    }

    private void csi_CNL(String p) {
        csi_CUD(p);
        ctrl_CR();
    }

    private void csi_CPL(String p) {
        csi_CUU(p);
        ctrl_CR();
    }

    private void csi_CHA(String p) {
        int[] ps = vt100_parse_params(p, new int[]{1});
        cursor_set_x(ps[0] - 1);
    }

    private void csi_CUP(String p) {
        int[] ps = vt100_parse_params(p, new int[]{1, 1});
        if (vt100_mode_origin) {
            cursor_set(scroll_area_y0 + ps[0] - 1, ps[1] - 1);
        } else {
            cursor_set(ps[0] - 1, ps[1] - 1);
        }
    }

    private void csi_CHT(String p) {
        int[] ps = vt100_parse_params(p, new int[]{1});
        ctrl_HT(Math.max(1, ps[0]));
    }

    private void csi_ED(String p) {
        String[] ps = vt100_parse_params(p, new String[]{"0"});
        if ("0".equals(ps[0])) {
            clear(cy, cx, height, width);
        } else if ("1".equals(ps[0])) {
            clear(0, 0, cy + 1, cx + 1);
        } else if ("2".equals(ps[0])) {
            clear(0, 0, height, width);
        }
    }

    private void csi_EL(String p) {
        String[] ps = vt100_parse_params(p, new String[]{"0"});
        if ("0".equals(ps[0])) {
            clear(cy, cx, cy + 1, width);
        } else if ("1".equals(ps[0])) {
            clear(cy, 0, cy + 1, cx + 1);
        } else if ("2".equals(ps[0])) {
            clear(cy, 0, cy + 1, width);
        }
    }

    private void csi_IL(String p) {
        int[] ps = vt100_parse_params(p, new int[]{1});
        if (cy >= scroll_area_y0 && cy < scroll_area_y1) {
            scroll_area_down(cy, scroll_area_y1, Math.max(1, ps[0]));
        }
    }

    private void csi_DL(String p) {
        int[] ps = vt100_parse_params(p, new int[]{1});
        if (cy >= scroll_area_y0 && cy < scroll_area_y1) {
            scroll_area_up(cy, scroll_area_y1, Math.max(1, ps[0]));
        }
    }

    private void csi_DCH(String p) {
        int[] ps = vt100_parse_params(p, new int[]{1});
        scroll_line_left(cy, cx, Math.max(1, ps[0]));
    }

    private void csi_SU(String p) {
        int[] ps = vt100_parse_params(p, new int[]{1});
        scroll_area_up(scroll_area_y0, scroll_area_y1, Math.max(1, ps[0]));
    }

    private void csi_SD(String p) {
        int[] ps = vt100_parse_params(p, new int[]{1});
        scroll_area_down(scroll_area_y0, scroll_area_y1, Math.max(1, ps[0]));
    }

    private void csi_CTC(String p) {
        String[] ps = vt100_parse_params(p, new String[]{"0"});
        for (String m : ps) {
            if ("0".equals(m)) {
                if (tab_stops.indexOf(cx) < 0) {
                    tab_stops.add(cx);
                    Collections.sort(tab_stops);
                }
            } else if ("2".equals(m)) {
                tab_stops.remove(Integer.valueOf(cx));
            } else if ("5".equals(m)) {
                tab_stops = new ArrayList<Integer>();
            }
        }
    }

    private void csi_ECH(String p) {
        int[] ps = vt100_parse_params(p, new int[]{1});
        int n = Math.min(width - cx, Math.max(1, ps[0]));
        clear(cy, cx, cy + 1, cx + n);
    }

    private void csi_CBT(String p) {
        int[] ps = vt100_parse_params(p, new int[]{1});
        ctrl_HT(1 - Math.max(1, ps[0]));
    }

    private void csi_HPA(String p) {
        int[] ps = vt100_parse_params(p, new int[]{1});
        cursor_set_x(ps[0] - 1);
    }

    private void csi_HPR(String p) {
        csi_CUF(p);
    }

    private void csi_REP(String p) {
        int[] ps = vt100_parse_params(p, new int[]{1});
        if (vt100_lastchar < 32) {
            return;
        }
        int n = Math.min(2000, Math.max(1, ps[0]));
        while (n-- > 0) {
            dumb_echo(vt100_lastchar);
        }
        vt100_lastchar = 0;
    }

    private void csi_DA(String p) {
        String[] ps = vt100_parse_params(p, new String[]{"0"});
        if ("0".equals(ps[0])) {
            vt100_out = "\u001b[?1;2c";
        } else if (">0".equals(ps[0]) || ">".equals(ps[0])) {
            vt100_out = "\u001b[>0;184;0c";
        }
    }

    private void csi_VPA(String p) {
        int[] ps = vt100_parse_params(p, new int[]{1});
        cursor_set_y(ps[0] - 1);
    }

    private void csi_VPR(String p) {
        csi_CUD(p);
    }

    private void csi_HVP(String p) {
        csi_CUP(p);
    }

    private void csi_TBC(String p) {
        String[] ps = vt100_parse_params(p, new String[]{"0"});
        if ("0".equals(ps[0])) {
            csi_CTC("2");
        } else if ("3".equals(ps[0])) {
            csi_CTC("5");
        }
    }

    private void csi_SM(String p) {
        vt100_setmode(p, true);
    }

    private void csi_RM(String p) {
        vt100_setmode(p, false);
    }

    private void csi_SGR(String p) {
        int[] ps = vt100_parse_params(p, new int[]{0});
        for (int m : ps) {
            if (m == 0) {
                attr = 0x00fe0000;
            } else if (m == 1) {
                attr |= 0x08000000;
            } else if (m == 4) {
                attr |= 0x01000000;
            } else if (m == 7) {
                attr |= 0x02000000;
            } else if (m == 8) {
                attr |= 0x04000000;
            } else if (m == 24) {
                attr &= 0x7eff0000;
            } else if (m == 27) {
                attr &= 0x7dff0000;
            } else if (m == 28) {
                attr &= 0x7bff0000;
            } else if (m >= 30 && m <= 37) {
                attr = (attr & 0x7f0f0000) | ((m - 30) << 20);
            } else if (m == 39) {
                attr = (attr & 0x7f0f0000) | 0x00f00000;
            } else if (m >= 40 && m <= 47) {
                attr = (attr & 0x7ff00000) | ((m - 40) << 16);
            } else if (m == 49) {
                attr = (attr & 0x7ff00000) | 0x000e0000;
            }
        }
    }

    private void csi_DSR(String p) {
        String[] ps = vt100_parse_params(p, new String[]{"0"});
        if ("5".equals(ps[0])) {
            vt100_out = "\u001b[0n";
        } else if ("6".equals(ps[0])) {
            vt100_out = "\u001b[" + (cy + 1) + ";" + (cx + 1) + "R";
        } else if ("7".equals(ps[0])) {
            vt100_out = "gogo-term";
        } else if ("8".equals(ps[0])) {
            vt100_out = "1.0-SNAPSHOT";
        } else if ("?6".equals(ps[0])) {
            vt100_out = "\u001b[" + (cy + 1) + ";" + (cx + 1) + ";0R";
        } else if ("?15".equals(ps[0])) {
            vt100_out = "\u001b[?13n";
        } else if ("?25".equals(ps[0])) {
            vt100_out = "\u001b[?20n";
        } else if ("?26".equals(ps[0])) {
            vt100_out = "\u001b[?27;1n";
        } else if ("?53".equals(ps[0])) {
            vt100_out = "\u001b[?53n";
        }
        // ?75 : Data Integrity report
        // ?62 : Macro Space report
        // ?63 : Memory Checksum report
    }

    private void csi_DECSTBM(String p) {
        int[] ps = vt100_parse_params(p, new int[]{1, height});
        scroll_area_set(ps[0] - 1, ps[1]);
        if (vt100_mode_origin) {
            cursor_set(scroll_area_y0, 0);
        } else {
            cursor_set(0, 0);
        }
    }

    private void csi_SCP(String p) {
        vt100_saved_cx = cx;
        vt100_saved_cy = cy;
    }

    private void csi_RCP(String p) {
        cx = vt100_saved_cx;
        cy = vt100_saved_cy;
    }

    private void csi_DECREQTPARM(String p) {
        String[] ps = vt100_parse_params(p, new String[0]);
        if ("0".equals(ps[0])) {
            vt100_out = "\u001b[2;1;1;112;112;1;0x";
        } else if ("1".equals(ps[0])) {
            vt100_out = "\u001b[3;1;1;112;112;1;0x";
        }
    }

    private void csi_DECSTR(String p) {
        reset_soft();
    }

    //
    // VT100 parser
    //

    private String[] vt100_parse_params(String p, String[] defaults) {
        String prefix = "";
        if (p.length() > 0) {
            if (p.charAt(0) >= '<' && p.charAt(0) <= '?') {
                prefix = "" + p.charAt(0);
                p = p.substring(1);
            }
        }
        String[] ps = p.split(";");
        int n = Math.max(ps.length, defaults.length);
        String[] values = new String[n];
        for (int i = 0; i < n; i++) {
            String value = null;
            if (i < ps.length && ps[i].length() > 0) {
                value = prefix + ps[i];
            }
            if (value == null && i < defaults.length) {
                value = defaults[i];
            }
            if (value == null) {
                value = "";
            }
            values[i] = value;
        }
        return values;
    }

    private int[] vt100_parse_params(String p, int[] defaults) {
        String prefix = "";
        p = p == null ? "" : p;
        if (p.length() > 0) {
            if (p.charAt(0) >= '<' && p.charAt(0) <= '?') {
                prefix = p.substring(0, 1);
                p = p.substring(1);
            }
        }
        String[] ps = p.split(";");
        int n = Math.max(ps.length, defaults.length);
        int[] values = new int[n];
        for (int i = 0; i < n; i++) {
            Integer value = null;
            if (i < ps.length) {
                String v = prefix + ps[i];
                try {
                    value = Integer.parseInt(v);
                } catch (NumberFormatException e) {
                }
            }
            if (value == null && i < defaults.length) {
                value = defaults[i];
            }
            if (value == null) {
                value = 0;
            }
            values[i] = value;
        }
        return values;
    }

    private void vt100_parse_reset() {
        vt100_parse_reset(State.None);
    }

    private void vt100_parse_reset(State state) {
        vt100_parse_state = state;
        vt100_parse_len = 0;
        vt100_parse_func = 0;
        vt100_parse_param = "";
    }

    private void vt100_parse_process() {
        if (vt100_parse_state == State.Esc) {
            switch (vt100_parse_func) {
                case 0x0036: /* DECBI */
                    break;
                case 0x0037:
                    esc_DECSC();
                    break;
                case 0x0038:
                    esc_DECRC();
                    break;
                case 0x0042: /* BPH */
                    break;
                case 0x0043: /* NBH */
                    break;
                case 0x0044:
                    esc_IND();
                    break;
                case 0x0045:
                    esc_NEL();
                    break;
                case 0x0046: /* SSA */
                    esc_NEL();
                    break;
                case 0x0048:
                    esc_HTS();
                    break;
                case 0x0049: /* HTJ */
                    break;
                case 0x004A: /* VTS */
                    break;
                case 0x004B: /* PLD */
                    break;
                case 0x004C: /* PLU */
                    break;
                case 0x004D:
                    esc_RI();
                    break;
                case 0x004E:
                    esc_SS2();
                    break;
                case 0x004F:
                    esc_SS3();
                    break;
                case 0x0050:
                    esc_DCS();
                    break;
                case 0x0051: /* PU1 */
                    break;
                case 0x0052: /* PU2 */
                    break;
                case 0x0053: /* STS */
                    break;
                case 0x0054: /* CCH */
                    break;
                case 0x0055: /* MW */
                    break;
                case 0x0056: /* SPA */
                    break;
                case 0x0057: /* ESA */
                    break;
                case 0x0058:
                    esc_SOS();
                    break;
                case 0x005A: /* SCI */
                    break;
                case 0x005B:
                    esc_CSI();
                    break;
                case 0x005C:
                    esc_ST();
                    break;
                case 0x005D:
                    esc_OSC();
                    break;
                case 0x005E:
                    esc_PM();
                    break;
                case 0x005F:
                    esc_APC();
                    break;
                case 0x0060: /* DMI */
                    break;
                case 0x0061: /* INT */
                    break;
                case 0x0062: /* EMI */
                    break;
                case 0x0063:
                    esc_RIS();
                    break;
                case 0x0064: /* CMD */
                    break;
                case 0x006C: /* RM */
                    break;
                case 0x006E: /* LS2 */
                    break;
                case 0x006F: /* LS3 */
                    break;
                case 0x007C: /* LS3R */
                    break;
                case 0x007D: /* LS2R */
                    break;
                case 0x007E: /* LS1R */
                    break;
                case 0x2338:
                    esc_DECALN();
                    break;
                case 0x2841:
                    esc_G0_0();
                    break;
                case 0x2842:
                    esc_G0_1();
                    break;
                case 0x2830:
                    esc_G0_2();
                    break;
                case 0x2831:
                    esc_G0_3();
                    break;
                case 0x2832:
                    esc_G0_4();
                    break;
                case 0x2930:
                    esc_G1_2();
                    break;
                case 0x2931:
                    esc_G1_3();
                    break;
                case 0x2932:
                    esc_G1_4();
                    break;
                case 0x2941:
                    esc_G1_0();
                    break;
                case 0x2942:
                    esc_G1_1();
                    break;
            }
            if (vt100_parse_state == State.Esc) {
                vt100_parse_reset();
            }
        } else {
            switch (vt100_parse_func) {
                case 0x0040:
                    csi_ICH(vt100_parse_param);
                    break;
                case 0x0041:
                    csi_CUU(vt100_parse_param);
                    break;
                case 0x0042:
                    csi_CUD(vt100_parse_param);
                    break;
                case 0x0043:
                    csi_CUF(vt100_parse_param);
                    break;
                case 0x0044:
                    csi_CUB(vt100_parse_param);
                    break;
                case 0x0045:
                    csi_CNL(vt100_parse_param);
                    break;
                case 0x0046:
                    csi_CPL(vt100_parse_param);
                    break;
                case 0x0047:
                    csi_CHA(vt100_parse_param);
                    break;
                case 0x0048:
                    csi_CUP(vt100_parse_param);
                    break;
                case 0x0049:
                    csi_CHT(vt100_parse_param);
                    break;
                case 0x004A:
                    csi_ED(vt100_parse_param);
                    break;
                case 0x004B:
                    csi_EL(vt100_parse_param);
                    break;
                case 0x004C:
                    csi_IL(vt100_parse_param);
                    break;
                case 0x004D:
                    csi_DL(vt100_parse_param);
                    break;
                case 0x004E: /* EF */
                    break;
                case 0x004F: /* EA */
                    break;
                case 0x0050:
                    csi_DCH(vt100_parse_param);
                    break;
                case 0x0051: /* SEE */
                    break;
                case 0x0052: /* CPR */
                    break;
                case 0x0053:
                    csi_SU(vt100_parse_param);
                    break;
                case 0x0054:
                    csi_SD(vt100_parse_param);
                    break;
                case 0x0055: /* NP */
                    break;
                case 0x0056: /* PP */
                    break;
                case 0x0057:
                    csi_CTC(vt100_parse_param);
                    break;
                case 0x0058:
                    csi_ECH(vt100_parse_param);
                    break;
                case 0x0059: /* CVT */
                    break;
                case 0x005A:
                    csi_CBT(vt100_parse_param);
                    break;
                case 0x005B: /* SRS */
                    break;
                case 0x005C: /* PTX */
                    break;
                case 0x005D: /* SDS */
                    break;
                case 0x005E: /* SIMD */
                    break;
                case 0x0060:
                    csi_HPA(vt100_parse_param);
                    break;
                case 0x0061:
                    csi_HPR(vt100_parse_param);
                    break;
                case 0x0062:
                    csi_REP(vt100_parse_param);
                    break;
                case 0x0063:
                    csi_DA(vt100_parse_param);
                    break;
                case 0x0064:
                    csi_VPA(vt100_parse_param);
                    break;
                case 0x0065:
                    csi_VPR(vt100_parse_param);
                    break;
                case 0x0066:
                    csi_HVP(vt100_parse_param);
                    break;
                case 0x0067:
                    csi_TBC(vt100_parse_param);
                    break;
                case 0x0068:
                    csi_SM(vt100_parse_param);
                    break;
                case 0x0069: /* MC */
                    break;
                case 0x006A: /* HPB */
                    break;
                case 0x006B: /* VPB */
                    break;
                case 0x006C:
                    csi_RM(vt100_parse_param);
                    break;
                case 0x006D:
                    csi_SGR(vt100_parse_param);
                    break;
                case 0x006E:
                    csi_DSR(vt100_parse_param);
                    break;
                case 0x006F: /* DAQ */
                    break;
                case 0x0072:
                    csi_DECSTBM(vt100_parse_param);
                    break;
                case 0x0073:
                    csi_SCP(vt100_parse_param);
                    break;
                case 0x0075:
                    csi_RCP(vt100_parse_param);
                    break;
                case 0x0078:
                    csi_DECREQTPARM(vt100_parse_param);
                    break;
                case 0x2040: /* SL */
                    break;
                case 0x2041: /* SR */
                    break;
                case 0x2042: /* GSM */
                    break;
                case 0x2043: /* GSS */
                    break;
                case 0x2044: /* FNT */
                    break;
                case 0x2045: /* TSS */
                    break;
                case 0x2046: /* JFY */
                    break;
                case 0x2047: /* SPI */
                    break;
                case 0x2048: /* QUAD */
                    break;
                case 0x2049: /* SSU */
                    break;
                case 0x204A: /* PFS */
                    break;
                case 0x204B: /* SHS */
                    break;
                case 0x204C: /* SVS */
                    break;
                case 0x204D: /* IGS */
                    break;
                case 0x204E: /* deprecated: HTSA */
                    break;
                case 0x204F: /* IDCS */
                    break;
                case 0x2050: /* PPA */
                    break;
                case 0x2051: /* PPR */
                    break;
                case 0x2052: /* PPB */
                    break;
                case 0x2053: /* SPD */
                    break;
                case 0x2054: /* DTA */
                    break;
                case 0x2055: /* SLH */
                    break;
                case 0x2056: /* SLL */
                    break;
                case 0x2057: /* FNK */
                    break;
                case 0x2058: /* SPQR */
                    break;
                case 0x2059: /* SEF */
                    break;
                case 0x205A: /* PEC */
                    break;
                case 0x205B: /* SSW */
                    break;
                case 0x205C: /* SACS */
                    break;
                case 0x205D: /* SAPV */
                    break;
                case 0x205E: /* STAB */
                    break;
                case 0x205F: /* GCC */
                    break;
                case 0x2060: /* TAPE */
                    break;
                case 0x2061: /* TALE */
                    break;
                case 0x2062: /* TAC */
                    break;
                case 0x2063: /* TCC */
                    break;
                case 0x2064: /* TSR */
                    break;
                case 0x2065: /* SCO */
                    break;
                case 0x2066: /* SRCS */
                    break;
                case 0x2067: /* SCS */
                    break;
                case 0x2068: /* SLS */
                    break;
                case 0x2069: /* SPH */
                    break;
                case 0x206A: /* SPL */
                    break;
                case 0x206B: /* SCP */
                    break;
                case 0x2170:
                    csi_DECSTR(vt100_parse_param);
                    break;
                case 0x2472: /* DECCARA */
                    break;
                case 0x2477: /* DECRQPSR */
                    break;
            }
            if (vt100_parse_state == State.Csi) {
                vt100_parse_reset();
            }
        }
    }

    private boolean vt100_write(int c) {
        if (c < 32) {
            if (c == 27) {
                vt100_parse_reset(State.Esc);
                return true;
            } else if (c == 14) {
                ctrl_SO();
            } else if (c == 15) {
                ctrl_SI();
            }
        } else if ((c & 0xffe0) == 0x0080) {
            vt100_parse_reset(State.Esc);
            vt100_parse_func = (char) (c - 0x0040);
            vt100_parse_process();
            return true;
        }
        if (vt100_parse_state != State.None) {
            if (vt100_parse_state == State.Str) {
                if (c >= 32) {
                    return true;
                }
                vt100_parse_reset();
            } else {
                if (c < 32) {
                    if (c == 24 || c == 26) {
                        vt100_parse_reset();
                        return true;
                    }
                } else {
                    vt100_parse_len += 1;
                    if (vt100_parse_len > 32) {
                        vt100_parse_reset();
                    } else {
                        int msb = c & 0xf0;
                        if (msb == 0x20) {
                            vt100_parse_func <<= 8;
                            vt100_parse_func += (char) c;
                        } else if (msb == 0x30 && vt100_parse_state == State.Csi) {
                            vt100_parse_param += new String(new char[]{(char) c});
                        } else {
                            vt100_parse_func <<= 8;
                            vt100_parse_func += (char) c;
                            vt100_parse_process();
                        }
                        return true;
                    }
                }
            }
        }
        vt100_lastchar = c;
        return false;
    }

    //
    // Dirty
    //

    private synchronized void setDirty() {
        dirty.set(true);
        notifyAll();
    }

    //
    // External interface
    //

    public synchronized boolean setSize(int w, int h) {
        if (w < 2 || w > 256 || h < 2 || h > 256) {
            return false;
        }
        this.width = w;
        this.height = h;
        reset_screen();
        return true;
    }

    public synchronized String read() {
        String d = vt100_out;
        vt100_out = "";
        return d;
    }

    public synchronized String pipe(String d) {
        String o = "";
        for (char c : d.toCharArray()) {
            if (vt100_keyfilter_escape) {
                vt100_keyfilter_escape = false;
                if (vt100_mode_cursorkey) {
                    switch (c) {
                        case '~':
                            o += "~";
                            break;
                        case 'A':
                            o += "\u001bOA";
                            break;
                        case 'B':
                            o += "\u001bOB";
                            break;
                        case 'C':
                            o += "\u001bOC";
                            break;
                        case 'D':
                            o += "\u001bOD";
                            break;
                        case 'F':
                            o += "\u001bOF";
                            break;
                        case 'H':
                            o += "\u001bOH";
                            break;
                        case '1':
                            o += "\u001b[5~";
                            break;
                        case '2':
                            o += "\u001b[6~";
                            break;
                        case '3':
                            o += "\u001b[2~";
                            break;
                        case '4':
                            o += "\u001b[3~";
                            break;
                        case 'a':
                            o += "\u001bOP";
                            break;
                        case 'b':
                            o += "\u001bOQ";
                            break;
                        case 'c':
                            o += "\u001bOR";
                            break;
                        case 'd':
                            o += "\u001bOS";
                            break;
                        case 'e':
                            o += "\u001b[15~";
                            break;
                        case 'f':
                            o += "\u001b[17~";
                            break;
                        case 'g':
                            o += "\u001b[18~";
                            break;
                        case 'h':
                            o += "\u001b[19~";
                            break;
                        case 'i':
                            o += "\u001b[20~";
                            break;
                        case 'j':
                            o += "\u001b[21~";
                            break;
                        case 'k':
                            o += "\u001b[23~";
                            break;
                        case 'l':
                            o += "\u001b[24~";
                            break;
                    }
                } else {
                    switch (c) {
                        case '~':
                            o += "~";
                            break;
                        case 'A':
                            o += "\u001b[A";
                            break;
                        case 'B':
                            o += "\u001b[B";
                            break;
                        case 'C':
                            o += "\u001b[C";
                            break;
                        case 'D':
                            o += "\u001b[D";
                            break;
                        case 'F':
                            o += "\u001b[F";
                            break;
                        case 'H':
                            o += "\u001b[H";
                            break;
                        case '1':
                            o += "\u001b[5~";
                            break;
                        case '2':
                            o += "\u001b[6~";
                            break;
                        case '3':
                            o += "\u001b[2~";
                            break;
                        case '4':
                            o += "\u001b[3~";
                            break;
                        case 'a':
                            o += "\u001bOP";
                            break;
                        case 'b':
                            o += "\u001bOQ";
                            break;
                        case 'c':
                            o += "\u001bOR";
                            break;
                        case 'd':
                            o += "\u001bOS";
                            break;
                        case 'e':
                            o += "\u001b[15~";
                            break;
                        case 'f':
                            o += "\u001b[17~";
                            break;
                        case 'g':
                            o += "\u001b[18~";
                            break;
                        case 'h':
                            o += "\u001b[19~";
                            break;
                        case 'i':
                            o += "\u001b[20~";
                            break;
                        case 'j':
                            o += "\u001b[21~";
                            break;
                        case 'k':
                            o += "\u001b[23~";
                            break;
                        case 'l':
                            o += "\u001b[24~";
                            break;
                    }
                }
            } else if (c == '~') {
                vt100_keyfilter_escape = true;
            } else if (c == 127) {
                if (vt100_mode_backspace) {
                    o += (char) 8;
                } else {
                    o += (char) 127;
                }
            } else {
                o += c;
                /* Seems like this adds an extra newline...
                if (vt100_mode_lfnewline && c == 13) {
                    o += (char) 10;
                }
                */
            }
        }
        return o;
    }

    public synchronized boolean write(String d) {
        d = utf8_decode(d);
        for (int c : d.toCharArray()) {
            if (vt100_write(c)) {
                continue;
            }
            if (dumb_write(c)) {
                continue;
            }
            if (c <= 0xffff) {
                dumb_echo(c);
            }
        }
        return true;
    }

    public synchronized String dump(long timeout, boolean forceDump) throws InterruptedException {
        if (!dirty.get() && timeout > 0) {
            wait(timeout);
        }
        if (dirty.compareAndSet(true, false) || forceDump) {
            StringBuilder sb = new StringBuilder();
            int prev_attr = -1;
            int cx = Math.min(this.cx, width - 1);
            int cy = this.cy;
            sb.append("<div><pre class='term'>");
            for (int y = 0; y < height; y++) {
                int wx = 0;
                for (int x = 0; x < width; x++) {
                    int d = screen[y * width + x];
                    int c = d & 0xffff;
                    int a = d >> 16;
                    if (cy == y && cx == x && vt100_mode_cursor) {
                        a = a & 0xfff0 | 0x000c;
                    }
                    if (a != prev_attr) {
                        if (prev_attr != -1) {
                            sb.append("</span>");
                        }
                        int bg = a & 0x000f;
                        int fg = (a & 0x00f0) >> 4;
                        boolean inv = (a & 0x0200) != 0;
                        boolean inv2 = vt100_mode_inverse;
                        if (inv && !inv2 || inv2 && !inv) {
                            int i = fg;
                            fg = bg;
                            bg = i;
                        }
                        if ((a & 0x0400) != 0) {
                            fg = 0x0c;
                        }
                        String ul;
                        if ((a & 0x0100) != 0) {
                            ul = " ul";
                        } else {
                            ul = "";
                        }
                        String b;
                        if ((a & 0x0800) != 0) {
                            b = " b";
                        } else {
                            b = "";
                        }
                        sb.append("<span class='f").append(fg).append(" b").append(bg).append(ul).append(b).append("'>");
                        prev_attr = a;
                    }
                    switch (c) {
                        case '&':
                            sb.append("&amp;");
                            break;
                        case '<':
                            sb.append("&lt;");
                            break;
                        case '>':
                            sb.append("&gt;");
                            break;
                        default:
                            wx += utf8_charwidth(c);
                            if (wx <= width) {
                                sb.append((char) c);
                            }
                            break;
                    }
                }
                sb.append("\n");
            }
            sb.append("</span></pre></div>");
            return sb.toString();
        }
        return null;
    }

    public String toString() {
        StringBuilder sb = new StringBuilder();
        for (int y = 0; y < height; y++) {
            for (int x = 0; x < width; x++) {
                sb.append((char) (screen[y * width + x] & 0xffff));
            }
            sb.append("\n");
        }
        return sb.toString();
    }
}
