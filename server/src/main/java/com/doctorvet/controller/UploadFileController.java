package com.doctorvet.controller;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@CrossOrigin(originPatterns = "*")
public class UploadFileController {

    private final com.doctorvet.service.MediaStorageService mediaStorageService;

    public UploadFileController(@org.springframework.beans.factory.annotation.Autowired(required = false) com.doctorvet.service.MediaStorageService mediaStorageService) {
        this.mediaStorageService = mediaStorageService;
    }

    @GetMapping("/uploads/{fileName:.+}")
    public ResponseEntity<Resource> serveUploadFile(@PathVariable String fileName) {
        java.util.List<Path> searchList = new java.util.ArrayList<>();
        if (mediaStorageService != null) {
            searchList.add(mediaStorageService.getFilePath(fileName));
        }
        searchList.add(Paths.get("uploads", fileName));
        searchList.add(Paths.get("server", "uploads", fileName));
        searchList.add(Paths.get("..", "uploads", fileName));
        searchList.add(Paths.get("D:/zenve-vet/uploads", fileName));
        searchList.add(Paths.get("D:/zenve-vet/server/uploads", fileName));

        for (Path p : searchList) {
            Path norm = p.toAbsolutePath().normalize();
            if (Files.exists(norm) && Files.isReadable(norm) && !Files.isDirectory(norm)) {
                Resource resource = new FileSystemResource(norm);
                String contentType = null;
                try {
                    contentType = Files.probeContentType(norm);
                } catch (IOException ignored) {}

                if (contentType == null) {
                    String lower = fileName.toLowerCase();
                    if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) contentType = "image/jpeg";
                    else if (lower.endsWith(".png")) contentType = "image/png";
                    else if (lower.endsWith(".webp")) contentType = "image/webp";
                    else if (lower.endsWith(".avif")) contentType = "image/avif";
                    else if (lower.endsWith(".gif")) contentType = "image/gif";
                    else if (lower.endsWith(".svg")) contentType = "image/svg+xml";
                    else if (lower.endsWith(".mp4")) contentType = "video/mp4";
                    else if (lower.endsWith(".webm")) contentType = "video/webm";
                    else if (lower.endsWith(".mov")) contentType = "video/quicktime";
                    else if (lower.endsWith(".ogg")) contentType = "video/ogg";
                    else contentType = "application/octet-stream";
                }

                return ResponseEntity.ok()
                        .header(HttpHeaders.CACHE_CONTROL, "public, max-age=86400")
                        .contentType(MediaType.parseMediaType(contentType))
                        .body(resource);
            }
        }

        // Graceful fallback for missing image uploads to avoid red 404 errors in browser console
        String lower = fileName.toLowerCase();
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".png") || lower.endsWith(".webp") || lower.endsWith(".gif")) {
            Path[] fallbackPaths = new Path[] {
                Paths.get("uploads", "f98df2a9-16ca-4922-bbb8-cd5ce8690952.jpeg"),
                Paths.get("server", "uploads", "f98df2a9-16ca-4922-bbb8-cd5ce8690952.jpeg"),
                Paths.get("..", "uploads", "f98df2a9-16ca-4922-bbb8-cd5ce8690952.jpeg")
            };
            for (Path fb : fallbackPaths) {
                Path normFb = fb.toAbsolutePath().normalize();
                if (Files.exists(normFb) && Files.isReadable(normFb)) {
                    return ResponseEntity.ok()
                            .header(HttpHeaders.CACHE_CONTROL, "no-cache")
                            .contentType(MediaType.IMAGE_JPEG)
                            .body(new FileSystemResource(normFb));
                }
            }
        }

        return ResponseEntity.notFound().build();
    }
}
