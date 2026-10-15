package com.doctorvet.controller;

import com.doctorvet.model.Campaign;
import com.doctorvet.security.TokenService;
import com.doctorvet.service.AdvertiserService;
import com.doctorvet.service.CampaignService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/campaigns")
@CrossOrigin(originPatterns = "*")
public class CampaignController {

    private final CampaignService campaignService;
    private final AdvertiserService advertiserService;
    private final TokenService tokenService;

    public CampaignController(CampaignService campaignService, AdvertiserService advertiserService, TokenService tokenService) {
        this.campaignService = campaignService;
        this.advertiserService = advertiserService;
        this.tokenService = tokenService;
    }

    public record EventReq(String eventType, String sessionId) {}
    public record StatusReq(String status) {}

    @GetMapping
    public ResponseEntity<?> getMyCampaigns(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Advertiser-Key", required = false) String apiKey
    ) {
        Long advertiserId = resolveAdvertiserId(authHeader, apiKey);
        if (advertiserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }

        List<Campaign> campaigns = campaignService.getAdvertiserCampaigns(advertiserId);
        return ResponseEntity.ok(campaigns);
    }

    @PostMapping
    public ResponseEntity<?> createCampaign(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Advertiser-Key", required = false) String apiKey,
            @RequestBody CampaignService.CampaignDto dto
    ) {
        Long advertiserId = resolveAdvertiserId(authHeader, apiKey);
        if (advertiserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }

        try {
            Campaign created = campaignService.createCampaign(advertiserId, dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCampaign(@PathVariable Long id) {
        return campaignService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCampaign(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Advertiser-Key", required = false) String apiKey,
            @RequestBody CampaignService.CampaignDto dto
    ) {
        Long advertiserId = resolveAdvertiserId(authHeader, apiKey);
        if (advertiserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }

        try {
            Campaign updated = campaignService.updateCampaign(id, advertiserId, dto);
            return ResponseEntity.ok(updated);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCampaign(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Advertiser-Key", required = false) String apiKey
    ) {
        Long advertiserId = resolveAdvertiserId(authHeader, apiKey);
        if (advertiserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }

        try {
            campaignService.deleteCampaign(id, advertiserId);
            return ResponseEntity.ok(Map.of("message", "Campaign deleted successfully"));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/status")
    public ResponseEntity<?> updateCampaignStatus(@PathVariable Long id, @RequestBody StatusReq req) {
        if (req.status() == null || req.status().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Status is required"));
        }
        try {
            Campaign updated = campaignService.updateStatus(id, req.status().trim());
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/events")
    public ResponseEntity<?> recordEvent(
            @PathVariable Long id,
            @RequestBody EventReq req,
            HttpServletRequest request
    ) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isBlank()) {
            ip = request.getRemoteAddr();
        }
        String userAgent = request.getHeader("User-Agent");

        campaignService.recordEvent(id, req.eventType(), ip, req.sessionId(), userAgent);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping("/reports")
    public ResponseEntity<?> getReports(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Advertiser-Key", required = false) String apiKey,
            @RequestParam(required = false) String preset,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        Long advertiserId = resolveAdvertiserId(authHeader, apiKey);
        if (advertiserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }

        CampaignService.ReportResult result = campaignService.getReports(advertiserId, preset, from, to);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/reports/csv")
    public ResponseEntity<?> exportCsv(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Advertiser-Key", required = false) String apiKey,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        Long advertiserId = resolveAdvertiserId(authHeader, apiKey);
        if (advertiserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }

        LocalDate fromDate = from != null ? from : LocalDate.now().minusDays(6);
        LocalDate toDate = to != null ? to : LocalDate.now();

        String csvData = campaignService.generateCsv(advertiserId, fromDate, toDate);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"zenve_advertiser_report_" + fromDate + "_to_" + toDate + ".csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvData);
    }

    @GetMapping("/public/live")
    public ResponseEntity<List<Campaign>> getPublicLiveCampaigns(@RequestParam(required = false) String placement) {
        List<Campaign> live = campaignService.getPublicLiveCampaigns(placement);
        return ResponseEntity.ok(live);
    }

    private Long resolveAdvertiserId(String authHeader, String apiKey) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7).trim();
            if (tokenService.validateToken(token)) {
                Long id = tokenService.getDoctorIdFromToken(token);
                if (id != null) return id;
            }
        }

        if (apiKey != null && !apiKey.isBlank()) {
            var advOpt = advertiserService.getByAccessKey(apiKey.trim());
            if (advOpt.isPresent()) return advOpt.get().getId();
        }

        return null;
    }
}
