package io.hawt.aether;

import io.hawt.config.ConfigFacade;
import io.hawt.config.URLHandler;
import io.hawt.util.MBeanSupport;
import io.hawt.util.Strings;
import org.apache.maven.repository.internal.MavenRepositorySystemSession;
import org.codehaus.plexus.DefaultPlexusContainer;
import org.codehaus.plexus.PlexusContainerException;
import org.codehaus.plexus.component.repository.exception.ComponentLookupException;
import org.sonatype.aether.RepositorySystem;
import org.sonatype.aether.RepositorySystemSession;
import org.sonatype.aether.collection.CollectRequest;
import org.sonatype.aether.collection.DependencyCollectionException;
import org.sonatype.aether.graph.Dependency;
import org.sonatype.aether.graph.DependencyNode;
import org.sonatype.aether.repository.LocalRepository;
import org.sonatype.aether.repository.RemoteRepository;
import org.sonatype.aether.resolution.ArtifactResolutionException;
import org.sonatype.aether.resolution.DependencyRequest;
import org.sonatype.aether.resolution.DependencyResolutionException;
import org.sonatype.aether.util.artifact.DefaultArtifact;
import org.sonatype.aether.util.graph.PreorderNodeListGenerator;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * A facade for working with Aether over JMX
 */
public class AetherFacade extends MBeanSupport implements AetherFacadeMXBean {
    public static final String AETHER_MBEAN_NAME = "hawtio:type=AetherFacade";
    protected static String DEFAULT_EXTENSION = "jar";
    protected static String DEFAULT_CLASSIFIER = "";

    private LocalRepository localRepository;
    private String localRepoDir;
    private RepositorySystem repositorySystem;
    private List<RemoteRepository> remoteRepositories;
    private List<RemoteRepository> defaultRemoteRepositories = Arrays.asList(
            new RemoteRepository("central", "default", "http://repo2.maven.org/maven2/"),
            new RemoteRepository("public.fusesource.com", "default", "http://repo.fusesource.com/nexus/content/groups/public"),
            new RemoteRepository("snapshots.fusesource.com", "default", "http://repo.fusesource.com/nexus/content/groups/public-snapshots"),
            new RemoteRepository("public.sonatype.com", "default", "https://oss.sonatype.org/content/groups/public"),
            new RemoteRepository("maven1.java.net", "default", "http://download.java.net/maven/1"),
            //new RemoteRepository("maven2.jboss.org", "default", "http://repository.jboss.org/maven2"),
            new RemoteRepository("com.springsource.repository.bundles.release", "default", "http://repository.springsource.com/maven/bundles/release"),
            new RemoteRepository("com.springsource.repository.bundles.external", "default", "http://repository.springsource.com/maven/bundles/external"),
            new RemoteRepository("com.springsource.repository.libraries.release", "default", "http://repository.springsource.com/maven/libraries/release"),
            new RemoteRepository("com.springsource.repository.libraries.external", "default", "http://repository.springsource.com/maven/libraries/external")
    );

    @Override
    public void init() throws Exception {
        ConfigFacade.getSingleton().addUrlHandler("mvn", new URLHandler() {
            @Override
            public InputStream openStream(String url) {
                try {
                    return new OpenMavenURL(url).getInputStream();
                } catch (MalformedURLException e) {
                    throw new IllegalArgumentException("Could not parse URL: " + url + ". " + e, e);
                } catch (IOException e) {
                    throw new IllegalArgumentException("Could not read URL: " + url + ". " + e, e);
                }
            }
        });
    }

    @Override
    public String resolveUrlToFileName(String mvnUrl) throws MalformedURLException, ComponentLookupException, DependencyCollectionException, PlexusContainerException, DependencyResolutionException, ArtifactResolutionException {
        MavenURL mavenUrl = new MavenURL(mvnUrl);
        AetherResult result = null;
        result = resolve(mavenUrl.getGroup(), mavenUrl.getArtifact(), mavenUrl.getVersion(), mavenUrl.getType(), mavenUrl.getClassifier());
        if (result != null) {
            List<File> files = result.getFiles();
            if (files.size() > 0) {
                File file = files.get(0);
                return file.getAbsolutePath();
            }
        }
        return null;

    }

    @Override
    public String resolveJson(String mavenCoords) throws ComponentLookupException, DependencyCollectionException, PlexusContainerException, ArtifactResolutionException, DependencyResolutionException {
        // TODO we should really use the MavenURL parser??
        AetherResult result = resolve(mavenCoords);
        return result.jsonString();
    }

    @Override
    public String resolveJson(String groupId, String artifactId, String version, String extension, String classifier) throws ComponentLookupException, DependencyCollectionException, PlexusContainerException, ArtifactResolutionException, DependencyResolutionException {
        AetherResult result = resolve(groupId, artifactId, version, extension, classifier);
        return result.jsonString();
    }

