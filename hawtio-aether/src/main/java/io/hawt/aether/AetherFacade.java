package io.hawt.aether;

import io.hawt.config.ConfigFacade;
import io.hawt.config.URLHandler;
import io.hawt.util.MBeanSupport;
import io.hawt.util.Strings;
import org.apache.maven.repository.internal.MavenRepositorySystemSession;
import org.codehaus.plexus.DefaultPlexusContainer;
import org.codehaus.plexus.PlexusContainerException;
import org.codehaus.plexus.component.repository.exception.ComponentLookupException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.sonatype.aether.RepositorySystem;
import org.sonatype.aether.RepositorySystemSession;
import org.sonatype.aether.artifact.Artifact;
import org.sonatype.aether.collection.CollectRequest;
import org.sonatype.aether.collection.DependencyCollectionException;
import org.sonatype.aether.graph.Dependency;
import org.sonatype.aether.graph.DependencyNode;
import org.sonatype.aether.repository.Authentication;
import org.sonatype.aether.repository.LocalRepository;
import org.sonatype.aether.repository.RemoteRepository;
import org.sonatype.aether.repository.RepositoryPolicy;
import org.sonatype.aether.resolution.ArtifactRequest;
import org.sonatype.aether.resolution.ArtifactResolutionException;
import org.sonatype.aether.resolution.ArtifactResult;
import org.sonatype.aether.resolution.DependencyRequest;
import org.sonatype.aether.resolution.DependencyResolutionException;
import org.sonatype.aether.util.artifact.DefaultArtifact;
import org.sonatype.aether.util.graph.PreorderNodeListGenerator;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * A facade for working with Aether over JMX
 */
