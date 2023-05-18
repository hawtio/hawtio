package io.hawt.tests.quarkus.cucumber;

import io.cucumber.core.backend.ObjectFactory;
import io.cucumber.core.eventbus.UuidGenerator;
import io.cucumber.core.options.CucumberOptionsAnnotationParser;
import io.cucumber.core.snippets.SnippetType;

public class QuarkusCucumberOptionsProvider implements CucumberOptionsAnnotationParser.OptionsProvider {

    @Override
    public CucumberOptionsAnnotationParser.CucumberOptions getOptions(Class<?> clazz) {
        if (hasOptions(clazz)) {
            CucumberOptions annotation = clazz.getAnnotation(CucumberOptions.class);
            return new QuarkusCucumberOptionsProvider.QuarkusCucumberOptions(annotation);
        }

        return null;
    }

    public boolean hasOptions(Class<?> clazz) {
        return clazz.getAnnotation(CucumberOptions.class) != null;
    }

    /**
     * Options implementation using given annotation to retrieve Cucumber settings.
     */
    private static class QuarkusCucumberOptions implements CucumberOptionsAnnotationParser.CucumberOptions {

        private final CucumberOptions annotation;

        QuarkusCucumberOptions(CucumberOptions annotation) {
            this.annotation = annotation;
        }

        @Override
        public boolean dryRun() {
            return annotation.dryRun();
        }

        @Override
        public String[] features() {
            return annotation.features();
        }

        @Override
        public String[] glue() {
            return annotation.glue();
        }

        @Override
        public String[] extraGlue() {
            return annotation.extraGlue();
        }

        @Override
        public String tags() {
            return annotation.tags();
        }

        @Override
        public String[] plugin() {
            return annotation.plugin();
        }

        @Override
        public boolean publish() {
            return annotation.publish();
        }

        @Override
        public boolean monochrome() {
            return annotation.monochrome();
        }

        @Override
        public String[] name() {
            return annotation.name();
        }

        @Override
        public SnippetType snippets() {
            return annotation.snippets();
        }

        @Override
        public Class<? extends ObjectFactory> objectFactory() {
            return annotation.objectFactory();
        }

        @Override
        public Class<? extends UuidGenerator> uuidGenerator() {
            return annotation.uuidGenerator();
        }
    }
}

