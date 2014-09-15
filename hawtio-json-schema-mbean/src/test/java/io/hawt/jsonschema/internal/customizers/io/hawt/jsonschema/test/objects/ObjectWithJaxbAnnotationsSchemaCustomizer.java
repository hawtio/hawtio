/**
 *  Copyright 2005-2014 Red Hat, Inc.
 *
 *  Red Hat licenses this file to you under the Apache License, version
 *  2.0 (the "License"); you may not use this file except in compliance
 *  with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
 *  implied.  See the License for the specific language governing
 *  permissions and limitations under the License.
 */
package io.hawt.jsonschema.internal.customizers.io.hawt.jsonschema.test.objects;

import com.fasterxml.jackson.databind.jsonschema.JsonSchema;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.TextNode;
import io.hawt.jsonschema.internal.customizers.JsonSchemaCustomizer;

public class ObjectWithJaxbAnnotationsSchemaCustomizer extends JsonSchemaCustomizer {

    @Override
    public JsonSchema customize(JsonSchema originalSchema) {
        JsonSchema schema = super.customize(originalSchema);
//        schema.asObjectSchema().getProperties().get("SomeOtherProp").asStringSchema().setDefault("default-value");
        ((ObjectNode)schema.getSchemaNode().get("properties").get("SomeOtherProp")).set("default", new TextNode("default-value"));
        return schema;
    }

}
