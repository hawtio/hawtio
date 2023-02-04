package io.hawt.embedded;

import org.apache.http.HttpResponse;
import org.apache.http.client.fluent.Request;
import org.junit.Test;

import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.MatcherAssert.assertThat;

public class MainTest {

    @Test
    public void run() throws Exception {
        System.setProperty("hawtio.authenticationEnabled", "false");
        int port = 12345;

        Main main = new Main();
        main.setWarLocation("../hawtio-default/target/");
        main.setPort(port);
        main.run();

        HttpResponse response = Request.Get(String.format("http://localhost:%s/hawtio/jolokia/version", port))
            .execute().returnResponse();
        assertThat(response.getStatusLine().getStatusCode(), equalTo(200));
    }

}
