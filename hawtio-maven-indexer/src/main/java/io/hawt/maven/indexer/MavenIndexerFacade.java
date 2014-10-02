package io.hawt.maven.indexer;

import io.hawt.config.ConfigFacade;
import io.hawt.util.FileLocker;
import io.hawt.util.MBeanSupport;
import io.hawt.util.Strings;
import org.apache.lucene.search.BooleanClause.Occur;
import org.apache.lucene.search.BooleanQuery;
import org.apache.lucene.search.Query;
import org.apache.maven.index.*;
import org.apache.maven.index.context.ContextMemberProvider;
import org.apache.maven.index.context.IndexCreator;
import org.apache.maven.index.context.IndexingContext;
import org.apache.maven.index.context.StaticContextMemberProvider;
import org.apache.maven.index.expr.SourcedSearchExpression;
import org.apache.maven.index.expr.UserInputSearchExpression;
import org.apache.maven.index.search.grouping.GAGrouping;
import org.apache.maven.index.updater.*;
import org.apache.maven.wagon.Wagon;
import org.apache.maven.wagon.events.TransferEvent;
import org.apache.maven.wagon.events.TransferListener;
import org.apache.maven.wagon.observers.AbstractTransferListener;
import org.codehaus.plexus.DefaultPlexusContainer;
import org.codehaus.plexus.PlexusContainer;
import org.codehaus.plexus.util.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.*;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * A facade over the Maven indexer code so its easy to query repositories
 */
public class MavenIndexerFacade extends MBeanSupport implements MavenIndexerFacadeMXBean {
    private static final transient Logger LOG = LoggerFactory.getLogger(MavenIndexerFacade.class);

    // cap at 10 thousand
    private static final int SEARCH_LIMIT = 10000;

    private PlexusContainer plexusContainer;
    private Indexer indexer;
    private IndexUpdater indexUpdater;
    private Wagon httpWagon;
    private IndexingContext mergedContext;
    private List<IndexCreator> indexers;
    private boolean updateIndexOnStartup = true;
    private int maximumIndexersPerMachine = 20;
    private String[] repositories = {
            "https://repo1.maven.org/maven2@central"
    };
    private String cacheDirName;
    private File cacheDirectory;
    private Map<String, IndexingContext> indexContexts = new HashMap<String, IndexingContext>();
    private FileLocker fileLock;
    private String lockFileName = "hawtio.lock";
    private final AtomicBoolean indexing = new AtomicBoolean();
    private int failedRepos = 0;

    public MavenIndexerFacade() {
    }

    public void init() throws Exception {
        // do our logic in init
        LOG.debug("Initializing MavenIndexer ... ");
        this.plexusContainer = new DefaultPlexusContainer();
        this.indexer = plexusContainer.lookup(Indexer.class);
        this.indexUpdater = plexusContainer.lookup(IndexUpdater.class);
        this.httpWagon = plexusContainer.lookup(Wagon.class, "http");

        // Creators we want to use (search for fields it defines)
        if (indexers == null) {
            indexers = new ArrayList<IndexCreator>();
            indexers.add(plexusContainer.lookup(IndexCreator.class, "min"));
            indexers.add(plexusContainer.lookup(IndexCreator.class, "jarContent"));
            indexers.add(plexusContainer.lookup(IndexCreator.class, "maven-plugin"));
        }

        File dir = getCacheDirectory();
        LOG.info("Storing maven index files in local directory: " + dir.getAbsolutePath());

        // now lets create all the indexers
        indexing.set(true);

        for (String repository : repositories) {
            try {
                if (StringUtils.isNotBlank(repository)) {
                    String url = repository;
                    String id = repository;
                    int idx = repository.indexOf('@');
                    if (idx > 0) {
                        url = repository.substring(0, idx);
                        id = repository.substring(idx + 1);
                    }
                    File repoDir = new File(dir, id);
                    File cacheDir = new File(repoDir, "cache");
                    File indexDir = new File(repoDir, "index");
                    cacheDir.mkdirs();
                    indexDir.mkdirs();
                    String contextId = id + "-context";

                    IndexingContext repoContext = indexer.createIndexingContext(contextId, id, cacheDir, indexDir,
                            url, null, true, true, indexers);
                    indexContexts.put(id, repoContext);
                }
                File mergedDir = new File(dir, "all");
                File cacheDir = new File(mergedDir, "cache");
                File indexDir = new File(mergedDir, "index");
                ContextMemberProvider members = new StaticContextMemberProvider(indexContexts.values());
                mergedContext = indexer.createMergedIndexingContext("all-context", "all", cacheDir, indexDir, true, members);

            } catch (Exception e) {
                failedRepos++;
                LOG.warn("Failed to fetch Maven repository: {}", repository, e);
            }
        }
        if (updateIndexOnStartup) {
            downloadOrUpdateIndices();
        }

        indexing.set(false);
        try {
            super.init();
        } catch (Exception e) {
            LOG.error("Failed to register MBean: " + e, e);
        }

        LOG.debug("Initializing MavenIndexer done");
    }

