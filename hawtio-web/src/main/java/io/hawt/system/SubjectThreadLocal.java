package io.hawt.system;

import javax.security.auth.Subject;

/**
 * @author Stan Lewis
 */
public class SubjectThreadLocal {

    private static final ThreadLocal<Subject> tsSubject = new ThreadLocal<Subject>();

    public static void put(Subject subject) {
        tsSubject.set(subject);
    }

    public static Subject take() {
        Subject answer = tsSubject.get();
        tsSubject.remove();
        return answer;
    }
}
