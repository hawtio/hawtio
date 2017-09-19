package io.hawt.web;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class GitFileUploadFilter {

    private static final transient Logger LOG = LoggerFactory.getLogger(GitFileUploadFilter.class);

    private List<GlobalFileUploadFilter.MagicNumberFileFilter> filters;
    private static final String GIT_CONFIG = "signature=504B0304,offset=0,maxSize=10mb,exc=[@ [ ] # * / & % ? ; $]";

    public GitFileUploadFilter() {
        try {
            GlobalFileUploadFilter.constructFilters(GIT_CONFIG, this.getFilters());
        } catch (RuntimeException e) {
            LOG.warn("Error configuring git filter {}", GIT_CONFIG);
        }
    }

    private List<GlobalFileUploadFilter.MagicNumberFileFilter> getFilters() {
        if (this.filters == null) {
            this.filters = new ArrayList<>();
        }

        return this.filters;
    }

    public List<GlobalFileUploadFilter.MagicNumberFileFilter> getGitFilters() {
        return Collections.unmodifiableList(getFilters());
    }

    public static GitFileUploadFilter newGitFileUploadFilter() {
        return new GitFileUploadFilter();
    }
}