    public void downloadOrUpdateIndices() throws IOException {
        Set<Map.Entry<String, IndexingContext>> entries = indexContexts.entrySet();

        if (!entries.isEmpty()) {
            LOG.info("Maven repos to be indexed: [{}]", getRepositories());
            LOG.info("Updating maven indices. This may take a while, please be patient...");
        }

        for (Map.Entry<String, IndexingContext> entry : entries) {
            final String contextId = entry.getKey();
            try {

                IndexingContext context = entry.getValue();
                Date contextTime = context.getTimestamp();

                TransferListener listener = new AbstractTransferListener() {
                    public void transferStarted(TransferEvent transferEvent) {
                        LOG.debug(contextId + ": Downloading " + transferEvent.getResource().getName());
                    }

                    public void transferProgress(TransferEvent transferEvent, byte[] buffer, int length) {
                    }

                    public void transferCompleted(TransferEvent transferEvent) {
                        LOG.debug(contextId + ": Download complete");
                    }
                };
                ResourceFetcher resourceFetcher = new WagonHelper.WagonFetcher(httpWagon, listener, null, null);

                IndexUpdateRequest updateRequest = new IndexUpdateRequest(context, resourceFetcher);
                IndexUpdateResult updateResult = indexUpdater.fetchAndUpdateIndex(updateRequest);
                if (updateResult.isFullUpdate()) {
                    LOG.debug(contextId + ": Full index update completed on index");
                } else {
                    Date timestamp = updateResult.getTimestamp();
                    if (timestamp != null && timestamp.equals(contextTime)) {
                        LOG.debug(contextId + ": No index update needed, index is up to date!");
                    } else {
                        LOG.debug(contextId + ": Incremental update happened, change covered " + contextTime + " - " + timestamp + " period.");
                    }
                }

            } catch (Exception e) {
                failedRepos++;
                LOG.warn("Failed to fetch Maven repository:", contextId , e);
            }
        }

        if (!entries.isEmpty()) {
            LOG.info("Updated successfully {}/{} maven indexes.", entries.size() - failedRepos, entries.size());
        }
    }

    public void destroy() throws Exception {
        try {
            if (indexing.get()) {
                LOG.warn("Destroying MavenIndexer while indexing is still in progress, this could lead to errors ... ");
            } else {
                LOG.debug("Destroying MavenIndexer ... ");
            }

            if (fileLock != null) {
                fileLock.destroy();
            }
            if (indexer != null) {
                for (IndexingContext context : indexContexts.values()) {
                    // close cleanly
                    indexer.closeIndexingContext(context, false);
                }
                indexContexts.clear();
            }
        } finally{
            super.destroy();
        }
    }

    public boolean isUpdateIndexOnStartup() {
        return updateIndexOnStartup;
    }

