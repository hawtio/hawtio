## Diagnostics

The Diagnostics plugin diagnostic information about the JVM provided by the JVM DiagnosticCommand and HotspotDiangostic interfaces. The functionality is similar to the Diagnostic Commands view in Java Mission Control (jmc) or the command line tool jcmd. The plugin will provide corresponding jcmd commands in some scenarios

### Flight recorder

The Java Flight Recorder can be used to record diagnostics from a running Java process.  

#### Unlock
Commercial features must be enabled in order to use the flight recorder. The padlock will be locked and no operations are available if commercial options are not enabled. Click the padlock to unlock and enable flight recordings. Note: Running commercial opions on a production system requires a valid license

#### Start
Starts a recording. 

#### Dump
Dumps the contents of the current recording to disk. The file path will be listed in a table below.

#### Stop
Stops the current recording

#### Settings
Hide/show the options pane

### Class Histogram

Class histogram retrieves the number of instances of loaded classes and the amount of bytes they take up. 
If the operation is repeated it will also show the difference since last run.

### JVM flags
This table shows the JVM diagnostic flag settings. Your are also able to modify the settings in a running JVM 