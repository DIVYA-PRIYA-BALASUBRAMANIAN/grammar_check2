package com.doctorvet.controller;

import com.doctorvet.model.ConnectionRequest;
import com.doctorvet.model.DoctorConnection;
import com.doctorvet.model.DoctorProfile;
import com.doctorvet.model.Notification;
import com.doctorvet.repository.ConnectionRequestRepository;
import com.doctorvet.repository.DoctorConnectionRepository;
import com.doctorvet.repository.DoctorProfileRepository;
import com.doctorvet.repository.NotificationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/connections")
@CrossOrigin(originPatterns = "*")
public class ConnectionController {

    private final ConnectionRequestRepository requestRepo;
    private final DoctorConnectionRepository connectionRepo;
    private final DoctorProfileRepository doctorRepo;
    private final NotificationRepository notificationRepo;

    public ConnectionController(ConnectionRequestRepository requestRepo,
                                DoctorConnectionRepository connectionRepo,
                                DoctorProfileRepository doctorRepo,
                                NotificationRepository notificationRepo) {
        this.requestRepo = requestRepo;
        this.connectionRepo = connectionRepo;
        this.doctorRepo = doctorRepo;
        this.notificationRepo = notificationRepo;
    }

    public record SendRequestDto(Long senderId, String senderName, String senderAvatar, String senderSpecialty, Long receiverId) {}

    @PostMapping("/request")
    public ResponseEntity<?> sendRequest(@RequestBody SendRequestDto dto, jakarta.servlet.http.HttpServletRequest request) {
        Long authenticatedDoctorId = (Long) request.getAttribute("authenticatedDoctorId");
        if (authenticatedDoctorId != null && !authenticatedDoctorId.equals(dto.senderId())) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Forbidden", "message", "You cannot send connection requests on behalf of another doctor."));
        }

        if (dto.senderId().equals(dto.receiverId())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Cannot connect with yourself"));
        }

        // Check if already connected
        if (connectionRepo.findConnectionBetween(dto.senderId(), dto.receiverId()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Already connected"));
        }

        // Check if pending request already exists
        Optional<ConnectionRequest> existing = requestRepo.findBySenderIdAndReceiverIdAndStatus(dto.senderId(), dto.receiverId(), "PENDING");
        if (existing.isPresent()) {
            return ResponseEntity.ok(existing.get());
        }

        ConnectionRequest req = new ConnectionRequest(
                dto.senderId(),
                dto.senderName(),
                dto.senderAvatar(),
                dto.senderSpecialty(),
                dto.receiverId()
        );
        ConnectionRequest saved = requestRepo.save(req);

        // Create Notification for the receiver
        notificationRepo.save(new Notification(
                dto.receiverId(),
                dto.senderId(),
                dto.senderName(),
                dto.senderAvatar(),
                "CONNECTION_REQUEST",
                dto.senderName() + " sent you a connection request.",
                saved.getId()
        ));

        return ResponseEntity.ok(saved);
    }

    @PostMapping("/{requestId}/accept")
    public ResponseEntity<?> acceptRequest(@PathVariable Long requestId) {
        return requestRepo.findById(requestId).map(req -> {
            req.setStatus("ACCEPTED");
            requestRepo.save(req);

            // Establish connection
            if (connectionRepo.findConnectionBetween(req.getSenderId(), req.getReceiverId()).isEmpty()) {
                connectionRepo.save(new DoctorConnection(req.getSenderId(), req.getReceiverId()));
            }

            // Update doctors count
            doctorRepo.findById(req.getSenderId()).ifPresent(d -> {
                d.setConnectionsCount(d.getConnectionsCount() + 1);
                doctorRepo.save(d);
            });
            doctorRepo.findById(req.getReceiverId()).ifPresent(d -> {
                d.setConnectionsCount(d.getConnectionsCount() + 1);
                doctorRepo.save(d);
            });

            // Create Notification for the sender that request was accepted
            Optional<DoctorProfile> receiver = doctorRepo.findById(req.getReceiverId());
            String receiverName = receiver.map(DoctorProfile::getName).orElse("Doctor");
            String receiverAvatar = receiver.map(DoctorProfile::getAvatar).orElse(null);

            notificationRepo.save(new Notification(
                    req.getSenderId(),
                    req.getReceiverId(),
                    receiverName,
                    receiverAvatar,
                    "CONNECTION_ACCEPTED",
                    receiverName + " accepted your connection request.",
                    req.getReceiverId()
            ));

            return ResponseEntity.ok(Map.of("message", "Connection accepted", "status", "ACCEPTED"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{requestId}/reject")
    public ResponseEntity<?> rejectRequest(@PathVariable Long requestId) {
        return requestRepo.findById(requestId).map(req -> {
            req.setStatus("REJECTED");
            requestRepo.save(req);
            return ResponseEntity.ok(Map.of("message", "Connection rejected", "status", "REJECTED"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{requestId}/cancel")
    public ResponseEntity<?> cancelRequest(@PathVariable Long requestId) {
        return requestRepo.findById(requestId).map(req -> {
            req.setStatus("WITHDRAWN");
            requestRepo.save(req);
            return ResponseEntity.ok(Map.of("message", "Request withdrawn", "status", "WITHDRAWN"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/disconnect/{targetDoctorId}")
    public ResponseEntity<?> disconnect(@RequestParam Long currentDoctorId, @PathVariable Long targetDoctorId) {
        connectionRepo.findConnectionBetween(currentDoctorId, targetDoctorId).ifPresent(connectionRepo::delete);
        return ResponseEntity.ok(Map.of("message", "Disconnected successfully"));
    }

    @GetMapping("/pending")
    public List<ConnectionRequest> getPendingRequests(@RequestParam Long doctorId) {
        return requestRepo.findByReceiverIdAndStatusOrderByCreatedAtDesc(doctorId, "PENDING");
    }

    @GetMapping("/sent")
    public List<ConnectionRequest> getSentRequests(@RequestParam Long doctorId) {
        return requestRepo.findBySenderIdAndStatusOrderByCreatedAtDesc(doctorId, "PENDING");
    }

    @GetMapping("/my")
    public List<DoctorProfile> getMyConnections(@RequestParam Long doctorId) {
        List<DoctorConnection> connections = connectionRepo.findAllByDoctorId(doctorId);
        List<Long> peerIds = new ArrayList<>();
        for (DoctorConnection c : connections) {
            if (c.getDoctor1Id().equals(doctorId)) {
                peerIds.add(c.getDoctor2Id());
            } else {
                peerIds.add(c.getDoctor1Id());
            }
        }
        return doctorRepo.findAllById(peerIds);
    }

    @GetMapping("/suggestions")
    public List<DoctorProfile> getSuggestions(@RequestParam Long doctorId) {
        List<DoctorConnection> myConnections = connectionRepo.findAllByDoctorId(doctorId);
        Set<Long> connectedIds = new HashSet<>();
        connectedIds.add(doctorId);
        for (DoctorConnection c : myConnections) {
            connectedIds.add(c.getDoctor1Id());
            connectedIds.add(c.getDoctor2Id());
        }

        List<DoctorProfile> all = doctorRepo.findAll();
        List<DoctorProfile> suggestions = new ArrayList<>();
        for (DoctorProfile d : all) {
            if (!connectedIds.contains(d.getId())) {
                suggestions.add(d);
            }
        }
        return suggestions;
    }
}