    public void setUpdateIndexOnStartup(boolean updateIndexOnStartup) {
        this.updateIndexOnStartup = updateIndexOnStartup;
    }

    public List<IndexCreator> getIndexers() {
        return indexers;
    }

    public void setIndexers(List<IndexCreator> indexers) {
        this.indexers = indexers;
    }

    @Override
    public String getRepositories() {
        String result = "";
        for (int i = 0; i < repositories.length; i++) {
            result += repositories[i];
            if (i < repositories.length - 1) {
                result += ",";
            }
        }
        return result;
    }

    /**
     * Param is a String, instead of a String[] to support properties replacement in blueprint
     * @param repositories
     */
    public void setRepositories(String repositories) {
        if (Strings.isBlank(repositories)) {
            this.repositories = new String[0];
        } else {
            repositories = repositories.trim();
            String[] input = repositories.split(",");
            List<String> result = new ArrayList<>(input.length);
            for (int i = 0; i < input.length; i++) {
                String url = input[i].trim();
                url = url.trim();
                try{
                    new URL(url);
                    result.add(url);
                } catch(MalformedURLException e){
                    LOG.error("Discarding unsupported URL provided to Maven Indexer Service: {}", url, e );
                }
            }
            result.toArray(this.repositories);
        }
    }

    public int getMaximumIndexersPerMachine() {
        return maximumIndexersPerMachine;
    }

    /**
     * If we do not specify the directory to use for caches, then create a directory per process
     * up to this maximum number
     */
    public void setMaximumIndexersPerMachine(int maximumIndexersPerMachine) {
        this.maximumIndexersPerMachine = maximumIndexersPerMachine;
    }

    public String getCacheDirName() {
        return cacheDirName;
    }

    public void setCacheDirName(String cacheDirName) {
        this.cacheDirName = cacheDirName;
    }

    public File getCacheDirectory() {
        if (cacheDirectory == null) {
            String name = getCacheDirName();
            if (Strings.isNotBlank(name)) {
                cacheDirectory = new File(name);
            } else {
                File dir = new File(".");
                name = "mavenIndex";
                ConfigFacade configFacade = ConfigFacade.getSingleton();
                if (configFacade != null) {
                    dir = configFacade.getConfigDirectory();
                }

                String postfix = "";
                for (int i = 2; i < maximumIndexersPerMachine; i++) {
                    File tryDir = new File(dir, name + postfix);
                    fileLock = FileLocker.getLock(new File(tryDir, lockFileName));
                    if (fileLock != null) {
                        cacheDirectory = tryDir;
                        break;
                    } else {
                        LOG.warn("Cannot lock directory {} as file lock {} present."
                                + " If there are no other processes running hawtio, then the lock is likely orphaned and can be deleted.", tryDir, lockFileName);
                    }
                    postfix = "-" + i;
                }
                if (cacheDirectory == null) {
                    LOG.warn("Could not find a directory inside of " + dir.getAbsolutePath()
                            + " which did not have a lock file " + lockFileName
                            + " so giving up after " + maximumIndexersPerMachine + " attempt(s).");
                }
            }
        }
        return cacheDirectory;
    }

    public void setCacheDirectory(File cacheDirectory) {
        this.cacheDirectory = cacheDirectory;
    }

    // Search APIs
    //-------------------------------------------------------------------------

    @Override
    public List<ArtifactDTO> search(String groupId, String artifactId, String version, String packaging, String classifier, String className) throws IOException {
        BooleanQuery bq = createQuery(groupId, artifactId, version, packaging, classifier, className);
        return searchGrouped(bq);
    }

    @Override
    public List<ArtifactDTO> searchFlat(String groupId, String artifactId, String version, String packaging, String classifier, String className) throws IOException {
        BooleanQuery bq = createQuery(groupId, artifactId, version, packaging, classifier, className);
        return searchFlat(bq);
    }

