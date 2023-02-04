package io.hawt.jmx;

import java.lang.management.ManagementFactory;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.management.InstanceAlreadyExistsException;
import javax.management.MBeanServer;
import javax.management.ObjectName;
import javax.management.openmbean.CompositeData;
import javax.management.openmbean.TabularData;

public class QuartzFacade implements QuartzFacadeMBean {

    private ObjectName objectName;
    private MBeanServer mBeanServer;

    public void init() throws Exception {
        if (objectName == null) {
            objectName = getObjectName();
        }

        if (mBeanServer == null) {
            mBeanServer = ManagementFactory.getPlatformMBeanServer();
        }

        if (mBeanServer != null) {
            try {
                mBeanServer.registerMBean(this, objectName);
            } catch (InstanceAlreadyExistsException iaee) {
                // Try to remove and re-register
                mBeanServer.unregisterMBean(objectName);
                mBeanServer.registerMBean(this, objectName);
            }
        }
    }

    public void destroy() throws Exception {
        if (mBeanServer != null) {
            if (objectName != null) {
                mBeanServer.unregisterMBean(objectName);
            }
        }
    }

    protected ObjectName getObjectName() throws Exception {
        return new ObjectName("hawtio:type=QuartzFacade");
    }

    @Override
    public void updateSimpleTrigger(String schedulerObjectName, String triggerName, String groupName, int misfireInstruction,
                                    int repeatCount, long repeatInterval) throws Exception {
        if (schedulerObjectName == null) {
            throw new IllegalArgumentException("Cannot find quartz scheduler with ObjectName: null");
        }

        ObjectName oName = ObjectName.getInstance(schedulerObjectName);
        if (!mBeanServer.isRegistered(oName)) {
            throw new IllegalArgumentException("Cannot find quartz scheduler with ObjectName: " + schedulerObjectName);
        }

        // get existing trigger map
        CompositeData data = (CompositeData) mBeanServer.invoke(oName, "getTrigger", new Object[] { triggerName, groupName }, new String[] { "java.lang.String", "java.lang.String" });
        if (data == null) {
            throw new IllegalArgumentException("Cannot find trigger details for group: " + groupName + " name: " + triggerName);
        }
        // trigger references job - let's get its data
        String jobName = (String) data.get("jobName");
        String jobGroupName = (String) data.get("jobGroup");
        CompositeData jobData = (CompositeData) mBeanServer.invoke(oName, "getJobDetail", new Object[] { jobName, jobGroupName }, new String[] { "java.lang.String", "java.lang.String" });
        if (jobData == null) {
            throw new IllegalArgumentException("Cannot find job details for group: " + jobGroupName + " name: " + jobName);
        }

        Map<String, Object> jobParams = new HashMap<>();
        Map<String, Object> jobDataMap = new HashMap<>();
        initJobParams(jobParams, jobDataMap, jobName, jobGroupName, jobData);

        // also ensure the job data map is up-to-date with the simple trigger changes
        Map<String, Object> triggerParams = new HashMap<>();
        jobDataMap.put("CamelQuartzTriggerType", "simple");
        triggerParams.put("repeatCount", repeatCount);
        jobDataMap.put("CamelQuartzTriggerSimpleRepeatCounter", repeatCount);
        triggerParams.put("repeatInterval", repeatInterval);
        jobDataMap.put("CamelQuartzTriggerSimpleRepeatInterval", repeatInterval);
        triggerParams.put("name", triggerName);
        triggerParams.put("group", groupName);
        triggerParams.put("jobName", jobName);
        triggerParams.put("jobGroup", jobGroupName);
        triggerParams.put("misfireInstruction", misfireInstruction);

        // update trigger
        mBeanServer.invoke(oName, "scheduleBasicJob", new Object[] { jobParams, triggerParams }, new String[] { "java.util.Map", "java.util.Map" });
    }

    @Override
    public void updateCronTrigger(String schedulerObjectName, String triggerName, String groupName, int misfireInstruction,
                                  String cronExpression, String timeZone) throws Exception {
        if (schedulerObjectName == null) {
            throw new IllegalArgumentException("Cannot find quartz scheduler with ObjectName: null");
        }

        ObjectName on = ObjectName.getInstance(schedulerObjectName);
        if (!mBeanServer.isRegistered(on)) {
            throw new IllegalArgumentException("Cannot find quartz scheduler with ObjectName: " + schedulerObjectName);
        }

        // get existing trigger map
        CompositeData data = (CompositeData) mBeanServer.invoke(on, "getTrigger", new Object[] { triggerName, groupName }, new String[] { "java.lang.String", "java.lang.String" });
        if (data == null) {
            throw new IllegalArgumentException("Cannot find trigger details for group: " + groupName + " name: " + triggerName);
        }
        // trigger references job - let's get its data
        String jobName = (String) data.get("jobName");
        String jobGroupName = (String) data.get("jobGroup");
        CompositeData jobData = (CompositeData) mBeanServer.invoke(on, "getJobDetail", new Object[] { jobName, jobGroupName }, new String[] { "java.lang.String", "java.lang.String" });
        if (jobData == null) {
            throw new IllegalArgumentException("Cannot find job details for group: " + jobGroupName + " name: " + jobName);
        }

        Map<String, Object> jobParams = new HashMap<>();
        Map<String, Object> jobDataMap = new HashMap<>();
        initJobParams(jobParams, jobDataMap, jobName, jobGroupName, jobData);

        Map<String, Object> triggerParams = new HashMap<>();
        jobDataMap.put("CamelQuartzTriggerType", "cron");
        // also ensure the job data map is up-to-date with the cron trigger changes
        triggerParams.put("cronExpression", cronExpression);
        jobDataMap.put("CamelQuartzTriggerCronExpression", cronExpression);
        if (timeZone != null) {
            triggerParams.put("timeZone", timeZone);
            jobDataMap.put("CamelQuartzTriggerCronTimeZone", timeZone);
        }
        triggerParams.put("name", triggerName);
        triggerParams.put("group", groupName);
        triggerParams.put("jobName", jobName);
        triggerParams.put("jobGroup", jobGroupName);
        triggerParams.put("misfireInstruction", misfireInstruction);

        // update trigger
        mBeanServer.invoke(on, "scheduleBasicJob", new Object[] { jobParams, triggerParams }, new String[] { "java.util.Map", "java.util.Map" });
    }

    private void initJobParams(Map<String, Object> jobParams, Map<String, Object> jobDataMap, String triggerName, String groupName, CompositeData data) {
        jobParams.put("name", triggerName);
        jobParams.put("group", groupName);
        if (data.get("description") != null) {
            jobParams.put("description", data.get("description"));
        }
        jobParams.put("jobClass", data.get("jobClass"));
        jobParams.put("durability", data.get("durability"));
        jobParams.put("shouldRecover", data.get("shouldRecover"));
        // JMX API with TabularData and CompositeData is cluttered to use
        TabularData tJobDataMap = (TabularData) data.get("jobDataMap");
        for (Object cKey : tJobDataMap.keySet()) {
            Object key = ((List<?>) cKey).get(0);
            CompositeData value = tJobDataMap.get(new Object[] { key });
            if (value != null) {
                Iterator<?> it = value.values().iterator();
                String tKey = (String) it.next();
                Object tValue = it.next();
                jobDataMap.put(tKey, tValue);
            }
        }
        jobParams.put("jobDataMap", jobDataMap);
    }

}
