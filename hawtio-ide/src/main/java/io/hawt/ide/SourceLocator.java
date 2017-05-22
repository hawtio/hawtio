package io.hawt.ide;

import java.io.File;

/**
 * I am able to deduct the location of source by searching 
 * Extracted from methods in IdeFacade for separation of concerns
 *
 */

class SourceLocator {

	static String findInChildFolders(File dir, String fileName) {
		String answer = findInFolder(dir, fileName);
		if (answer == null && isDirectory(dir)) {
			File[] files = dir.listFiles();
			if (files != null) {
				for (File file : files) {
					answer = findInFolder(file, fileName);
					if (answer != null)
						break;
				}
			}
		}
		return answer;
	}

	static String findInFolder(File dir, String relativeName) {
		if (isDirectory(dir)) {
			File file = new File(dir, relativeName);
			if (file.exists() && file.isFile()) {
				return file.getAbsolutePath();
			}
		}
		return null;
	}

	/**
	 * Searches in this directory and in the source directories in src/main/*
	 * and src/test/* for the given file name path
	 *
	 * @return the absolute file or null
	 */
	static String findInSourceFolders(File baseDir, String fileName) {
		String answer = findInFolder(baseDir, fileName);
		if (answer == null && baseDir.exists()) {
			answer = findInChildFolders(new File(baseDir, "src/main"), fileName);
			if (answer == null) {
				answer = findInChildFolders(new File(baseDir, "src/test"), fileName);
			}
		}
		return answer;
	}

	private static boolean isDirectory(File dir) {
		return dir.exists() && dir.isDirectory();
	}

	/**
	 * Given a class name and a file name, try to find the absolute file name of
	 * the source file on the users machine or null if it cannot be found
	 */
	static String findClassAbsoluteFileName( String fileName, String className, final File baseDir) {
		int lastIdx = className.lastIndexOf('.');
		if (lastIdx > 0 && !(fileName.contains("/") || fileName.contains(File.separator))) {
			String packagePath = className.substring(0, lastIdx).replace('.', File.separatorChar);
			fileName = packagePath + File.separator + fileName;
		}
		String answer = findInSourceFolders(baseDir, fileName);
		// if still not resolved: default to production code relative to module dir
		// as that appears to be IDEAS preference
		if (answer == null) {
			answer = "src" + File.separator + "main" + File.separator + "java" + File.separator + fileName;
		}
		return answer;
	}

}
