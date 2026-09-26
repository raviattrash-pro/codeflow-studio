package com.codeflow.studio.service;

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

    // Zip Bomb (DoS) Protection thresholds
    private static final int MAX_ENTRIES = 15000;
    private static final long MAX_TOTAL_SIZE = 500 * 1024 * 1024L; // 500 MB max uncompressed

    private final String ephemeralDirBase;

    @Autowired
    public IngestionService(@Value("${codeflow.ephemeral-dir:${user.home}/.codeflow/scratch}") String ephemeralDirBase) {
        this.ephemeralDirBase = ephemeralDirBase;
    }

    public File cloneGithubRepository(String githubUrl, String projectId) throws Exception {
        File baseDir = new File(ephemeralDirBase);
        File targetDir = new File(baseDir, projectId);

        // Path boundary check on project directory
        if (!targetDir.getCanonicalPath().startsWith(baseDir.getCanonicalPath())) {
            throw new SecurityException("Illegal project destination directory");
        }

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
        File baseDir = new File(ephemeralDirBase);
        File targetDir = new File(baseDir, projectId);

        String canonicalTargetDir = targetDir.getCanonicalPath();
        if (!canonicalTargetDir.startsWith(baseDir.getCanonicalPath())) {
            throw new SecurityException("Illegal project destination directory");
        }

        if (targetDir.exists()) {
            deleteDirectory(targetDir);
        }
        targetDir.mkdirs();

        log.info("Extracting ZIP archive into ephemeral directory {}", canonicalTargetDir);

        byte[] buffer = new byte[8192];
        int entriesCount = 0;
        long totalSize = 0;

        try (ZipInputStream zis = new ZipInputStream(zipStream)) {
            ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                entriesCount++;
                if (entriesCount > MAX_ENTRIES) {
                    throw new SecurityException("ZIP archive contains too many files (max: " + MAX_ENTRIES + ")");
                }

                File newFile = new File(targetDir, entry.getName());
                String canonicalDest = newFile.getCanonicalPath();

                // Industry standard Zip Slip prevention (CWE-22)
                if (!canonicalDest.startsWith(canonicalTargetDir + File.separator) && !canonicalDest.equals(canonicalTargetDir)) {
                    log.warn("Blocked Zip Slip entry: {}", entry.getName());
                    zis.closeEntry();
                    continue;
                }

                if (entry.isDirectory()) {
                    newFile.mkdirs();
                } else {
                    newFile.getParentFile().mkdirs();
                    try (FileOutputStream fos = new FileOutputStream(newFile)) {
                        int len;
                        while ((len = zis.read(buffer)) > 0) {
                            totalSize += len;
                            if (totalSize > MAX_TOTAL_SIZE) {
                                throw new SecurityException("ZIP archive exceeds maximum decompressed size (500MB)");
                            }
                            fos.write(buffer, 0, len);
                        }
                    }
                }
                zis.closeEntry();
            }
        }

        log.info("ZIP extraction completed successfully for project {} ({} files, {} bytes)", projectId, entriesCount, totalSize);
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
            log.warn("Could not completely delete directory {}: {}", dir.getAbsolutePath(), e.getMessage());
        }
    }
}
