package io.hawt.ide;

import java.io.File;
import java.util.HashMap;
import java.util.Map;

/**
 * I represent a payload with information for locating source code
 * 
 * @author marska
 */
public class SourceReference {
	public String fileName;
	public String className;
	public Integer line;
	public Integer column;


	/**
	 * @return the line number of the fallback value if not specified
	 */
	public int getLineOrDefault() {
		return line != null ? line : 1;
	}

	/**
	 * @return the column number of the fallback value if not specified
	 */
	public int getColumnOrDefault() {
		return column != null ? column : 1;
	}


	public boolean hasLineOrColumn() {
		return line != null || column != null;
	}


}
