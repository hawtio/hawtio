package io.hawt.maven.indexer;

import org.apache.lucene.search.BooleanClause;
import org.apache.lucene.search.BooleanClause.Occur;
import org.apache.lucene.search.BooleanQuery;
import org.apache.lucene.search.Query;
import org.apache.maven.index.ArtifactInfo;
import org.apache.maven.index.ArtifactInfoGroup;
import org.apache.maven.index.Field;
import org.apache.maven.index.FlatSearchRequest;
import org.apache.maven.index.FlatSearchResponse;
import org.apache.maven.index.GroupedSearchRequest;
import org.apache.maven.index.GroupedSearchResponse;
import org.apache.maven.index.Indexer;
import org.apache.maven.index.MAVEN;
import org.apache.maven.index.context.ContextMemberProvider;
import org.apache.maven.index.context.IndexCreator;
import org.apache.maven.index.context.IndexingContext;
import org.apache.maven.index.context.StaticContextMemberProvider;
import org.apache.maven.index.expr.SourcedSearchExpression;
import org.apache.maven.index.expr.UserInputSearchExpression;
import org.apache.maven.index.search.grouping.GAGrouping;
import org.apache.maven.index.updater.IndexUpdateRequest;
import org.apache.maven.index.updater.IndexUpdateResult;
import org.apache.maven.index.updater.IndexUpdater;
import org.apache.maven.index.updater.ResourceFetcher;
import org.apache.maven.index.updater.WagonHelper;
import org.apache.maven.wagon.Wagon;
import org.apache.maven.wagon.events.TransferEvent;
import org.apache.maven.wagon.events.TransferListener;
import org.apache.maven.wagon.observers.AbstractTransferListener;
import org.codehaus.plexus.DefaultPlexusContainer;
import org.codehaus.plexus.PlexusContainer;
import org.codehaus.plexus.PlexusContainerException;
import org.codehaus.plexus.component.repository.exception.ComponentLookupException;
import org.codehaus.plexus.util.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.management.InstanceAlreadyExistsException;
import javax.management.InstanceNotFoundException;
import javax.management.MBeanRegistrationException;
import javax.management.MBeanServer;
import javax.management.MalformedObjectNameException;
import javax.management.NotCompliantMBeanException;
import javax.management.ObjectName;
import java.io.File;
import java.io.IOException;
import java.lang.management.ManagementFactory;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * A facade over the Maven indexer code so its easy to query repositories
 */
public class MavenIndexerFacade implements MavenIndexerFacadeMXBean {
    private static final transient Logger LOG = LoggerFactory.getLogger(MavenIndexerFacade.class);

    private final PlexusContainer plexusContainer;
    private final Indexer indexer;
    private final IndexUpdater indexUpdater;
    private final Wagon httpWagon;
    private IndexingContext mergedContext;
    private List<IndexCreator> indexers;
    private boolean updateIndexOnStartup = true;
    private ObjectName objectName;
    private MBeanServer mBeanServer;
    private String[] repositories = {
            "http://repo.fusesource.com/nexus/content/repositories/releases@id=fusesource.release.repo",
            "http://repo1.maven.org/maven2@central"
    };
    private File cacheDirectory = new File("mavenIndexer");
    private Map<String, IndexingContext> indexContexts = new HashMap<String, IndexingContext>();

    public MavenIndexerFacade() throws PlexusContainerException, ComponentLookupException {
        this.plexusContainer = new DefaultPlexusContainer();
        this.indexer = plexusContainer.lookup(Indexer.class);
        this.indexUpdater = plexusContainer.lookup(IndexUpdater.class);
        this.httpWagon = plexusContainer.lookup(Wagon.class, "http");
    }

