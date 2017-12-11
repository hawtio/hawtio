/// <reference path="../../../main/webapp/app/diagnostics/js/jfr.ts"/>
describe("Diagnostics", function () {
    it("Test locked", function () {
        var scope;
        scope = {pid: 1234};
        Diagnostics.updateJfrScope({value: "Java Flight Recorder not enabled.\n\nUse VM.unlock_commercial_features to enable."}, scope);
        expect(scope.jfrEnabled).toBeFalsy();
        expect(scope.isRunning).toBeFalsy();
        expect(scope.isRecording).toBeFalsy();
        expect(scope.jfrStatus).toContain("Use command line: jcmd 1234 VM.unlock_commercial_features");
    });

    it("Test windows locked", function () {
        var scope={pid: 1234};
        Diagnostics.updateJfrScope({value: "Java Flight Recorder not enabled.\r\n\r\nUse VM.unlock_commercial_features to enable."}, scope);
        expect(scope.jfrEnabled).toBeFalsy();
        expect(scope.isRunning).toBeFalsy();
        expect(scope.isRecording).toBeFalsy();
        expect(scope.jfrStatus).toContain("Use command line: jcmd 1234 VM.unlock_commercial_features");
    });

    it("Test unlocked", function () {
        var scope;
        scope = {};
        Diagnostics.updateJfrScope({value: "No available recordings.\n\nUse JFR.start to start a recording."}, scope);
        expect(scope.jfrEnabled).toBeTruthy();
        expect(scope.isRunning).toBeFalsy();
        expect(scope.isRecording).toBeFalsy();
        expect(scope.jfrStatus).toContain("JFR.start");
    });

    it("Test Java 9 recording", function () {
        var scope;
        scope = {jfrSettings: {}};
        Diagnostics.updateJfrScope({value: 'Recording: recording=1 name="Recording-1" maxsize=250,0MB (running)'}, scope);
        expect(scope.jfrEnabled).toBeTruthy();
        expect(scope.isRunning).toBeTruthy();
        expect(scope.isRecording).toBeTruthy();
        expect(scope.jfrSettings.name).toBe("Recording-1");
        expect(scope.jfrSettings.recordingNumber).toBe("1");
    });

    it("Test Java 8 recording", function () {
        var scope;
        scope = {jfrSettings: {}};
        Diagnostics.updateJfrScope({value: 'Recording: recording=1 name="Recording-1" (running)'}, scope);
        expect(scope.jfrEnabled).toBeTruthy();
        expect(scope.isRunning).toBeTruthy();
        expect(scope.isRecording).toBeTruthy();
        expect(scope.jfrSettings.name).toBe("Recording-1");
        expect(scope.jfrSettings.recordingNumber).toBe("1");
    });

    it("Test Java 8 stopped", function () {
        var scope;
        scope = {jfrSettings: {}};
        Diagnostics.updateJfrScope({value: 'Recording: recording=2 name="Recording-2" duration=10s (stopped)'}, scope);
        expect(scope.jfrEnabled).toBeTruthy();
        expect(scope.isRunning).toBeFalsy();
        expect(scope.isRecording).toBeTruthy();
        expect(scope.jfrSettings.name).toBe("Recording-2");
        expect(scope.jfrSettings.recordingNumber).toBe("2");
    });

    it("Test Java 8 stopped and new recording", function () {
        var scope;
        scope = {jfrSettings: {}};
        Diagnostics.updateJfrScope({value: 'Recording: recording=2 name="Recording-2" duration=10s (stopped)\n\nRecording: recording=3 name="Recording-3" (running)'}, scope);
        expect(scope.jfrEnabled).toBeTruthy();
        expect(scope.isRunning).toBeTruthy();
        expect(scope.isRecording).toBeTruthy();
        expect(scope.jfrSettings.name).toBe("Recording-3");
        expect(scope.jfrSettings.recordingNumber).toBe("3");
    });

    it("Test Java 9 stopped two", function () {
        var scope;
        scope = {jfrSettings: {}};
        Diagnostics.updateJfrScope({value: 'Recording: recording=2 name="Recording-2" duration=10s (stopped)\n\nRecording: recording=3 name="Recording-3" duration=10s (stopped)'}, scope);
        expect(scope.jfrEnabled).toBeTruthy();
        expect(scope.isRunning).toBeFalsy();
        expect(scope.isRecording).toBeTruthy();
        expect(scope.jfrSettings.name).toBe("Recording-2");
        expect(scope.jfrSettings.recordingNumber).toBe("2");
    });

    it("Test Java 9 stopped two and started one", function () {
        var scope;
        scope = {jfrSettings: {}};
        Diagnostics.updateJfrScope({value: 'Recording: recording=1 name="Recording-1" duration=10s (stopped)\n\nRecording: recording=2 name="Recording-2" duration=10s (stopped)\n\nRecording: recording=3 name="Recording-3" maxsize=250,0MB (running)'}, scope);
        expect(scope.jfrEnabled).toBeTruthy();
        expect(scope.isRunning).toBeTruthy();
        expect(scope.isRecording).toBeTruthy();
        expect(scope.jfrSettings.name).toBe("Recording-3");
        expect(scope.jfrSettings.recordingNumber).toBe("3");
    });

    it("Test dump parsing", function () {
        var parsed=Diagnostics.parseDumpFeedback('Dumped recording "Recording-1", 1,1 MB written to:\n\n/Users/marska/Downloads/recording1.jfr');
        expect(parsed.number).toBe("Recording-1");
        expect(parsed.size).toBe("1,1 MB");
        expect(parsed.file).toBe("/Users/marska/Downloads/recording1.jfr");
    });

});
