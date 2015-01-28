package io.hawt.maven;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.Set;
import java.util.TreeMap;
import java.util.TreeSet;

import org.apache.maven.plugin.AbstractMojo;
import org.apache.maven.plugin.MojoExecutionException;
import org.apache.maven.plugin.MojoFailureException;
import org.apache.maven.project.MavenProject;
import org.apache.maven.project.MavenProjectHelper;

import static io.hawt.maven.JSonSchemaHelper.doubleQuote;
import static io.hawt.maven.JSonSchemaHelper.getValue;
import static io.hawt.maven.JSonSchemaHelper.parseJsonSchema;


/**
 * Assembles all the models into one schema that can be used by tooling with enriched information.
 * <p/>
 * This has to be done as a separate goal after all the individual model schema files has been generated,
 * where these models can be linked together in a simpler way that is easier to navigate from tooling.
 *
 * @goal generate-camel-model
 * @execute phase="process-classes"
 */
public class GenerateCamelModelMojo extends AbstractMojo {

    /**
     * The maven project.
     *
     * @parameter property="project"
     * @required
     * @readonly
     */
    protected MavenProject project;

    /**
     * The camel-core directory
     *
     * @parameter default-value="${project.build.directory}"
     */
    protected File buildDir;

    /**
     * The output directory for generated models file
     *
     * @parameter default-value="${project.build.directory}/generated/camel/models"
     */
    protected File outDir;

    /**
     * Maven ProjectHelper.
     *
     * @component
     * @readonly
     */
    private MavenProjectHelper projectHelper;

    private final Properties icons = new Properties();

    /**
     * Execute goal.
     *
     * @throws org.apache.maven.plugin.MojoExecutionException execution of the main class or one of the
     *                                                        threads it generated failed.
     * @throws org.apache.maven.plugin.MojoFailureException   something bad happened...
     */
    public void execute() throws MojoExecutionException, MojoFailureException {
        getLog().info("Assembling Camel model schema");

        initIcons();

        File camelMetaDir = new File(buildDir, "classes/org/apache/camel/model");

        Set<File> jsonFiles = new TreeSet<File>();

        // find all json files in camel-core
        if (buildDir != null && buildDir.isDirectory()) {
            File target = new File(buildDir, "classes/org/apache/camel/model");
            GenerateHelper.findJsonFiles(target, jsonFiles, new GenerateHelper.CamelComponentsModelFilter());
        }

        Map<String, String> eips = new TreeMap<String, String>();
        Map<String, String> rests = new TreeMap<String, String>();
        Map<String, String> languages = new TreeMap<String, String>();
        Map<String, String> dataformats = new TreeMap<String, String>();

        try {
            for (File file : jsonFiles) {
                String name = file.getName();
                if (name.endsWith(".json")) {
                    // special as the maven plugin may be run twice
                    boolean skip = file.getName().equals("camelModel.json");
                    if (skip) {
                        continue;
                    }

                    // strip out .json from the name
                    String modelName = name.substring(0, name.length() - 5);
                    // load the schema
                    String text = GenerateHelper.loadText(new FileInputStream(file));

                    // is it a language?
                    boolean language = file.getParent().endsWith("language");
                    boolean dataformat = file.getParent().endsWith("dataformat");
                    boolean rest = file.getParent().endsWith("rest");
                    if (language) {
                        languages.put(modelName, text);
                    } else if (dataformat) {
                        dataformats.put(modelName, text);
                    } else if (rest) {
                        rests.put(modelName, text);
                    } else {
                        eips.put(modelName, text);
                    }
                }
            }
        } catch (IOException e) {
            throw new MojoFailureException("Error loading model schemas due " + e.getMessage());
        }

        File outFile = new File(camelMetaDir, "camelModel.json");
        try {
            camelMetaDir.mkdirs();

            FileOutputStream fos = new FileOutputStream(outFile, false);
            fos.write("{\n".getBytes());

            // TODO: definitions should be renamed as eips
            fos.write("  \"definitions\": {\n".getBytes());
            Iterator<String> it = eips.keySet().iterator();
            generateSchema("eips", eips, fos, it);
            fos.write("  },\n".getBytes());

            fos.write("  \"rests\": {\n".getBytes());
            it = rests.keySet().iterator();
            generateSchema("rests", rests, fos, it);
            fos.write("  },\n".getBytes());

            fos.write("  \"dataformats\": {\n".getBytes());
            it = dataformats.keySet().iterator();
            generateSchema("dataformats", dataformats, fos, it);
            fos.write("  },\n".getBytes());

            fos.write("  \"languages\": {\n".getBytes());
            it = languages.keySet().iterator();
            generateSchema("languages", languages, fos, it);
            fos.write("  }\n".getBytes());

            fos.write("}\n".getBytes());
            fos.close();

        } catch (Exception e) {
            throw new MojoFailureException("Error writing to file " + outFile);
        }

        getLog().info("Assembled Camel models into combined schema: " + outFile);
    }

