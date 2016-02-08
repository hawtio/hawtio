package io.hawt.jmx;

public interface QuartzFacadeMBean {

    /**
     * Updates an existing simple trigger by changing the repeat counter and interval values.
     *
     * @param misfireInstruction the misfire instruction
     * @param repeatCount        the repeat count (use 0 for forever)
     * @param repeatInterval     the repeat interval in millis
     */
    void updateSimpleTrigger(String schedulerObjectName, String triggerName, String groupName, int misfireInstruction,
                             int repeatCount, long repeatInterval) throws Exception;

    /**
     * Updates an existing cron trigger by changing the cron expression
     *
     * @param misfireInstruction the misfire instruction
     * @param cronExpression     the cron expressions
     * @param timeZone           optional time zone
     */
    void updateCronTrigger(String schedulerObjectName, String triggerName, String groupName, int misfireInstruction,
                           String cronExpression, String timeZone) throws Exception;

}
