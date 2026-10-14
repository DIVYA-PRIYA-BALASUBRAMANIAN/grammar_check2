package com.doctorvet.controller;

import com.doctorvet.model.Conversation;
import com.doctorvet.model.DoctorProfile;
import com.doctorvet.model.Message;
import com.doctorvet.model.Notification;
import com.doctorvet.repository.ConversationRepository;
import com.doctorvet.repository.DoctorProfileRepository;
import com.doctorvet.repository.MessageRepository;
import com.doctorvet.repository.NotificationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/v1/chat")
@CrossOrigin(originPatterns = "*")
public class ChatController {

    private final ConversationRepository convRepo;
    private final MessageRepository msgRepo;
    private final DoctorProfileRepository doctorRepo;
    private final NotificationRepository notificationRepo;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatController(ConversationRepository convRepo,
                          MessageRepository msgRepo,
                          DoctorProfileRepository doctorRepo,
                          NotificationRepository notificationRepo,
                          SimpMessagingTemplate messagingTemplate) {
        this.convRepo = convRepo;
        this.msgRepo = msgRepo;
        this.doctorRepo = doctorRepo;
        this.notificationRepo = notificationRepo;
        this.messagingTemplate = messagingTemplate;
    }

    public record MessageViewDto(
            Long id,
            String sender,
            Long senderId,
            Long receiverId,
            String text,
            String time,
            String attachmentUrl,
            String attachmentType
    ) {}

    public record PeerDoctorDto(
            Long id,
            String name,
            String specialty,
            String city,
            String avatar,
            boolean isOnline,
            String onlineStatus
    ) {}

    public record ConversationViewDto(
            Long id,
            PeerDoctorDto doctor,
            String lastMessage,
            String timestamp,
            int unread,
            List<MessageViewDto> messages
    ) {}

    @GetMapping("/conversations")
    public List<ConversationViewDto> getConversations(@RequestParam Long doctorId) {
        List<Conversation> list = convRepo.findAllByDoctorId(doctorId);
        List<ConversationViewDto> dtos = new ArrayList<>();
        java.time.format.DateTimeFormatter timeFmt = java.time.format.DateTimeFormatter.ofPattern("hh:mm a");

        for (Conversation c : list) {
            Long peerId = c.getDoctor1Id().equals(doctorId) ? c.getDoctor2Id() : c.getDoctor1Id();
            DoctorProfile peerDoc = doctorRepo.findById(peerId).orElse(null);

            PeerDoctorDto peerDto = new PeerDoctorDto(
                    peerId,
                    peerDoc != null ? peerDoc.getName() : (c.getDoctor1Id().equals(doctorId) ? c.getDoctor2Name() : c.getDoctor1Name()),
                    peerDoc != null ? peerDoc.getSpecialty() : "Veterinary Practitioner",
                    peerDoc != null ? peerDoc.getCity() : "India",
                    peerDoc != null ? peerDoc.getAvatar() : (c.getDoctor1Id().equals(doctorId) ? c.getDoctor2Avatar() : c.getDoctor1Avatar()),
                    true,
                    "Online · Active Now"
            );

            List<Message> msgs = msgRepo.findByConversationIdOrderByCreatedAtAsc(c.getId());
            List<MessageViewDto> msgDtos = new ArrayList<>();
            for (Message m : msgs) {
                boolean isSender = m.getSenderId().equals(doctorId);
                String formattedTime = m.getCreatedAt() != null ? m.getCreatedAt().format(timeFmt) : "Just now";
                msgDtos.add(new MessageViewDto(
                        m.getId(),
                        isSender ? "me" : "doctor",
                        m.getSenderId(),
                        m.getReceiverId(),
                        m.getText(),
                        formattedTime,
                        m.getAttachmentUrl(),
                        m.getAttachmentType()
                ));
            }

            int unread = c.getDoctor1Id().equals(doctorId) ? c.getUnreadCountDoctor1() : c.getUnreadCountDoctor2();
            String formattedUpdated = c.getUpdatedAt() != null ? c.getUpdatedAt().format(timeFmt) : "Recent";

            dtos.add(new ConversationViewDto(
                    c.getId(),
                    peerDto,
                    c.getLastMessage(),
                    formattedUpdated,
                    unread,
                    msgDtos
            ));
        }
        return dtos;
    }

    public record StartConversationDto(Long doctor1Id, Long doctor2Id, String initialMessage) {}

    @PostMapping("/conversations/start")
    public ResponseEntity<?> startConversation(@RequestBody StartConversationDto dto, jakarta.servlet.http.HttpServletRequest request) {
        Long authenticatedDoctorId = (Long) request.getAttribute("authenticatedDoctorId");
        if (authenticatedDoctorId != null && !authenticatedDoctorId.equals(dto.doctor1Id())) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Forbidden", "message", "You cannot initiate a conversation on behalf of another doctor."));
        }

        Optional<Conversation> existing = convRepo.findBetweenDoctors(dto.doctor1Id(), dto.doctor2Id());
        if (existing.isPresent()) {
            return ResponseEntity.ok(existing.get());
        }

        DoctorProfile doc1 = doctorRepo.findById(dto.doctor1Id()).orElse(null);
        DoctorProfile doc2 = doctorRepo.findById(dto.doctor2Id()).orElse(null);

