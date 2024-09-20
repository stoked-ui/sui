package com.stokedui.indexautogen;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class IndexAutogen {

  // Checks if the file has exports and default exports
  public static void indexAutogen(File dir) throws IOException {
    List<String> indexContent = new ArrayList<>();
    String dirName = dir.getName();

    for (File file : dir.listFiles()) {
      if (file.isDirectory()) {
        continue; // Skip directories
      }

      String fileName = file.getName();
      if (fileName.endsWith(".js") || fileName.endsWith(".jsx") ||
        fileName.endsWith(".ts") || fileName.endsWith(".tsx")) {

        String content = Files.readString(file.toPath());
        boolean hasDefault = hasDefaultExport(content);
        List<String> namedExports = getNamedExports(content);

        String importPath = "./" + fileName.substring(0, fileName.lastIndexOf('.'));

        if (hasDefault) {
          indexContent.add("export { default as " + fileNameWithoutExtension(file) + " } from '" + importPath + "';");
        }

        for (String namedExport : namedExports) {
          indexContent.add("export { " + namedExport + " } from '" + importPath + "';");
          if (namedExport.equals(dirName)) {
            indexContent.add("export { " + dirName + " as default } from '" + importPath + "';");
          }
        }
      }
    }

    // Write index.ts file if we have any exports
    if (!indexContent.isEmpty()) {
      Path indexFile = Path.of(dir.getPath(), "index.ts");
      Files.write(indexFile, indexContent);
    }
  }

  // Check for default export
  private static boolean hasDefaultExport(String content) {
    return Pattern.compile("export\\s+default").matcher(content).find();
  }

  // Get named exports
  private static List<String> getNamedExports(String content) {
    List<String> namedExports = new ArrayList<>();
    Matcher matcher = Pattern.compile("export\\s+(const|function|class|let|var)\\s+(\\w+)").matcher(content);
    while (matcher.find()) {
      namedExports.add(matcher.group(2));
    }
    return namedExports;
  }

  // Helper to remove file extension
  private static String fileNameWithoutExtension(File file) {
    String fileName = file.getName();
    return fileName.substring(0, fileName.lastIndexOf('.'));
  }
}
