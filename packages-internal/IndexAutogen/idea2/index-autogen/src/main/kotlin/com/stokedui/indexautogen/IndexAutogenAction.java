package com.stokedui.indexautogen;

import com.intellij.openapi.actionSystem.AnAction;
import com.intellij.openapi.actionSystem.AnActionEvent;
import com.intellij.openapi.vfs.VirtualFile;
import org.jetbrains.annotations.NotNull;

public class IndexAutogenAction extends AnAction {

  @Override
  public void actionPerformed(@NotNull AnActionEvent e) {
    VirtualFile file = e.getDataContext().getData(com.intellij.openapi.actionSystem.CommonDataKeys.VIRTUAL_FILE);
    if (file != null && file.isDirectory()) {
      IndexAutogenListener listener = new IndexAutogenListener();
      listener.enableDirectory(file.getPath());
      System.out.println("IndexAutogen enabled for: " + file.getPath());
    }
  }
}
