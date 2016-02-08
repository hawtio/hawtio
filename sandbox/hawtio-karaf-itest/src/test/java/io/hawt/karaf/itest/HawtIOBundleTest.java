package io.hawt.karaf.itest;

import java.util.concurrent.Callable;

import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.ops4j.pax.exam.junit.JUnit4TestRunner;

@RunWith(JUnit4TestRunner.class)
public class HawtIOBundleTest extends AbstractFeatureTest {

    @Test
    public void test() throws Exception {
        withinReason(new Callable<Boolean>() {
                 @Override
                 public Boolean call() throws Exception {
                     String out = executeCommand("features:list | grep -i hawtio").trim();
                     Assert.assertTrue(out.contains("installed"));
                     Assert.assertTrue(out.contains("hawtio"));
                     return true;
                 }
             });
    }
}
