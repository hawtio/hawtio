package io.hawt.aether;

import org.apache.maven.wagon.Wagon;
import org.sonatype.aether.connector.wagon.WagonProvider;
import org.sonatype.maven.wagon.AhcWagon;

/**
 * A simplistic provider for wagon instances when no Plexus-compatible IoC container is used.
 */
public class ManualWagonProvider implements WagonProvider {

    public Wagon lookup(String roleHint) throws Exception {
        if ("http".equals(roleHint)) {
            return new AhcWagon();
        }
        return null;
    }

    public void release(Wagon wagon) {
    }
}