    public void start() throws ComponentLookupException, IOException, MalformedObjectNameException, NotCompliantMBeanException, InstanceAlreadyExistsException, MBeanRegistrationException {
        if (objectName == null) {
            objectName = new ObjectName("io.hawt.maven:type=Indexer");
        }
        if (mBeanServer == null) {
            mBeanServer = ManagementFactory.getPlatformMBeanServer();
        }
        mBeanServer.registerMBean(this, objectName);

        // Creators we want to use (search for fields it defines)
        if (indexers == null) {
            indexers = new ArrayList<IndexCreator>();
            indexers.add(plexusContainer.lookup(IndexCreator.class, "min"));
            indexers.add(plexusContainer.lookup(IndexCreator.class, "jarContent"));
            indexers.add(plexusContainer.lookup(IndexCreator.class, "maven-plugin"));
        }

        // now lets create all the indexers
        for (String repository : repositories) {
            if (StringUtils.isNotBlank(repository)) {
                String url = repository;
                String id = repository;
                int idx = repository.indexOf('@');
                if (idx > 0) {
                    url = repository.substring(0, idx);
                    id = repository.substring(idx + 1);
                }
                File repoDir = new File(cacheDirectory, id);
                File cacheDir = new File(repoDir, "cache");
                File indexDir = new File(repoDir, "index");
                cacheDir.mkdirs();
                indexDir.mkdirs();
                String contextId = id + "-context";

                IndexingContext repoContext = indexer.createIndexingContext(contextId, id, cacheDir, indexDir,
                        url, null, true, true, indexers);
                indexContexts.put(id, repoContext);
            }
            File mergedDir = new File(cacheDirectory, "all");
            File cacheDir = new File(mergedDir, "cache");
            File indexDir = new File(mergedDir, "index");
            ContextMemberProvider members = new StaticContextMemberProvider(indexContexts.values());
            mergedContext = indexer.createMergedIndexingContext("all-context", "all", cacheDir, indexDir, true, members);
        }

        if (updateIndexOnStartup) {
            LOG.info("Updating the maven indices. This may take a while, please be patient...");
            Set<Map.Entry<String, IndexingContext>> entries = indexContexts.entrySet();
            for (Map.Entry<String, IndexingContext> entry : entries) {
                final String contextId = entry.getKey();
                IndexingContext context = entry.getValue();
                Date contextTime = context.getTimestamp();

                TransferListener listener = new AbstractTransferListener() {
                    public void transferStarted(TransferEvent transferEvent) {
                        LOG.info(contextId + ": Downloading " + transferEvent.getResource().getName());
                    }

                    public void transferProgress(TransferEvent transferEvent, byte[] buffer, int length) {
                    }

                    public void transferCompleted(TransferEvent transferEvent) {
                        LOG.info(contextId + ": Download complete");
                    }
                };
                ResourceFetcher resourceFetcher = new WagonHelper.WagonFetcher(httpWagon, listener, null, null);

                IndexUpdateRequest updateRequest = new IndexUpdateRequest(context, resourceFetcher);
                IndexUpdateResult updateResult = indexUpdater.fetchAndUpdateIndex(updateRequest);
                if (updateResult.isFullUpdate()) {
                    LOG.info(contextId + ": Full index update completed on index");
                } else {
                    Date timestamp = updateResult.getTimestamp();
                    if (timestamp != null && timestamp.equals(contextTime)) {
                        LOG.info(contextId + ": No index update needed, index is up to date!");
                    } else {
                        LOG.info(contextId + ": Incremental update happened, change covered " + contextTime + " - " + timestamp + " period.");
                    }
                }
            }
        }
    }

    public void destroy() throws IOException, MBeanRegistrationException, InstanceNotFoundException {
        if (objectName != null && mBeanServer != null) {
            mBeanServer.unregisterMBean(objectName);
        }
        if (indexer != null) {
            for (IndexingContext context : indexContexts.values()) {
                // close cleanly
                indexer.closeIndexingContext(context, false);
            }
            indexContexts.clear();
        }
    }

    public MBeanServer getmBeanServer() {
        return mBeanServer;
    }

    public void setmBeanServer(MBeanServer mBeanServer) {
        this.mBeanServer = mBeanServer;
    }

    public ObjectName getObjectName() {
        return objectName;
    }

