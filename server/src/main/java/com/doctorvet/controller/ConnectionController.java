package com.doctorvet.controller;

import com.doctorvet.model.ConnectionRequest;
import com.doctorvet.model.DoctorProfile;
import com.doctorvet.service.ConnectionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/connections")
@CrossOrigin(originPatterns = "*")
public class ConnectionController {

    private final ConnectionService connectionService;

    public ConnectionController(ConnectionService connectionService) {
        this.connectionService = connectionService;
    }

    public record SendRequestDto(Long senderId, String senderName, String senderAvatar, String senderSpecialty, Long receiverId) {}

    @PostMapping("/request")
    public ResponseEntity<?> sendRequest(@RequestBody SendRequestDto dto) {
        try {
            ConnectionRequest saved = connectionService.sendRequest(
                    dto.senderId(),
                    dto.senderName(),
                    dto.senderAvatar(),
                    dto.senderSpecialty(),
                    dto.receiverId()
            );
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{requestId}/accept")
    public ResponseEntity<?> acceptRequest(@PathVariable Long requestId) {
        return connectionService.acceptRequest(requestId)
                .map(req -> ResponseEntity.ok(Map.of("message", "Connection accepted", "status", "ACCEPTED")))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{requestId}/reject")
    public ResponseEntity<?> rejectRequest(@PathVariable Long requestId) {
        return connectionService.rejectRequest(requestId)
                .map(req -> ResponseEntity.ok(Map.of("message", "Connection rejected", "status", "REJECTED")))
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{requestId}/cancel")
    public ResponseEntity<?> cancelRequest(@PathVariable Long requestId) {
        return connectionService.cancelRequest(requestId)
                .map(req -> ResponseEntity.ok(Map.of("message", "Request withdrawn", "status", "WITHDRAWN")))
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/disconnect/{targetDoctorId}")
    public ResponseEntity<?> disconnect(@RequestParam Long currentDoctorId, @PathVariable Long targetDoctorId) {
        boolean removed = connectionService.disconnect(currentDoctorId, targetDoctorId);
        if (removed) {
            return ResponseEntity.ok(Map.of("message", "Disconnected successfully"));
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/pending")
    public List<ConnectionRequest> getPendingRequests(@RequestParam Long doctorId) {
        return connectionService.getPendingRequests(doctorId);
    }

    @GetMapping("/sent")
    public List<ConnectionRequest> getSentRequests(@RequestParam Long doctorId) {
        return connectionService.getSentRequests(doctorId);
    }

    @GetMapping("/my")
    public List<DoctorProfile> getMyConnections(@RequestParam Long doctorId) {
        return connectionService.getMyConnections(doctorId);
    }

    @GetMapping("/suggestions")
    public List<DoctorProfile> getSuggestions(@RequestParam Long doctorId) {
        return connectionService.getSuggestions(doctorId);
    }
}
