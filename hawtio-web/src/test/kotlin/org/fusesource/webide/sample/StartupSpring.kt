package org.fusesource.webide.sample

import javax.servlet.ServletContainerInitializer
import javax.servlet.ServletContext
import org.springframework.context.support.ClassPathXmlApplicationContext
import org.springframework.web.context.support.WebApplicationContextUtils
import org.springframework.web.context.ContextLoaderListener

class StartupSpring: ServletContainerInitializer {
    public override fun onStartup(c: Set<Class<out Any?>?>?, ctx: ServletContext?) {
        println("============ Starting up the spring XML")
        if (ctx != null) {
            val appContext = ClassPathXmlApplicationContext("applicationContext.xml")
            appContext.setClassLoader(ctx.getClassLoader())
            appContext.start()
        }
    }
}