public class AetherFacade extends MBeanSupport implements AetherFacadeMXBean {
    private static final transient Logger LOG = LoggerFactory.getLogger(AetherFacade.class);

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
                    throw new IllegalArgumentException("Could not parse URL: " + url + " for remote URLs " + getRemoteUrlsText() + ". " + e, e);
                } catch (IOException e) {
                    throw new IllegalArgumentException("Could not read URL: " + url + " for remote URLs " + getRemoteUrlsText() + ". " + e, e);
                }
            }
        });
        super.init();
    }

    protected String getRemoteUrlsText() {
        StringBuilder buffer = new StringBuilder();
        List<RemoteRepository> list = getRemoteRepositories();
        for (RemoteRepository repo : list) {
            String url = repo.getUrl();
            if (Strings.isNotBlank(url)) {
                if (buffer.length() > 0) {
                    buffer.append(", ");
                }
                buffer.append(url);
            }
        }
        return buffer.toString();
    }

    @Override
    public String resolveArtifactUrlToFileName(String mvnUrl) throws MalformedURLException, ComponentLookupException, DependencyCollectionException, PlexusContainerException, DependencyResolutionException, ArtifactResolutionException {
        MavenURL mavenUrl = new MavenURL(mvnUrl);
        ArtifactResult result = resolveArtifact(mavenUrl.getGroup(), mavenUrl.getArtifact(), mavenUrl.getVersion(), mavenUrl.getType(), mavenUrl.getClassifier());
        return artifactResultToFilePath(result);
    }

    @Override
    public String resolveArtifactUrlAndRepositoriesToFileName(String mvnUrl, String repositoryUrls) throws MalformedURLException, ComponentLookupException, DependencyCollectionException, PlexusContainerException, DependencyResolutionException, ArtifactResolutionException {
        MavenURL mavenUrl = new MavenURL(mvnUrl);
        ArtifactResult result = resolveArtifactFromUrls(mavenUrl.getGroup(), mavenUrl.getArtifact(), mavenUrl.getVersion(), mavenUrl.getType(), mavenUrl.getClassifier(), splitRepoUrlsWithComma(repositoryUrls));
        return artifactResultToFilePath(result);
    }

    protected static String artifactResultToFilePath(ArtifactResult result) {
        if (result != null) {
            Artifact artifact = result.getArtifact();
            if (artifact != null) {
                File file = artifact.getFile();
                if (file != null) {
                    return file.getAbsolutePath();
                }
            }
        }
        return null;
    }

    @Override
    public String resolveUrlToFileName(String mvnUrl) throws MalformedURLException, ComponentLookupException, DependencyCollectionException, PlexusContainerException, DependencyResolutionException, ArtifactResolutionException {
        MavenURL mavenUrl = new MavenURL(mvnUrl);
        AetherResult result = resolve(mavenUrl.getGroup(), mavenUrl.getArtifact(), mavenUrl.getVersion(), mavenUrl.getType(), mavenUrl.getClassifier());
        return aetherResultToFilePath(result);

    }

    @Override
    public String resolveUrlAndRepositoriesToFileName(String mvnUrl, String repositoryUrls) throws MalformedURLException, ComponentLookupException, DependencyCollectionException, PlexusContainerException, DependencyResolutionException, ArtifactResolutionException {
        MavenURL mavenUrl = new MavenURL(mvnUrl);
        AetherResult result = resolveFromUrls(mavenUrl.getGroup(), mavenUrl.getArtifact(), mavenUrl.getVersion(), mavenUrl.getType(), mavenUrl.getClassifier(), splitRepoUrlsWithComma(repositoryUrls));
        return aetherResultToFilePath(result);
    }

    public static List<String> splitRepoUrlsWithComma(String repos) {
        if (Strings.isNotBlank(repos)) {
            String[] array = repos.split(",");
            if (array != null) {
                return Arrays.asList(array);
            }
        }
        return Arrays.asList();
    }

    protected static String aetherResultToFilePath(AetherResult result) {
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

    /**
     * Resolves the given artifact without using Aether directly
     */
    public ArtifactResult resolveArtifact(String groupId, String artifactId, String version, String extension, String classifier) throws DependencyCollectionException, ArtifactResolutionException, DependencyResolutionException, PlexusContainerException, ComponentLookupException {
        List<RemoteRepository> repositories = getRemoteRepositories();
        return resolveArtifact(groupId, artifactId, version, extension, classifier, repositories);
    }


    /**
     * Resolves the given artifact without using Aether directly
     */
    public ArtifactResult resolveArtifactFromUrls(String groupId, String artifactId, String version, String extension, String classifier, List<String> repositoryUrls) throws DependencyCollectionException, ArtifactResolutionException, DependencyResolutionException, PlexusContainerException, ComponentLookupException {
        List<RemoteRepository> repositories = urlsToRemoteRepositories(repositoryUrls);
        LOG.info("resolveArtifactFromUrls: " + groupId + "/" + artifactId + "/" + version + "/" + extension + "/" + classifier + " in remote repos: " + repositories);
        return resolveArtifact(groupId, artifactId, version, extension, classifier, repositories);
    }

    public List<RemoteRepository> urlsToRemoteRepositories(List<String> repositoryUrls) {
        List<RemoteRepository> repositories = new ArrayList<>();
        int count = 1;
        for (String repositoryUrl : repositoryUrls) {
            RemoteRepository repo = createRemoteRepositoryFromUrl(repositoryUrl, count++);
            if (repo != null) {
                repositories.add(repo);
            }
        }
        if (repositories.isEmpty()) {
            return getRemoteRepositories();
        }
        return repositories;
    }

    public static RemoteRepository createRemoteRepositoryFromUrl(String repositoryUrl, int count) {
        if (repositoryUrl == null) {
            return null;
        }
        String text = repositoryUrl.trim();
        if (Strings.isBlank(text)) {
            return null;
        }

        // let's first extract authentication information
        Authentication authentication = getAuthentication(text);
        if (authentication != null) {
            text = text.replaceFirst(String.format("%s:%s@", authentication.getUsername(), authentication.getPassword()), "");
        }

        String id = null;
        boolean snapshot = false;
        while (true) {
            int idx = text.lastIndexOf('@');
            if (idx <= 0) {
                break;
            }
            String postfix = text.substring(idx + 1);
            if (postfix.equals("snapshots")) {
                snapshot = true;
            } else if (postfix.equals("noreleases")) {
                // TODO
            } else if (postfix.startsWith("id=")) {
                id = postfix.substring(3);
            } else {
                LOG.warn("Unknown postfix: @" + postfix + " on repository URL: " + text);
                break;
            }
            text = text.substring(0, idx);
        }
        if (Strings.isBlank(id)) {
            id = "repo" + count;
        }
        RemoteRepository repository = new RemoteRepository(id, "default", text);
        RepositoryPolicy policy = new RepositoryPolicy(true, RepositoryPolicy.UPDATE_POLICY_DAILY, RepositoryPolicy.CHECKSUM_POLICY_WARN);
        repository.setPolicy(snapshot, policy);
        repository.setAuthentication(authentication);
        return repository;
    }

    /*
     * Get the {@link Authentication} instance if the URL contains credentials, otherwise return null
     */
    protected static Authentication getAuthentication(String text) {
        Authentication authentication = null;
        try {
            URL url = new URL(text);
            String authority = url.getUserInfo();
            if (Strings.isNotBlank(authority)) {
                String[] parts = authority.split(":");
                if (parts.length == 2) {
                    authentication = new Authentication(parts[0], parts[1]);
                }
            }
        } catch (MalformedURLException e) {
            LOG.warn("{} does not look like a valid repository URL", text);
        }
        return authentication;
    }


    public ArtifactResult resolveArtifact(String groupId, String artifactId, String version, String extension, String classifier, List<RemoteRepository> repositories) throws PlexusContainerException, ComponentLookupException, ArtifactResolutionException {
        RepositorySystemSession session = newSession();
        RepositorySystem system = getRepositorySystem();
        ArtifactRequest request = new ArtifactRequest();
        request.setArtifact(new DefaultArtifact(groupId, artifactId, classifier, extension, version));
        request.setRepositories(repositories);
        return system.resolveArtifact(session, request);
    }

    public AetherResult resolve(String groupId, String artifactId, String version, String extension, String classifier) throws PlexusContainerException, ComponentLookupException, DependencyCollectionException, ArtifactResolutionException, DependencyResolutionException {
        List<RemoteRepository> repos = getRemoteRepositories();
        return resolve(groupId, artifactId, version, extension, classifier, repos);
    }

    public AetherResult resolveFromUrls(String groupId, String artifactId, String version, String extension, String classifier, List<String> repositoryUrls) throws PlexusContainerException, ComponentLookupException, DependencyCollectionException, DependencyResolutionException {
        List<RemoteRepository> repositories = urlsToRemoteRepositories(repositoryUrls);
        LOG.info("resolveFromUrls: " + groupId + "/" + artifactId + "/" + version + "/" + extension + "/" + classifier + " in remote repositories: " + repositories);
        return resolve(groupId, artifactId, version, extension, classifier, repositories);
    }

    public AetherResult resolve(String groupId, String artifactId, String version, String extension, String classifier, List<RemoteRepository> repos) throws PlexusContainerException, ComponentLookupException, DependencyCollectionException, DependencyResolutionException {
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
