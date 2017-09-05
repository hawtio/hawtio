package io.hawt.embedded;

import org.apache.http.HttpResponse;
import org.apache.http.client.fluent.Request;
import org.junit.Test;

import static org.hamcrest.CoreMatchers.equalTo;
import static org.junit.Assert.assertThat;

public class MainTest {

    @Test
    public void run() throws Exception {
        System.setProperty("hawtio.authenticationEnabled", "false");

        Main main = new Main();
        main.setWarLocation("../hawtio-default/target/");
        main.run();

        HttpResponse response = Request.Get("http://localhost:8080/hawtio/jolokia/version")
            .execute().returnResponse();
        assertThat(response.getStatusLine().getStatusCode(), equalTo(200));
    }

}
