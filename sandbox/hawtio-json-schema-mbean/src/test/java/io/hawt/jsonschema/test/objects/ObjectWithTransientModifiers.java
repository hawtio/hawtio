package io.hawt.jsonschema.test.objects;

public class ObjectWithTransientModifiers {

    private String nonTransient;

    private transient String someTransientThing;

    public String getNonTransient() {
        return nonTransient;
    }

    public void setNonTransient(String nonTransient) {
        this.nonTransient = nonTransient;
    }

    public String getSomeTransientThing() {
        return someTransientThing;
    }

    public void setSomeTransientThing(String someTransientThing) {
        this.someTransientThing = someTransientThing;
    }
}