        String doc1Name = doc1 != null ? doc1.getName() : "Dr. You";
        String doc2Name = doc2 != null ? doc2.getName() : "Dr. Peer";
        String doc1Avatar = doc1 != null ? doc1.getAvatar() : null;
        String doc2Avatar = doc2 != null ? doc2.getAvatar() : null;

        Conversation conv = new Conversation(dto.doctor1Id(), dto.doctor2Id(), doc1Name, doc2Name, doc1Avatar, doc2Avatar);
        conv.setLastMessage(dto.initialMessage() != null ? dto.initialMessage() : "Started new consultation");
        conv.setLastMessageSenderId(dto.doctor1Id());
        conv.setUpdatedAt(LocalDateTime.now());
        Conversation saved = convRepo.save(conv);

        // If there was an initial message, record it
        if (dto.initialMessage() != null && !dto.initialMessage().isBlank()) {
            Message msg = new Message(saved.getId(), dto.doctor1Id(), dto.doctor2Id(), dto.initialMessage(), null, null);
            msgRepo.save(msg);
        }

        return ResponseEntity.ok(saved);
    }

    @GetMapping("/conversations/{id}/messages")
    public ResponseEntity<?> getMessages(@PathVariable Long id, jakarta.servlet.http.HttpServletRequest request) {
        Long authenticatedDoctorId = (Long) request.getAttribute("authenticatedDoctorId");
        Optional<Conversation> convOpt = convRepo.findById(id);
        if (convOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Conversation conv = convOpt.get();
        if (authenticatedDoctorId != null && !authenticatedDoctorId.equals(conv.getDoctor1Id()) && !authenticatedDoctorId.equals(conv.getDoctor2Id())) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Forbidden", "message", "Access denied: you are not a participant in this consultation."));
        }

        return ResponseEntity.ok(msgRepo.findByConversationIdOrderByCreatedAtAsc(id));
    }

    public record SendMessageDto(Long conversationId, Long senderId, Long receiverId, String text, String attachmentUrl, String attachmentType) {}

    @PostMapping("/messages")
    public ResponseEntity<?> sendMessage(@RequestBody SendMessageDto dto, jakarta.servlet.http.HttpServletRequest request) {
        Long authenticatedDoctorId = (Long) request.getAttribute("authenticatedDoctorId");
        if (authenticatedDoctorId != null && !authenticatedDoctorId.equals(dto.senderId())) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Forbidden", "message", "You cannot send messages on behalf of another doctor."));
        }

        Message msg = new Message(
                dto.conversationId(),
                dto.senderId(),
                dto.receiverId(),
                dto.text(),
                dto.attachmentUrl(),
                dto.attachmentType()
        );
        Message saved = msgRepo.save(msg);

        // Update conversation summary
        convRepo.findById(dto.conversationId()).ifPresent(conv -> {
            conv.setLastMessage(dto.text() != null ? dto.text() : "Sent an attachment");
            conv.setLastMessageSenderId(dto.senderId());
            conv.setUpdatedAt(LocalDateTime.now());
            if (conv.getDoctor1Id().equals(dto.receiverId())) {
                conv.setUnreadCountDoctor1(conv.getUnreadCountDoctor1() + 1);
            } else {
                conv.setUnreadCountDoctor2(conv.getUnreadCountDoctor2() + 1);
            }
            convRepo.save(conv);
        });

        // Send real-time notification to receiver
        if (dto.receiverId() != null) {
            DoctorProfile sender = doctorRepo.findById(dto.senderId()).orElse(null);
            String senderName = sender != null ? sender.getName() : "Dr. You";
            String senderAvatar = sender != null ? sender.getAvatar() : null;

            notificationRepo.save(new Notification(
                    dto.receiverId(),
                    dto.senderId(),
                    senderName,
                    senderAvatar,
                    "NEW_MESSAGE",
                    senderName + ": " + (dto.text() != null && dto.text().length() > 40 ? dto.text().substring(0, 40) + "..." : dto.text()),
                    dto.conversationId()
            ));

            // Publish via STOMP WebSocket topic for real-time delivery
            try {
                messagingTemplate.convertAndSend("/topic/messages/" + dto.conversationId(), saved);
                messagingTemplate.convertAndSend("/topic/user/" + dto.receiverId() + "/messages", saved);
            } catch (Exception ignored) {}
        }

        return ResponseEntity.ok(saved);
    }

    @PutMapping("/messages/{id}/read")
    public ResponseEntity<?> markMessageAsRead(@PathVariable Long id) {
        return msgRepo.findById(id).map(m -> {
            m.setRead(true);
            msgRepo.save(m);
            return ResponseEntity.ok(Map.of("message", "Marked as read"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/conversations/{id}/read")
    public ResponseEntity<?> markConversationAsRead(@PathVariable Long id, @RequestParam Long doctorId) {
        convRepo.findById(id).ifPresent(conv -> {
            if (conv.getDoctor1Id().equals(doctorId)) {
                conv.setUnreadCountDoctor1(0);
            } else {
                conv.setUnreadCountDoctor2(0);
            }
            convRepo.save(conv);
        });

        List<Message> messages = msgRepo.findByConversationIdOrderByCreatedAtAsc(id);
        for (Message m : messages) {
            if (m.getReceiverId() != null && m.getReceiverId().equals(doctorId) && !m.isRead()) {
                m.setRead(true);
                msgRepo.save(m);
            }
        }
        return ResponseEntity.ok(Map.of("message", "Conversation marked as read"));
    }
}