    public AetherResult resolve(String mavenCoords) throws PlexusContainerException, ComponentLookupException, DependencyCollectionException, ArtifactResolutionException, DependencyResolutionException {
        String[] split = mavenCoords.split(":");
        if (split.length < 2) {
            throw new IllegalArgumentException("Expecting string of format 'groupId:artifactId:version' but got '" + mavenCoords + "'");
        }
        String extension = DEFAULT_EXTENSION;
        String classifier = DEFAULT_CLASSIFIER;
        if (split.length > 3) {
            extension = split[3];
        }
        if (split.length > 4) {
            classifier = split[4];
        }
        return resolve(split[0], split[1], split[2], extension, classifier);
    }

    public AetherResult resolve(String groupId, String artifactId, String version, String extension, String classifier) throws PlexusContainerException, ComponentLookupException, DependencyCollectionException, ArtifactResolutionException, DependencyResolutionException {
        if (Strings.isBlank(extension) || extension.equals("bundle")) {
            extension = DEFAULT_EXTENSION;
        }
        if (classifier == null) {
            classifier = DEFAULT_CLASSIFIER;
        }

        RepositorySystemSession session = newSession();
        Dependency dependency = new Dependency(new DefaultArtifact(groupId, artifactId, classifier, extension, version), "runtime");

        CollectRequest collectRequest = new CollectRequest();
        collectRequest.setRoot(dependency);

        List<RemoteRepository> repos = getRemoteRepositories();
        RemoteRepository[] repoArray = new RemoteRepository[repos.size()];
        repos.toArray(repoArray);
        for (RemoteRepository repo : repoArray) {
            collectRequest.addRepository(repo);
        }
        RepositorySystem system = getRepositorySystem();
        DependencyNode rootNode = system.collectDependencies(session, collectRequest).getRoot();
        DependencyRequest dependencyRequest = new DependencyRequest();
        dependencyRequest.setRoot(rootNode);
        system.resolveDependencies(session, dependencyRequest);

        PreorderNodeListGenerator nlg = new PreorderNodeListGenerator();
        rootNode.accept(nlg);

        return new AetherResult(rootNode, nlg.getFiles(), nlg.getClassPath());
    }


    public LocalRepository getLocalRepository() {
        if (localRepository == null) {
            localRepository = new LocalRepository(getLocalRepoDir());
        }
        return localRepository;
    }

    public String getLocalRepoDir() {
        if (localRepoDir == null) {
            localRepoDir = System.getProperty("user.home", ".") + "/.m2/repository";
        }
        return localRepoDir;
    }

    public void setLocalRepoDir(String localRepoDir) {
        this.localRepoDir = localRepoDir;
    }

    public RepositorySystem getRepositorySystem() throws PlexusContainerException, ComponentLookupException {
        if (repositorySystem == null) {
            repositorySystem = newManualSystem();
        }
        return repositorySystem;
    }

    public void setRepositorySystem(RepositorySystem repositorySystem) {
        this.repositorySystem = repositorySystem;
    }

    public List<RemoteRepository> getRemoteRepositories() {
        if (remoteRepositories == null) {
            remoteRepositories = new ArrayList<RemoteRepository>();
            remoteRepositories.addAll(defaultRemoteRepositories);
        }
        return remoteRepositories;
    }

    public void setRemoteRepositories(List<RemoteRepository> remoteRepositories) {
        this.remoteRepositories = remoteRepositories;
    }

    @Override
    protected String getDefaultObjectName() {
        return AETHER_MBEAN_NAME;
    }

    protected RepositorySystem newManualSystem() throws PlexusContainerException, ComponentLookupException {
       /*
           val locator = new DefaultServiceLocator()
           locator.setServices(classOf[WagonProvider], new ManualWagonProvider())
           locator.addService(classOf[RepositoryConnectorFactory], classOf[WagonRepositoryConnectorFactory])
           return locator.getService(classOf[RepositorySystem])
       */
        return new DefaultPlexusContainer().lookup(RepositorySystem.class);
    }

    protected RepositorySystemSession newSession() throws PlexusContainerException, ComponentLookupException {
        MavenRepositorySystemSession session = new MavenRepositorySystemSession();
        session.setLocalRepositoryManager(getRepositorySystem().newLocalRepositoryManager(getLocalRepository()));

        session.setTransferListener(new ConsoleTransferListener(System.out));
        session.setRepositoryListener(new ConsoleRepositoryListener());

        // uncomment to generate dirty trees
        // session.setDependencyGraphTransformer( null )
        return session;
    }
}