    public void setObjectName(ObjectName objectName) {
        this.objectName = objectName;
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

    public String[] getRepositories() {
        return repositories;
    }

    public void setRepositories(String[] repositories) {
        this.repositories = repositories;
    }

    public File getCacheDirectory() {
        return cacheDirectory;
    }

    public void setCacheDirectory(File cacheDirectory) {
        this.cacheDirectory = cacheDirectory;
    }

    // Search APIs
    //-------------------------------------------------------------------------

    @Override
    public List<ArtifactDTO> search(String groupId, String artifactId, String packaging, String classifier) throws IOException {
        BooleanQuery bq = createQuery(groupId, artifactId, packaging, classifier);
        return searchGrouped(bq);
    }

    @Override
    public List<ArtifactDTO> searchFlat(String groupId, String artifactId, String packaging, String classifier) throws IOException {
        BooleanQuery bq = createQuery(groupId, artifactId, packaging, classifier);
        return searchFlat(bq);
    }

    protected BooleanQuery createQuery(String groupId, String artifactId, String packaging, String classifier) {
        BooleanQuery bq = new BooleanQuery();
        if (StringUtils.isNotBlank(groupId)) {
            bq.add(indexer.constructQuery(MAVEN.GROUP_ID, new SourcedSearchExpression(groupId)), Occur.MUST);
        }
        if (StringUtils.isNotBlank(artifactId)) {
            bq.add(indexer.constructQuery(MAVEN.ARTIFACT_ID, new SourcedSearchExpression(artifactId)), Occur.MUST);
        }
        if (StringUtils.isNotBlank(packaging)) {
            bq.add(indexer.constructQuery(MAVEN.PACKAGING, new SourcedSearchExpression(packaging)), Occur.MUST);
        }
        if (StringUtils.isNotBlank(classifier)) {
            bq.add(indexer.constructQuery(MAVEN.CLASSIFIER, new SourcedSearchExpression(classifier)), Occur.MUST);
        }
        return bq;
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
        //Field[] names = {MAVEN.CLASSNAMES, MAVEN.GROUP_ID, MAVEN.ARTIFACT_ID, MAVEN.VERSION, MAVEN.NAME, MAVEN.DESCRIPTION};
        Field[] names = {MAVEN.GROUP_ID, MAVEN.ARTIFACT_ID, MAVEN.VERSION, MAVEN.NAME};
        UserInputSearchExpression input = new UserInputSearchExpression(searchText);
        BooleanQuery bq = new BooleanQuery();
        for (Field name : names) {
            bq.add(indexer.constructQuery(name, input), Occur.SHOULD);
        }
        return searchGrouped(bq);
    }

    public List<ArtifactDTO> searchGrouped(Query query) throws IOException {
        return searchGrouped(query, new GAGrouping());
    }

    public List<ArtifactDTO> searchGrouped(Query query, GAGrouping grouping) throws IOException {
        List<ArtifactDTO> answer = new ArrayList<ArtifactDTO>();
        GroupedSearchResponse response = indexer.searchGrouped(new GroupedSearchRequest(query, grouping, mergedContext));
        for (Map.Entry<String, ArtifactInfoGroup> entry : response.getResults().entrySet()) {
            ArtifactInfo ai = entry.getValue().getArtifactInfos().iterator().next();
            ArtifactDTO dto = createArtifactDTO(ai);
            answer.add(dto);
        }
        return answer;
    }

    public List<ArtifactDTO> searchFlat(BooleanQuery q) throws IOException {
        List<ArtifactDTO> answer = new ArrayList<ArtifactDTO>();
        FlatSearchResponse response = indexer.searchFlat(new FlatSearchRequest(q, mergedContext));
        for (ArtifactInfo ai : response.getResults()) {
            ArtifactDTO dto = createArtifactDTO(ai);
            answer.add(dto);
        }
        return answer;
    }

    protected ArtifactDTO createArtifactDTO(ArtifactInfo ai) {
        return new ArtifactDTO(ai.groupId, ai.artifactId, ai.version, ai.packaging, ai.classifier, ai.description, ai.lastModified, ai.name, ai.bundleSymbolicName);
    }
}

