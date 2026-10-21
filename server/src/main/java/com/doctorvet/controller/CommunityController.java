package com.doctorvet.controller;

import com.doctorvet.security.TokenService;
import com.doctorvet.service.CommunityService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/communities")
@CrossOrigin(originPatterns = "*")
public class CommunityController {

    private final CommunityService communityService;
    private final TokenService tokenService;

    public CommunityController(CommunityService communityService, TokenService tokenService) {
        this.communityService = communityService;
        this.tokenService = tokenService;
    }

    private Long resolveDoctorId(HttpServletRequest request, Long fallbackId) {
        if (fallbackId != null && fallbackId > 0) return fallbackId;
        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) {
            String token = auth.substring(7).trim();
            if (tokenService.validateToken(token)) {
                return tokenService.getDoctorIdFromToken(token);
            }
        }
        return null;
    }

    @GetMapping
    public List<Map<String, Object>> getAllCommunities(@RequestParam(required = false) Long currentDoctorId,
                                                       HttpServletRequest request) {
        Long docId = resolveDoctorId(request, currentDoctorId);
        return communityService.getAllCommunities(docId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getCommunityById(@PathVariable Long id,
                                                                @RequestParam(required = false) Long currentDoctorId,
                                                                HttpServletRequest request) {
        Long docId = resolveDoctorId(request, currentDoctorId);
        return communityService.getCommunityById(id, docId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createCommunity(@RequestBody Map<String, Object> body,
                                                               @RequestParam(required = false) Long creatorId,
                                                               HttpServletRequest request) {
        Long docId = resolveDoctorId(request, creatorId);
        if (docId == null && body.containsKey("creatorId") && body.get("creatorId") != null) {
            try {
                docId = Long.parseLong(String.valueOf(body.get("creatorId")).replaceAll("[^0-9]", ""));
            } catch (Exception ignored) {}
        }
        Map<String, Object> created = communityService.createCommunity(body, docId);
        return ResponseEntity.ok(created);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCommunity(@PathVariable Long id,
                                             @RequestParam(required = false) Long doctorId,
                                             HttpServletRequest request) {
        Long docId = resolveDoctorId(request, doctorId);
        try {
            boolean deleted = communityService.deleteCommunity(id, docId);
            if (deleted) {
                return ResponseEntity.ok(Map.of("message", "Community deleted successfully", "id", id));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/cover")
    public ResponseEntity<Map<String, Object>> updateCoverPhoto(@PathVariable Long id,
                                                                @RequestBody Map<String, String> body,
                                                                @RequestParam(required = false) Long doctorId,
                                                                HttpServletRequest request) {
        Long docId = resolveDoctorId(request, doctorId);
        String coverImage = body.getOrDefault("coverImage", body.getOrDefault("coverUrl", ""));
        return ResponseEntity.ok(communityService.updateCoverPhoto(id, coverImage, docId));
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<Map<String, Object>> joinCommunity(@PathVariable Long id,
                                                             @RequestParam(required = false) Long doctorId,
                                                             @RequestBody(required = false) Map<String, Object> body,
                                                             HttpServletRequest request) {
        Long docId = resolveDoctorId(request, doctorId);
        if (docId == null && body != null && body.containsKey("doctorId")) {
            try {
                docId = Long.parseLong(String.valueOf(body.get("doctorId")).replaceAll("[^0-9]", ""));
            } catch (Exception ignored) {}
        }
        return ResponseEntity.ok(communityService.joinCommunity(id, docId));
    }

    @PostMapping("/{id}/leave")
    public ResponseEntity<Map<String, Object>> leaveCommunity(@PathVariable Long id,
                                                              @RequestParam(required = false) Long doctorId,
                                                              @RequestBody(required = false) Map<String, Object> body,
                                                              HttpServletRequest request) {
        Long docId = resolveDoctorId(request, doctorId);
        if (docId == null && body != null && body.containsKey("doctorId")) {
            try {
                docId = Long.parseLong(String.valueOf(body.get("doctorId")).replaceAll("[^0-9]", ""));
            } catch (Exception ignored) {}
        }
        return ResponseEntity.ok(communityService.leaveCommunity(id, docId));
    }

    @PostMapping("/{id}/invite")
    public ResponseEntity<Map<String, Object>> inviteDoctor(@PathVariable Long id,
                                                            @RequestParam(required = false) Long doctorId,
                                                            @RequestBody(required = false) Map<String, Object> body,
                                                            HttpServletRequest request) {
        Long targetDocId = doctorId;
        if (targetDocId == null && body != null && body.containsKey("doctorId")) {
            try {
                targetDocId = Long.parseLong(String.valueOf(body.get("doctorId")).replaceAll("[^0-9]", ""));
            } catch (Exception ignored) {}
        }
        Long callerId = resolveDoctorId(request, null);
        return ResponseEntity.ok(communityService.inviteDoctor(id, targetDocId, callerId));
    }

    @PostMapping("/invites/{inviteId}/accept")
    public ResponseEntity<Map<String, Object>> acceptInvite(@PathVariable Long inviteId,
                                                            @RequestParam(required = false) Long doctorId,
                                                            HttpServletRequest request) {
        Long docId = resolveDoctorId(request, doctorId);
        return ResponseEntity.ok(communityService.acceptInvite(inviteId, docId));
    }

    @PostMapping("/invites/{inviteId}/reject")
    public ResponseEntity<Map<String, Object>> rejectInvite(@PathVariable Long inviteId,
                                                            @RequestParam(required = false) Long doctorId,
                                                            HttpServletRequest request) {
        Long docId = resolveDoctorId(request, doctorId);
        return ResponseEntity.ok(communityService.rejectInvite(inviteId, docId));
    }

    @PostMapping("/{id}/accept-invite")
    public ResponseEntity<Map<String, Object>> acceptCommunityInvite(@PathVariable Long id,
                                                                     @RequestParam(required = false) Long doctorId,
                                                                     HttpServletRequest request) {
        Long docId = resolveDoctorId(request, doctorId);
        return ResponseEntity.ok(communityService.acceptCommunityInvite(id, docId));
    }

    @PostMapping("/{id}/reject-invite")
    public ResponseEntity<Map<String, Object>> rejectCommunityInvite(@PathVariable Long id,
                                                                     @RequestParam(required = false) Long doctorId,
                                                                     HttpServletRequest request) {
        Long docId = resolveDoctorId(request, doctorId);
        return ResponseEntity.ok(communityService.rejectCommunityInvite(id, docId));
    }

    @GetMapping("/invites/pending")
    public ResponseEntity<List<Map<String, Object>>> getPendingInvites(@RequestParam(required = false) Long doctorId,
                                                                       HttpServletRequest request) {
        Long docId = resolveDoctorId(request, doctorId);
        return ResponseEntity.ok(communityService.getPendingInvitesForDoctor(docId));
    }

    @PostMapping("/{id}/posts")
    public ResponseEntity<Map<String, Object>> addPost(@PathVariable Long id,
                                                       @RequestBody Map<String, Object> body,
                                                       @RequestParam(required = false) Long doctorId,
                                                       HttpServletRequest request) {
        Long docId = resolveDoctorId(request, doctorId);
        if (docId == null && body.containsKey("authorId")) {
            try {
                docId = Long.parseLong(String.valueOf(body.get("authorId")).replaceAll("[^0-9]", ""));
            } catch (Exception ignored) {}
        }
        return ResponseEntity.ok(communityService.addPost(id, body, docId));
    }

    @DeleteMapping("/{id}/posts/{postId}")
    public ResponseEntity<Map<String, Object>> deletePost(@PathVariable Long id,
                                                          @PathVariable Long postId,
                                                          @RequestParam(required = false) Long doctorId,
                                                          HttpServletRequest request) {
        Long docId = resolveDoctorId(request, doctorId);
        return ResponseEntity.ok(communityService.deletePost(id, postId, docId));
    }

    @PostMapping("/{id}/posts/{postId}/like")
    public ResponseEntity<Map<String, Object>> togglePostLike(@PathVariable Long id,
                                                              @PathVariable Long postId,
                                                              @RequestParam(required = false) Long doctorId,
                                                              HttpServletRequest request) {
        Long docId = resolveDoctorId(request, doctorId);
        return ResponseEntity.ok(communityService.togglePostLike(id, postId, docId));
    }

    @PostMapping("/{id}/posts/{postId}/comments")
    public ResponseEntity<Map<String, Object>> addComment(@PathVariable Long id,
                                                          @PathVariable Long postId,
                                                          @RequestBody Map<String, String> body,
                                                          @RequestParam(required = false) Long authorId,
                                                          HttpServletRequest request) {
        Long docId = resolveDoctorId(request, authorId);
        String text = body.getOrDefault("text", "");
        return ResponseEntity.ok(communityService.addComment(id, postId, text, docId));
    }

    @PostMapping("/{id}/cases")
    public ResponseEntity<Map<String, Object>> addCase(@PathVariable Long id,
                                                       @RequestBody Map<String, Object> body,
                                                       @RequestParam(required = false) Long authorId,
                                                       HttpServletRequest request) {
        Long docId = resolveDoctorId(request, authorId);
        return ResponseEntity.ok(communityService.addCase(id, body, docId));
    }

    @DeleteMapping("/{id}/cases/{caseId}")
    public ResponseEntity<Map<String, Object>> deleteCase(@PathVariable Long id,
                                                          @PathVariable Long caseId,
                                                          @RequestParam(required = false) Long doctorId,
                                                          HttpServletRequest request) {
        Long docId = resolveDoctorId(request, doctorId);
        return ResponseEntity.ok(communityService.deleteCase(id, caseId, docId));
    }

    @PostMapping("/{id}/reels")
    public ResponseEntity<Map<String, Object>> addReel(@PathVariable Long id,
                                                       @RequestBody Map<String, Object> body,
                                                       @RequestParam(required = false) Long authorId,
                                                       HttpServletRequest request) {
        Long docId = resolveDoctorId(request, authorId);
        return ResponseEntity.ok(communityService.addReel(id, body, docId));
    }

    @DeleteMapping("/{id}/reels/{reelId}")
    public ResponseEntity<Map<String, Object>> deleteReel(@PathVariable Long id,
                                                          @PathVariable Long reelId,
                                                          @RequestParam(required = false) Long doctorId,
                                                          HttpServletRequest request) {
        Long docId = resolveDoctorId(request, doctorId);
        return ResponseEntity.ok(communityService.deleteReel(id, reelId, docId));
    }

    @PostMapping("/{id}/messages")
    public ResponseEntity<Map<String, Object>> sendMessage(@PathVariable Long id,
                                                           @RequestBody Map<String, String> body,
                                                           @RequestParam(required = false) Long senderId,
                                                           HttpServletRequest request) {
        Long docId = resolveDoctorId(request, senderId);
        String text = body.getOrDefault("text", "");
        return ResponseEntity.ok(communityService.sendMessage(id, text, docId));
    }

    @PostMapping("/join-by-code")
    public ResponseEntity<Map<String, Object>> joinByCode(@RequestBody Map<String, String> body,
                                                          @RequestParam(required = false) Long doctorId,
                                                          HttpServletRequest request) {
        Long docId = resolveDoctorId(request, doctorId);
        String code = body.getOrDefault("code", "");
        return ResponseEntity.ok(communityService.joinByCode(code, docId));
    }
}
