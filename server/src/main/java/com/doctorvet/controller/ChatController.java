package com.doctorvet.controller;

import com.doctorvet.model.Conversation;
import com.doctorvet.model.Message;
import com.doctorvet.service.ChatService;
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
    public List<Message> getMessages(@PathVariable Long id) {
        return chatService.getMessages(id);
    }

    public record SendMessageDto(Long conversationId, Long senderId, Long receiverId, String text, String attachmentUrl, String attachmentType) {}

    @PostMapping("/messages")
    public ResponseEntity<Message> sendMessage(@RequestBody SendMessageDto dto) {
        Message saved = chatService.sendMessage(
                dto.conversationId(),
                dto.senderId(),
                dto.receiverId(),
                dto.text(),
                dto.attachmentUrl(),
                dto.attachmentType()
        );
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/messages/{id}/read")
    public ResponseEntity<?> markMessageAsRead(@PathVariable Long id) {
        if (chatService.markMessageAsRead(id)) {
            return ResponseEntity.ok(Map.of("message", "Marked as read"));
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/conversations/{id}/read")
    public ResponseEntity<?> markConversationAsRead(@PathVariable Long id, @RequestParam Long doctorId) {
        chatService.markConversationAsRead(id, doctorId);
        return ResponseEntity.ok(Map.of("message", "Conversation marked as read"));
    }
}
