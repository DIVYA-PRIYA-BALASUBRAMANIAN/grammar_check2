package com.doctorvet.controller;

import com.doctorvet.model.Conversation;
import com.doctorvet.model.Message;
import com.doctorvet.service.ChatService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/chat")
@CrossOrigin(originPatterns = "*")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @GetMapping("/conversations")
    public List<Conversation> getConversations(@RequestParam Long doctorId) {
        return chatService.getConversations(doctorId);
    }

    public record StartConversationDto(Long doctor1Id, Long doctor2Id, String initialMessage) {}

    @PostMapping("/conversations/start")
    public ResponseEntity<Conversation> startConversation(@RequestBody StartConversationDto dto) {
        return ResponseEntity.ok(chatService.startConversation(dto.doctor1Id(), dto.doctor2Id(), dto.initialMessage()));
    }

    @GetMapping("/conversations/{id}/messages")
    public List<Message> getMessages(@PathVariable Long id, @RequestParam(required = false) Long doctorId, HttpServletRequest request) {
        Long authenticatedDoctorId = (Long) request.getAttribute("authenticatedDoctorId");
        Long effectiveDoctorId = doctorId != null ? doctorId : authenticatedDoctorId;
        return chatService.getMessages(id, effectiveDoctorId);
    }

    public record SendMessageDto(Long conversationId, Long senderId, Long receiverId, String text, String attachmentUrl, String attachmentType, String message) {
        public String effectiveText() {
            return text != null && !text.isBlank() ? text : message;
        }
    }

    @PostMapping("/messages")
    public ResponseEntity<Message> sendMessage(@RequestBody SendMessageDto dto, HttpServletRequest request) {
        Long authenticatedDoctorId = (Long) request.getAttribute("authenticatedDoctorId");
        Long effectiveSenderId = authenticatedDoctorId != null ? authenticatedDoctorId : dto.senderId();

        Message saved = chatService.sendMessage(
                dto.conversationId(),
                effectiveSenderId,
                dto.receiverId(),
                dto.effectiveText(),
                dto.attachmentUrl(),
                dto.attachmentType()
        );
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/messages/{id}/read")
    public ResponseEntity<?> markMessageAsRead(@PathVariable Long id, @RequestParam(required = false) Long doctorId, HttpServletRequest request) {
        Long authenticatedDoctorId = (Long) request.getAttribute("authenticatedDoctorId");
        Long effectiveDoctorId = doctorId != null ? doctorId : authenticatedDoctorId;

        if (chatService.markMessageAsRead(id, effectiveDoctorId)) {
            return ResponseEntity.ok(Map.of("message", "Marked as read", "status", "SEEN"));
        }
        return ResponseEntity.ok(Map.of("message", "Marked as read"));
    }

    @PutMapping("/messages/{id}/delivered")
    public ResponseEntity<?> markMessageAsDelivered(@PathVariable Long id, @RequestParam(required = false) Long doctorId, HttpServletRequest request) {
        Long authenticatedDoctorId = (Long) request.getAttribute("authenticatedDoctorId");
        Long effectiveDoctorId = doctorId != null ? doctorId : authenticatedDoctorId;

        if (chatService.markMessageAsDelivered(id, effectiveDoctorId)) {
            return ResponseEntity.ok(Map.of("message", "Marked as delivered", "status", "DELIVERED"));
        }
        return ResponseEntity.ok(Map.of("message", "Marked as delivered"));
    }

    @PutMapping("/conversations/{id}/read")
    public ResponseEntity<?> markConversationAsRead(@PathVariable Long id, @RequestParam(required = false) Long doctorId, HttpServletRequest request) {
        Long authenticatedDoctorId = (Long) request.getAttribute("authenticatedDoctorId");
        Long effectiveDoctorId = doctorId != null ? doctorId : authenticatedDoctorId;

        if (effectiveDoctorId == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Doctor ID required"));
        }

        chatService.markConversationAsRead(id, effectiveDoctorId);
        return ResponseEntity.ok(Map.of("message", "Conversation marked as read", "status", "SEEN"));
    }

    @PutMapping("/conversations/{id}/delivered")
    public ResponseEntity<?> markConversationAsDelivered(@PathVariable Long id, @RequestParam(required = false) Long doctorId, HttpServletRequest request) {
        Long authenticatedDoctorId = (Long) request.getAttribute("authenticatedDoctorId");
        Long effectiveDoctorId = doctorId != null ? doctorId : authenticatedDoctorId;

        if (effectiveDoctorId == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Doctor ID required"));
        }

        chatService.markConversationAsDelivered(id, effectiveDoctorId);
        return ResponseEntity.ok(Map.of("message", "Conversation marked as delivered", "status", "DELIVERED"));
    }
}
