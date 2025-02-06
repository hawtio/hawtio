package io.hawt.jetty.security.jaas;

import org.eclipse.jetty.security.jaas.JAASLoginService;
import org.eclipse.jetty.security.jaas.PropertyUserStoreManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class HawtioJAASLoginService extends JAASLoginService {

    public static final Logger LOG = LoggerFactory.getLogger(HawtioJAASLoginService.class);
    private static volatile PropertyUserStoreManager INSTANCE;

    public HawtioJAASLoginService() {
        if (INSTANCE == null) {
            synchronized (HawtioJAASLoginService.class) {
                if (INSTANCE == null) {
                    INSTANCE = new PropertyUserStoreManager();
                    try {
                        INSTANCE.start();
                    } catch (Exception e) {
                        LOG.warn("Failed to start HawtioJAASLoginService: {}", e.getMessage(), e);
                    }
                }
            }
        }
    }

    @Override
    @SuppressWarnings("unchecked")
    public <T> T getBean(Class<T> clazz) {
        if (clazz.isAssignableFrom(PropertyUserStoreManager.class)) {
            return (T) INSTANCE;
        }
        return null;
    }

}
