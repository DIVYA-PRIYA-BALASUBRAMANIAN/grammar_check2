package com.doctorvet.controller;

import com.doctorvet.model.Notification;
import com.doctorvet.repository.NotificationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
@CrossOrigin(originPatterns = "*")
public class NotificationController {

    private final NotificationRepository notificationRepo;

    public NotificationController(NotificationRepository notificationRepo) {
        this.notificationRepo = notificationRepo;
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
}
