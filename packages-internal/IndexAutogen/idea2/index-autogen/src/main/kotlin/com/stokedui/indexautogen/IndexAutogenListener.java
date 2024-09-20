package com.stokedui.indexautogen;

import com.intellij.openapi.application.ApplicationManager;
import com.intellij.openapi.editor.Document;
import com.intellij.openapi.fileEditor.FileDocumentManager;
import com.intellij.openapi.fileEditor.FileDocumentManagerListener;
import com.intellij.openapi.project.Project;
import com.intellij.openapi.vfs.VirtualFile;
import org.jetbrains.annotations.NotNull;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.HashSet;
import java.util.Set;

public class IndexAutogenListener implements FileDocumentManagerListener {

  private final Set<String> enabledDirectories = new HashSet<>();

  @Override
  public void beforeDocumentSaving(@NotNull Document document) {
    VirtualFile file = FileDocumentManager.getInstance().getFile(document);
    if (file != null && isInEnabledDirectory(file)) {
      ApplicationManager.getApplication().invokeLater(() -> {
        try {
          // Call the indexAutogen function
          IndexAutogen.indexAutogen(new File(file.getParent().getPath()));
        } catch (IOException e) {
          e.printStackTrace();
        }
      });
    }
  }

  public void enableDirectory(String dirPath) {
    enabledDirectories.add(dirPath);
  }

  public void disableDirectory(String dirPath) {
    enabledDirectories.remove(dirPath);
  }

  private boolean isInEnabledDirectory(VirtualFile file) {
    String filePath = file.getPath();
    return enabledDirectories.stream().anyMatch(filePath::startsWith);
  }
}
