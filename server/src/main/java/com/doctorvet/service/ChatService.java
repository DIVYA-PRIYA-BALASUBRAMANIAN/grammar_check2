package com.doctorvet.service;

import com.doctorvet.model.Conversation;
import com.doctorvet.model.DoctorProfile;
import com.doctorvet.model.Message;
import com.doctorvet.model.Notification;
import com.doctorvet.repository.ConversationRepository;
import com.doctorvet.repository.DoctorProfileRepository;
import com.doctorvet.repository.MessageRepository;
import com.doctorvet.repository.NotificationRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ChatService {

    private final ConversationRepository convRepo;
    private final MessageRepository msgRepo;
    private final DoctorProfileRepository doctorRepo;
    private final NotificationRepository notificationRepo;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatService(ConversationRepository convRepo,
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

    public List<Conversation> getConversations(Long doctorId) {
        return convRepo.findAllByDoctorId(doctorId);
    }

    @Transactional
    public Conversation startConversation(Long doctor1Id, Long doctor2Id, String initialMessage) {
        if (doctor1Id == null || doctor2Id == null) {
            throw new IllegalArgumentException("Doctor IDs cannot be null");
        }
        Optional<Conversation> existing = convRepo.findBetweenDoctors(doctor1Id, doctor2Id);
        if (existing.isPresent()) {
            return existing.get();
        }

        DoctorProfile doc1 = doctorRepo.findById(doctor1Id).orElse(null);
        DoctorProfile doc2 = doctorRepo.findById(doctor2Id).orElse(null);

        String doc1Name = doc1 != null ? doc1.getName() : "Dr. You";
        String doc2Name = doc2 != null ? doc2.getName() : "Dr. Peer";
        String doc1Avatar = doc1 != null ? doc1.getAvatar() : null;
        String doc2Avatar = doc2 != null ? doc2.getAvatar() : null;

        Conversation conv = new Conversation(doctor1Id, doctor2Id, doc1Name, doc2Name, doc1Avatar, doc2Avatar);
        conv.setLastMessage(initialMessage != null ? initialMessage : "Started new consultation");
        conv.setLastMessageSenderId(doctor1Id);
        conv.setUpdatedAt(LocalDateTime.now());
        Conversation saved = convRepo.save(conv);

        if (initialMessage != null && !initialMessage.isBlank()) {
            Message msg = new Message(saved.getId(), doctor1Id, doctor2Id, initialMessage, null, null);
            msgRepo.save(msg);
        }

        return saved;
    }

    public List<Message> getMessages(Long conversationId) {
        return msgRepo.findByConversationIdOrderByCreatedAtAsc(conversationId);
    }

    @Transactional
    public Message sendMessage(Long conversationId, Long senderId, Long receiverId, String text, String attachmentUrl, String attachmentType) {
        Message msg = new Message(conversationId, senderId, receiverId, text, attachmentUrl, attachmentType);
        Message saved = msgRepo.save(msg);

        convRepo.findById(conversationId).ifPresent(conv -> {
            conv.setLastMessage(text != null && !text.isBlank() ? text : "Sent an attachment");
            conv.setLastMessageSenderId(senderId);
            conv.setUpdatedAt(LocalDateTime.now());
            if (conv.getDoctor1Id().equals(receiverId)) {
                conv.setUnreadCountDoctor1(conv.getUnreadCountDoctor1() + 1);
            } else {
                conv.setUnreadCountDoctor2(conv.getUnreadCountDoctor2() + 1);
            }
            convRepo.save(conv);
        });

        if (receiverId != null) {
            DoctorProfile sender = doctorRepo.findById(senderId).orElse(null);
            String senderName = sender != null ? sender.getName() : "Dr. You";
            String senderAvatar = sender != null ? sender.getAvatar() : null;

            notificationRepo.save(new Notification(
                    receiverId,
                    senderId,
                    senderName,
                    senderAvatar,
                    "NEW_MESSAGE",
                    senderName + ": " + (text != null && text.length() > 40 ? text.substring(0, 40) + "..." : text),
                    conversationId
            ));

            try {
                messagingTemplate.convertAndSend("/topic/messages/" + conversationId, saved);
                messagingTemplate.convertAndSend("/topic/user/" + receiverId + "/messages", saved);
                messagingTemplate.convertAndSend("/topic/user/" + senderId + "/messages", saved);
                messagingTemplate.convertAndSend("/topic/user/" + receiverId + "/notifications", "NEW_MESSAGE");
            } catch (Exception ignored) {}
        }

        return saved;
    }

    @Transactional
    public boolean markMessageAsRead(Long messageId) {
        return msgRepo.findById(messageId).map(m -> {
            m.setRead(true);
            msgRepo.save(m);
            return true;
        }).orElse(false);
    }

    @Transactional
    public void markConversationAsRead(Long conversationId, Long doctorId) {
        convRepo.findById(conversationId).ifPresent(conv -> {
            if (conv.getDoctor1Id().equals(doctorId)) {
                conv.setUnreadCountDoctor1(0);
            } else {
                conv.setUnreadCountDoctor2(0);
            }
            convRepo.save(conv);
        });

        List<Message> messages = msgRepo.findByConversationIdOrderByCreatedAtAsc(conversationId);
        for (Message m : messages) {
            if (m.getReceiverId() != null && m.getReceiverId().equals(doctorId) && !m.isRead()) {
                m.setRead(true);
                msgRepo.save(m);
            }
        }

        // Also mark all NEW_MESSAGE notifications for this conversation as read
        List<Notification> notifs = notificationRepo.findByRecipientIdOrderByCreatedAtDesc(doctorId);
        for (Notification n : notifs) {
            if ("NEW_MESSAGE".equalsIgnoreCase(n.getType()) && conversationId.equals(n.getTargetId()) && !n.isRead()) {
                n.setRead(true);
                notificationRepo.save(n);
            }
        }
        try {
            messagingTemplate.convertAndSend("/topic/user/" + doctorId + "/notifications", "NOTIFICATIONS_UPDATED");
        } catch (Exception ignored) {}
    }
}