    private void initIcons() throws MojoExecutionException {
        try {
            icons.load(GenerateCamelModelMojo.class.getClassLoader().getResourceAsStream("icons.properties"));
        } catch (IOException e) {
            throw new MojoExecutionException("Cannot load list of icons", e);
        }

    }

    private void generateSchema(String schema, Map<String, String> models, FileOutputStream fos, Iterator<String> it) throws IOException {
        while (it.hasNext()) {
            String name = it.next();
            String json = models.get(name);

            StringBuilder sb = new StringBuilder();

            List<Map<String, String>> model = parseJsonSchema("model", json, false);
            List<Map<String, String>> properties = parseJsonSchema("properties", json, true);

            String group = getValue("label", model);
            String title = getValue("title", model);
            String input = getValue("input", model);
            String output = getValue("output", model);
            String nextSiblingAddedAsChild = getValue("nextSiblingAddedAsChild", model);
            String description = getValue("description", model);
            String icon = findIcon(name);

            // skip non categroized
            if (group == null) {
                continue;
            }

            CollectionStringBuffer cst = new CollectionStringBuffer(",\n");
            sb.append("    ").append(doubleQuote(name)).append(": {\n");
            cst.append("      \"type\": \"object\"");
            cst.append("      \"title\": " + doubleQuote(title));
            cst.append("      \"group\": " + doubleQuote(group));
            cst.append("      \"icon\": " + doubleQuote(icon));
            cst.append("      \"description\": " + doubleQuote(description));
            // eips and rests allow to be defined as a graph with inputs and outputs
            if ("eips".equals(schema) || "rests".equals(schema)) {
                cst.append("      \"acceptInput\": " + doubleQuote(input));
                cst.append("      \"acceptOutput\": " + doubleQuote(output));
                cst.append("      \"nextSiblingAddedAsChild\": " + doubleQuote(nextSiblingAddedAsChild));
            }
            sb.append(cst.toString()).append(",\n");

            sb.append("      \"properties\": {\n");
            Iterator<Map<String, String>> it2 = properties.iterator();
            while (it2.hasNext()) {
                Map<String, String> option = it2.next();
                cst = new CollectionStringBuffer(",\n");

                String optionName = option.get("name");
                title = asTitle(optionName);
                String kind = option.get("kind");
                String type = asType(option.get("type"), option.get("javaType"));
                String required = option.get("required");
                description = option.get("description");
                String defaultValue = option.get("defaultValue");
                String enumValues = option.get("enum");

                // skip inputs/outputs
                if ("inputs".equals(optionName) || "outputs".equals(optionName)) {
                    continue;
                }
                sb.append("        ").append(doubleQuote(optionName)).append(": {\n");
                cst.append("          \"kind\": " + doubleQuote(kind));
                cst.append("          \"type\": " + doubleQuote(type));
                if (defaultValue != null) {
                    cst.append("          \"defaultValue\": " + doubleQuote(safeJson(defaultValue)));
                }
                if (enumValues != null) {
                    cst.append("          \"enum\": [ " + safeEnumJson(enumValues) + " ]");
                }
                cst.append("          \"description\": " + doubleQuote(description));
                cst.append("          \"title\": " + doubleQuote(title));
                if ("true".equals(required)) {
                    cst.append("          \"required\": true\n");
                } else {
                    cst.append("          \"required\": false\n");
                }
                sb.append(cst.toString());
                if (it2.hasNext()) {
                    sb.append("        },\n"); // a property
                } else {
                    sb.append("        }\n");  // a property
                }
            }
            sb.append("      }\n"); // properties
            if (it.hasNext()) {
                sb.append("    },\n"); // name
            } else {
                sb.append("    }\n");  // name
            }
            fos.write(sb.toString().getBytes());
        }
    }

    private String findIcon(String name) {
        String answer = icons.getProperty(name);
        if (answer == null) {
            // use generic icon as fallback
            answer = "generic24.png";
        }
        return answer;
    }

    private String asType(String type, String javaType) {
        if ("array".equals(type)) {
            return "array";
        } else if ("string".equals(type)) {
            return "string";
        } else if ("boolean".equals(type)) {
            return "bool";
        } else if ("java.lang.Integer".equals(javaType)) {
            return "number";
        } else if ("org.apache.camel.model.language.ExpressionDefinition".equals(javaType)) {
            return "expression";
        }
        return type;
    }

    private String asTitle(String name) {
        // capitalize the name as tooltip
        return JSonSchemaHelper.asTitle(name);
    }

    private String safeJson(String value) {
        if ("\"".equals(value)) {
            return "\\\"";
        } else if ("\\".equals(value)) {
            return "\\\\";
        } else {
            return value;
        }
    }

    private String safeEnumJson(String values) {
        CollectionStringBuffer cst = new CollectionStringBuffer();
        cst.setSeparator(", ");
        for (String v : values.split(",")) {
            cst.append(doubleQuote(v));
        }
        return cst.toString();
    }
}