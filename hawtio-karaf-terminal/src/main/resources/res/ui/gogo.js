//
// Licensed to the Apache Software Foundation (ASF) under one or more
// contributor license agreements.  See the NOTICE file distributed with
// this work for additional information regarding copyright ownership.
// The ASF licenses this file to You under the Apache License, Version 2.0
// (the "License"); you may not use this file except in compliance with
// the License.  You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

//
// Based on http://antony.lesuisse.org/software/ajaxterm/
//  Public Domain License
//

gogo = { };

gogo.Terminal_ctor = function(div, width, height) {

   var query0 = "w=" + width + "&h=" + height;
   var query1 = query0 + "&k=";
   var buf = "";
   var timeout;
   var error_timeout;
   var keybuf = [];
   var sending = 0;
   var rmax = 1;
   var force = 1;

   var dstat = document.createElement('pre');
   var sled = document.createElement('span');
   var sdebug = document.createElement('span');
   var dterm = document.createElement('div');

   function debug(s) {
       sdebug.innerHTML = s;
   }

   function error() {
       sled.className = 'off';
       debug("Connection lost timeout ts:" + ((new Date).getTime()));
   }

   function update() {
       if (sending == 0) {
           sending = 1;
           sled.className = 'on';
           var r = new XMLHttpRequest();
           var send = "";
           while (keybuf.length > 0) {
               send += keybuf.pop();
           }
           var query = query1 + send;
           if (force) {
               query = query + "&f=1";
               force = 0;
           }
           r.open("POST", "gogo", true);
           r.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
           r.onreadystatechange = function () {
               if (r.readyState == 4) {
                   if (r.status == 200) {
                       window.clearTimeout(error_timeout);
                       if (r.responseText.length > 0) {
                           dterm.innerHTML = r.responseText;
                           rmax = 100;
                       } else {
                           rmax *= 2;
                           if (rmax > 2000)
                               rmax = 2000;
                       }
                       sending=0;
                       sled.className = 'off';
                       timeout = window.setTimeout(update, rmax);
                   } else {
                       debug("Connection error status:" + r.status);
                   }
               }
           }
           error_timeout = window.setTimeout(error, 5000);
           r.send(query);
       }
   }

   function queue(s) {
       keybuf.unshift(s);
       if (sending == 0) {
           window.clearTimeout(timeout);
           timeout = window.setTimeout(update, 1);
       }
   }

   function keypress(ev, fromkeydown) {
        // Translate to standard keycodes
        if (!ev)
            ev = window.event;
        var kc;
        if (ev.keyCode)
            kc = ev.keyCode;
        if (!fromkeydown && ev.which)
            kc = ev.which;
        if (ev.ctrlKey) {
            if (kc >= 0 && kc <= 32)
                kc = kc;
            else if (kc >= 65 && kc <= 90)
                kc -= 64;
            else if (kc >= 97 && kc <= 122)
                kc -= 96;
            else {
                switch (kc) {
                    case 54:  kc=30; break;	// Ctrl-^
                    case 109: kc=31; break;	// Ctrl-_
                    case 219: kc=27; break;	// Ctrl-[
                    case 220: kc=28; break;	// Ctrl-\
                    case 221: kc=29; break;	// Ctrl-]
                    default: return true;
                }
            }
        } else if (fromkeydown) {
            switch(kc) {
                case 8: break;			     // Backspace
                case 9: break;               // Tab
                case 27: break;			     // ESC
                case 33:  kc = 63276; break; // PgUp
                case 34:  kc = 63277; break; // PgDn
                case 35:  kc = 63275; break; // End
                case 36:  kc = 63273; break; // Home
                case 37:  kc = 63234; break; // Left
                case 38:  kc = 63232; break; // Up
                case 39:  kc = 63235; break; // Right
                case 40:  kc = 63233; break; // Down
                case 45:  kc = 63302; break; // Ins
                case 46:  kc = 63272; break; // Del
                case 112: kc = 63236; break; // F1
                case 113: kc = 63237; break; // F2
                case 114: kc = 63238; break; // F3
                case 115: kc = 63239; break; // F4
                case 116: kc = 63240; break; // F5
                case 117: kc = 63241; break; // F6
                case 118: kc = 63242; break; // F7
                case 119: kc = 63243; break; // F8
                case 120: kc = 63244; break; // F9
                case 121: kc = 63245; break; // F10
                case 122: kc = 63246; break; // F11
                case 123: kc = 63247; break; // F12
                default: return true;
            }
        }

        var k = "";
        // Build character
        switch (kc) {
            case 126:   k = "~~"; break;
            case 63232: k = "~A"; break; // Up
            case 63233: k = "~B"; break; // Down
            case 63234: k = "~D"; break; // Left
            case 63235: k = "~C"; break; // Right
            case 63276: k = "~1"; break; // PgUp
            case 63277: k = "~2"; break; // PgDn
            case 63273: k = "~H"; break; // Home
            case 63275: k = "~F"; break; // End
            case 63302: k = "~3"; break; // Ins
            case 63272: k = "~4"; break; // Del
            case 63236: k = "~a"; break; // F1
            case 63237: k = "~b"; break; // F2
            case 63238: k = "~c"; break; // F3
            case 63239: k = "~d"; break; // F4
            case 63240: k = "~e"; break; // F5
            case 63241: k = "~f"; break; // F6
            case 63242: k = "~g"; break; // F7
            case 63243: k = "~h"; break; // F8
            case 63244: k = "~i"; break; // F9
            case 63245: k = "~j"; break; // F10
            case 63246: k = "~k"; break; // F11
            case 63247: k = "~l"; break; // F12
            default:    k = String.fromCharCode(kc); break;
        }

//        debug("fromkeydown=" + fromkeydown + ", ev.keyCode=" + ev.keyCode + ", " +
//              "ev.which=" + ev.which + ", ev.ctrlKey=" + ev.ctrlKey + ", " +
//              "kc=" + kc + ", k=" + k);

        queue(encodeURIComponent(k));

        ev.cancelBubble = true;
        if (ev.stopPropagation) ev.stopPropagation();
        if (ev.preventDefault) ev.preventDefault();

        return true;
   }

   function keydown(ev) {
       if (!ev)
          ev = window.event;
           o = { 9:1, 8:1, 27:1, 33:1, 34:1, 35:1, 36:1, 37:1, 38:1, 39:1, 40:1, 45:1, 46:1, 112:1,
                 113:1, 114:1, 115:1, 116:1, 117:1, 118:1, 119:1, 120:1, 121:1, 122:1, 123:1 };
           if (o[ev.keyCode] || ev.ctrlKey || ev.altKey) {
               keypress(ev, true);
           }
   }

   function init() {
       if (typeof(XMLHttpRequest) == "undefined") {
         XMLHttpRequest = function() {
           try { return new ActiveXObject("Msxml2.XMLHTTP.6.0"); }
             catch(e) {}
           try { return new ActiveXObject("Msxml2.XMLHTTP.3.0"); }
             catch(e) {}
           try { return new ActiveXObject("Msxml2.XMLHTTP"); }
             catch(e) {}
           try { return new ActiveXObject("Microsoft.XMLHTTP"); }
             catch(e) {}
           throw new Error("This browser does not support XMLHttpRequest.");
         };
       }
       sled.appendChild(document.createTextNode('\xb7'));
       sled.className = 'off';
       dstat.appendChild(sled);
       dstat.appendChild(document.createTextNode(' '));
       dstat.appendChild(sdebug);
       dstat.className = 'stat';
       div.appendChild(dstat);
       var d = document.createElement('div');
       d.appendChild(dterm);
       div.appendChild(d);
       document.onkeypress = keypress;
       document.onkeydown = keydown;
       timeout = window.setTimeout(update, 100);
   }

   init();

}

gogo.Terminal = function(div, width, height) {
   return new this.Terminal_ctor(div, width, height);
}

