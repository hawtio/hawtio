@echo off
setlocal
set PATH=%~dp0node/;%PATH%
node %*
@echo on