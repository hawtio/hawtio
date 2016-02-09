package io.hawt.introspect.dummy;

import java.util.Date;

public class SomeBean {
    private String name;
    private int age;
    private Date readOnly;
    private Long writeOnly;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    public Date getReadOnly() {
        return readOnly;
    }

    public void setWriteOnly(Long writeOnly) {
        this.writeOnly = writeOnly;
    }
}
