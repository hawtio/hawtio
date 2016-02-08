package io.hawt.aether;

import org.sonatype.aether.transfer.TransferCancelledException;
import org.sonatype.aether.transfer.TransferEvent;
import org.sonatype.aether.transfer.TransferListener;

import java.io.PrintStream;

/**
 */
public class ConsoleTransferListener implements TransferListener {
    private final PrintStream out;

    public ConsoleTransferListener(PrintStream out) {
        this.out = out;
    }

    public void transferInitiated(TransferEvent event) throws TransferCancelledException {

    }

    public void transferStarted(TransferEvent event) throws TransferCancelledException {
        // TODO

    }

    public void transferProgressed(TransferEvent event) throws TransferCancelledException {
        // TODO

    }

    public void transferCorrupted(TransferEvent event) throws TransferCancelledException {
        // TODO

    }

    public void transferSucceeded(TransferEvent event) {
        // TODO

    }

    public void transferFailed(TransferEvent event) {
        // TODO

    }
}
