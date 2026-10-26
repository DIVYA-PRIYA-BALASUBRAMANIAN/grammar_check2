package com.doctorvet.controller;

import com.doctorvet.model.DoctorProfile;
import com.doctorvet.model.Notification;
import com.doctorvet.repository.DoctorProfileRepository;
import com.doctorvet.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
@CrossOrigin(originPatterns = "*")
public class NotificationController {

    private final NotificationRepository notificationRepo;
    private final DoctorProfileRepository doctorRepo;
    private final SimpMessagingTemplate messagingTemplate;

    public NotificationController(
            NotificationRepository notificationRepo,
            DoctorProfileRepository doctorRepo,
            @Autowired(required = false) SimpMessagingTemplate messagingTemplate) {
        this.notificationRepo = notificationRepo;
        this.doctorRepo = doctorRepo;
        this.messagingTemplate = messagingTemplate;
    }

    @GetMapping
    public List<Notification> getNotifications(@RequestParam Long doctorId) {
        return notificationRepo.findByRecipientIdOrderByCreatedAtDesc(doctorId);
    }

    @GetMapping("/unread-count")
    public Map<String, Long> getUnreadCount(@RequestParam Long doctorId) {
        return Map.of("unreadCount", notificationRepo.countByRecipientIdAndIsReadFalse(doctorId));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        return notificationRepo.findById(id).map(n -> {
            n.setRead(true);
            notificationRepo.save(n);
            return ResponseEntity.ok(Map.of("message", "Notification marked as read"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(@RequestParam Long doctorId) {
        List<Notification> list = notificationRepo.findByRecipientIdOrderByCreatedAtDesc(doctorId);
        for (Notification n : list) {
            if (!n.isRead()) {
                n.setRead(true);
                notificationRepo.save(n);
            }
        }
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }

    @PostMapping("/broadcast")
    public ResponseEntity<?> broadcast(@RequestBody Map<String, Object> payload) {
        try {
            Long senderId = payload.get("senderId") != null ? Long.valueOf(payload.get("senderId").toString()) : 1L;
            String senderName = (String) payload.getOrDefault("senderName", "A Doctor");
            String senderAvatar = (String) payload.get("senderAvatar");
            String type = (String) payload.getOrDefault("type", "GENERAL");
            String message = (String) payload.getOrDefault("message", "New notification");
            Long targetId = payload.get("targetId") != null ? Long.valueOf(payload.get("targetId").toString()) : null;

            List<DoctorProfile> allDocs = doctorRepo.findAll();
            List<Notification> created = new ArrayList<>();

            for (DoctorProfile doc : allDocs) {
                if (!doc.getId().equals(senderId)) {
                    Notification n = new Notification(
                            doc.getId(),
                            senderId,
                            senderName,
                            senderAvatar,
                            type,
                            message,
                            targetId
                    );
                    created.add(notificationRepo.save(n));

                    if (messagingTemplate != null) {
                        try {
                            messagingTemplate.convertAndSend("/topic/user/" + doc.getId() + "/notifications", (Object) n, (Map<String, Object>) null);
                        } catch (Exception ignored) {}
                    }
                }
            }

            if (messagingTemplate != null) {
                try {
                    messagingTemplate.convertAndSend("/topic/notifications", (Object) payload, (Map<String, Object>) null);
                } catch (Exception ignored) {}
            }

            return ResponseEntity.ok(Map.of("success", true, "count", created.size()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
