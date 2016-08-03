@echo off
setlocal
run_node.cmd %~dp0node_modules\typedoc\bin\typedoc %*
@echo on