    /**
     * Attempts to search for the artifact with the given class name.
     * <p/>
     * Note that the central repository does not index class names
     */
    @Override
    public List<ArtifactDTO> searchClasses(String classNameSearchText) throws IOException {
        Query query = indexer.constructQuery(MAVEN.CLASSNAMES, new UserInputSearchExpression(classNameSearchText));
        return searchGrouped(query);
    }


    /**
     * Attempts to search the maven repositories given some text to search for
     */
    @Override
    public List<ArtifactDTO> searchText(String searchText) throws IOException {
        BooleanQuery bq = createTextSearchQuery(searchText);
        return searchGrouped(bq);
    }

    @Override
    public List<ArtifactDTO> searchTextAndPackaging(String searchText, String packaging, String classifier) throws IOException {
        BooleanQuery bq = new BooleanQuery();
        if (StringUtils.isNotBlank(searchText)) {
            BooleanQuery textQuery = createTextSearchQuery(searchText);
            textQuery.setMinimumNumberShouldMatch(1);
            bq.add(textQuery, Occur.MUST);
        }

        if (StringUtils.isNotBlank(packaging)) {
            bq.add(indexer.constructQuery(MAVEN.PACKAGING, new SourcedSearchExpression(packaging)), Occur.MUST);
        }
        if (StringUtils.isNotBlank(classifier)) {
            bq.add(indexer.constructQuery(MAVEN.CLASSIFIER, new SourcedSearchExpression(classifier)), Occur.MUST);
        }
        return searchGrouped(bq);
    }

    public List<ArtifactDTO> searchGrouped(Query query) throws IOException {
        return searchGrouped(query, new GAGrouping());
    }

    public List<ArtifactDTO> searchGrouped(Query query, GAGrouping grouping) throws IOException {
        List<ArtifactDTO> answer = new ArrayList<ArtifactDTO>();
        GroupedSearchResponse response = indexer.searchGrouped(new GroupedSearchRequest(query, grouping, mergedContext));

        int index = 0;
        for (Map.Entry<String, ArtifactInfoGroup> entry : response.getResults().entrySet()) {
            ArtifactInfo ai = entry.getValue().getArtifactInfos().iterator().next();
            ArtifactDTO dto = createArtifactDTO(ai);
            answer.add(dto);
            if (++index > SEARCH_LIMIT) {
                break;
            }
        }
        return answer;
    }

    public List<ArtifactDTO> searchFlat(BooleanQuery q) throws IOException {
        List<ArtifactDTO> answer = new ArrayList<ArtifactDTO>();
        FlatSearchResponse response = indexer.searchFlat(new FlatSearchRequest(q, mergedContext));

        int index = 0;
        for (ArtifactInfo ai : response.getResults()) {
            ArtifactDTO dto = createArtifactDTO(ai);
            answer.add(dto);
            if (++index > SEARCH_LIMIT) {
                break;
            }
        }
        return answer;
    }

    @Override
    public List<String> groupIdComplete(String groupId, String packaging, String classifier) throws IOException {
        BooleanQuery bq = createQuery(endWithStarIfNotBlank(groupId), null, null, packaging, classifier, null);
        Set<String> set = new TreeSet<String>();
        FlatSearchResponse response = indexer.searchFlat(new FlatSearchRequest(bq, mergedContext));

        int index = 0;
        for (ArtifactInfo ai : response.getResults()) {
            set.add(ai.groupId);
            if (++index > SEARCH_LIMIT) {
                break;
            }
        }
        return new ArrayList<String>(set);
    }

    @Override
    public List<String> artifactIdComplete(String groupId, String artifactId, String packaging, String classifier) throws IOException {
        BooleanQuery bq = createQuery(groupId, endWithStarIfNotBlank(artifactId), null, packaging, classifier, null);
        Set<String> set = new TreeSet<String>();
        FlatSearchResponse response = indexer.searchFlat(new FlatSearchRequest(bq, mergedContext));

        int index = 0;
        for (ArtifactInfo ai : response.getResults()) {
            set.add(ai.artifactId);
            if (++index > SEARCH_LIMIT) {
                break;
            }
        }
        return new ArrayList<String>(set);
    }

