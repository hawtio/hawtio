#!/bin/sh

echo ""
echo "Watching the TypeScript and recompiling it on the fly. Get ready for moah RAD!"
echo "Remember to install LiveReload in your browser to get moah awesome: "
echo "https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei"
echo ""
echo "Click the Enable Live Reload button in the browser nav bar (on right)"
echo ""

grunt tsc --watch
