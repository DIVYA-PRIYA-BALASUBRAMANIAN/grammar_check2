package com.doctorvet.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class MediaStorageService {

    private final Path uploadDir;

    public MediaStorageService() {
        this.uploadDir = resolveUploadDir();
        try {
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize upload directory at " + uploadDir, e);
        }
    }

    private static Path resolveUploadDir() {
        // 1. Explicit system property or env var
        String customPath = System.getProperty("app.upload.dir", System.getenv("UPLOAD_DIR"));
        if (customPath != null && !customPath.isBlank()) {
            return Paths.get(customPath).toAbsolutePath().normalize();
        }

        // 2. Discover uploads folder based on code source (project directory)
        try {
            var codeSource = MediaStorageService.class.getProtectionDomain().getCodeSource();
            if (codeSource != null && codeSource.getLocation() != null) {
                Path cur = Paths.get(codeSource.getLocation().toURI());
                while (cur != null && cur.getParent() != null) {
                    Path testUploads = cur.resolve("uploads");
                    if (Files.exists(testUploads) && Files.isWritable(testUploads)) {
                        return testUploads.toAbsolutePath().normalize();
                    }
                    Path testServerUploads = cur.resolve("server").resolve("uploads");
                    if (Files.exists(testServerUploads) && Files.isWritable(testServerUploads)) {
                        return testServerUploads.toAbsolutePath().normalize();
                    }
                    cur = cur.getParent();
                }
            }
        } catch (Exception ignored) {}

        // 3. Current working directory candidates (excluding protected system folders like System32)
        Path[] candidates = new Path[] {
            Paths.get("uploads"),
            Paths.get("server", "uploads"),
            Paths.get("..", "uploads")
        };

        for (Path c : candidates) {
            try {
                Path abs = c.toAbsolutePath().normalize();
                String pathLower = abs.toString().toLowerCase();
                if (pathLower.contains("windows\\system32") || pathLower.contains("winnt\\system32")) {
                    continue;
                }
                if (Files.exists(abs) && Files.isWritable(abs)) {
                    return abs;
                }
            } catch (Exception ignored) {}
        }

        // 4. Safe user-home directory fallback
        Path fallback = Paths.get(System.getProperty("user.home"), ".zenvevet", "uploads").toAbsolutePath().normalize();
        return fallback;
    }

    public String storeFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Cannot store empty file");
        }

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        String uniqueFileName = UUID.randomUUID().toString() + extension;
        Path targetLocation = uploadDir.resolve(uniqueFileName);

        try {
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            Path rootUploads = Paths.get("..", "uploads").toAbsolutePath().normalize();
            if (Files.exists(rootUploads.getParent())) {
                if (!Files.exists(rootUploads)) Files.createDirectories(rootUploads);
                Files.copy(targetLocation, rootUploads.resolve(uniqueFileName), StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file " + uniqueFileName, e);
        }

        return "http://localhost:8080/uploads/" + uniqueFileName;
    }

    public Path getFilePath(String fileName) {
        return uploadDir.resolve(fileName).normalize();
    }
}
