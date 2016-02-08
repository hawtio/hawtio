/**
 * Copyright (C) 2013 the original author or authors.
 * See the notice.md file distributed with this work for additional
 * information regarding copyright ownership.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package io.hawt.jaxb.dynamic.file;

import io.hawt.introspect.Introspector;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.SortedSet;

import static org.junit.Assert.assertTrue;

/**
 */
public class FindClassFromDynamicJaxbTest extends BlueprintTestSupport {
    private static final transient Logger LOG = LoggerFactory.getLogger(FindClassFromDynamicJaxbTest.class);

    @Test
    public void testFindClass() throws Exception {
        // Lets wait for the async compile of the JAXB classes to work so we have it on the class loader when we search
        Thread.sleep(10000);

        Introspector introspector = getComponent("introspector", Introspector.class);

        assertFoundClass(introspector, "Invoice", "org.apache.invoice.Invoice");
    }

    public static void assertFoundClass(Introspector introspector, String search, String expectedClass) {
        SortedSet<String> classNames = introspector.findClassNames(search, 50);
        LOG.info("For search '" + search + "' we found class names: " + classNames);
        assertTrue("Should have found a class name for search '" + search + "' but didn't find any!", classNames.size() > 0);
        assertTrue("Should have found a class '" + expectedClass + "' for search '" + search + "'", classNames.contains(expectedClass));
    }

}