    @Override
    public List<String> versionComplete(String groupId, String artifactId, String version, String packaging, String classifier) throws IOException {
        BooleanQuery bq = createQuery(groupId, artifactId, endWithStarIfNotBlank(version), packaging, classifier, null);
        Set<String> set = new TreeSet<String>();

        int index = 0;
        FlatSearchResponse response = indexer.searchFlat(new FlatSearchRequest(bq, mergedContext));
        for (ArtifactInfo ai : response.getResults()) {
            set.add(ai.version);
            if (++index > SEARCH_LIMIT) {
                break;
            }
        }
        return new ArrayList<String>(set);
    }

    protected BooleanQuery createQuery(String groupId, String artifactId, String version, String packaging, String classifier, String className) {
        BooleanQuery bq = new BooleanQuery();
        if (StringUtils.isNotBlank(groupId)) {
            bq.add(indexer.constructQuery(MAVEN.GROUP_ID, new SourcedSearchExpression(groupId)), Occur.MUST);
        }
        if (StringUtils.isNotBlank(artifactId)) {
            bq.add(indexer.constructQuery(MAVEN.ARTIFACT_ID, new SourcedSearchExpression(artifactId)), Occur.MUST);
        }
        if (StringUtils.isNotBlank(version)) {
            bq.add(indexer.constructQuery(MAVEN.VERSION, new SourcedSearchExpression(version)), Occur.MUST);
        }
        if (StringUtils.isNotBlank(packaging)) {
            bq.add(indexer.constructQuery(MAVEN.PACKAGING, new SourcedSearchExpression(packaging)), Occur.MUST);
        }
        if (StringUtils.isNotBlank(classifier)) {
            bq.add(indexer.constructQuery(MAVEN.CLASSIFIER, new SourcedSearchExpression(classifier)), Occur.MUST);
        }
        if (StringUtils.isNotBlank(className)) {
            bq.add(indexer.constructQuery(MAVEN.CLASSNAMES, new UserInputSearchExpression(className)), Occur.MUST);
        }
        return bq;
    }

    // Implementation methods
    //-------------------------------------------------------------------------

    protected BooleanQuery createTextSearchQuery(String searchText) {
        BooleanQuery bq = new BooleanQuery();
        if (StringUtils.isNotBlank(searchText)) {
            //Field[] names = {MAVEN.CLASSNAMES, MAVEN.GROUP_ID, MAVEN.ARTIFACT_ID, MAVEN.VERSION, MAVEN.NAME, MAVEN.DESCRIPTION};
            Field[] names = {MAVEN.GROUP_ID, MAVEN.ARTIFACT_ID, MAVEN.VERSION, MAVEN.NAME};
            UserInputSearchExpression input = new UserInputSearchExpression(searchText);
            for (Field name : names) {
                bq.add(indexer.constructQuery(name, input), Occur.SHOULD);
            }
        }
        return bq;
    }

    @Override
    protected String getDefaultObjectName() {
        return "hawtio:type=Indexer";
    }

    /**
     * If the string is not blank then return a trimmed version of it ending in *
     */
    protected String endWithStarIfNotBlank(String text) {
        if (StringUtils.isNotBlank(text))
            if (!text.endsWith("*")) {
                return StringUtils.trim(text) + "*";
            } else {
                return StringUtils.trim(text);
            }
        else {
            return text;
        }
    }

    protected ArtifactDTO createArtifactDTO(ArtifactInfo ai) {
        return new ArtifactDTO(ai.groupId, ai.artifactId, ai.version, ai.packaging, ai.classifier, ai.description, ai.lastModified, ai.name, ai.bundleSymbolicName);
    }
}

