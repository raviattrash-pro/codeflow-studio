package com.codeflow.studio.service;

import lombok.extern.slf4j.Slf4j;
import org.eclipse.jgit.api.Git;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.*;
import java.util.Comparator;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import org.springframework.beans.factory.annotation.Autowired;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class IngestionService {

    private static final Logger log = LoggerFactory.getLogger(IngestionService.class);

    private final String ephemeralDirBase;

    @Autowired
    public IngestionService(@Value("${codeflow.ephemeral-dir:${user.home}/.codeflow/scratch}") String ephemeralDirBase) {
        this.ephemeralDirBase = ephemeralDirBase;
    }

    public File cloneGithubRepository(String githubUrl, String projectId) throws Exception {
        File targetDir = new File(ephemeralDirBase, projectId);
        if (targetDir.exists()) {
            deleteDirectory(targetDir);
        }
        targetDir.mkdirs();

        log.info("Cloning GitHub repository {} into ephemeral directory {}", githubUrl, targetDir.getAbsolutePath());
        
        Git.cloneRepository()
                .setURI(githubUrl)
                .setDirectory(targetDir)
                .setCloneAllBranches(false)
                .call()
                .close();

        log.info("Git clone completed successfully for project {}", projectId);
        return targetDir;
    }

    public File extractZipArchive(InputStream zipStream, String projectId) throws Exception {
        File targetDir = new File(ephemeralDirBase, projectId);
        if (targetDir.exists()) {
            deleteDirectory(targetDir);
        }
        targetDir.mkdirs();

        log.info("Extracting ZIP archive into ephemeral directory {}", targetDir.getAbsolutePath());

        byte[] buffer = new byte[8192];
        try (ZipInputStream zis = new ZipInputStream(zipStream)) {
            ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                // Prevent Zip Slip vulnerability
                String name = entry.getName();
                if (name.contains("..")) continue;

                File newFile = new File(targetDir, name);
                if (entry.isDirectory()) {
                    newFile.mkdirs();
                } else {
                    newFile.getParentFile().mkdirs();
                    try (FileOutputStream fos = new FileOutputStream(newFile)) {
                        int len;
                        while ((len = zis.read(buffer)) > 0) {
                            fos.write(buffer, 0, len);
                        }
                    }
                }
                zis.closeEntry();
            }
        }

        log.info("ZIP extraction completed successfully for project {}", projectId);
        return targetDir;
    }

    public void cleanupWorkspace(File workspaceDir) {
        if (workspaceDir != null && workspaceDir.exists()) {
            log.info("Cleaning up ephemeral scratch workspace {}", workspaceDir.getAbsolutePath());
            deleteDirectory(workspaceDir);
        }
    }

    private void deleteDirectory(File dir) {
        try (var stream = Files.walk(dir.toPath())) {
            stream.sorted(Comparator.reverseOrder())
                    .map(Path::toFile)
                    .forEach(File::delete);
        } catch (Exception e) {
            log.warn("Failed to completely delete scratch directory {}", dir.getAbsolutePath(), e);
        }
    }
}
