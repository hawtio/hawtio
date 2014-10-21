package io.hawt.git;

import io.hawt.util.Function;
import org.eclipse.jgit.api.errors.GitAPIException;

import java.io.File;
import java.io.IOException;

public interface GitFileManager {

    void uploadFile(String branch, String path, boolean unzip, String sourceFileName, String destName) throws IOException, GitAPIException;

    <T> T readFile(String branch, String pathOrEmpty, Function<File, T> callback) throws IOException, GitAPIException;

    <T> T writeFile(String branch, String pathOrEmpty, WriteCallback<T> callback) throws IOException, GitAPIException;
}
