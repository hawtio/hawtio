source env_init.sh
export VNC_NO_PASSWORD=true
Xvfb :99 -screen 0 1920x1080x24 &
/opt/bin/start-vnc.sh &
/opt/bin/start-novnc.sh &
CMD="mvn verify -ntp -Dselenide.browserSize=1920x1080 -Dchromeoptions.args='--disable-dev-shm-usage' -Pe2e -pl :hawtio-test-suite -am -Dio.hawt.test.ci -Dhawtio-container -P!local-test-app-dependency $@"
echo running: $CMD
eval $CMD
