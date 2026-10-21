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
import java.util.*;

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
            msg.setStatus("SENT");
            msgRepo.save(msg);
        }

        return saved;
    }

    public List<Message> getMessages(Long conversationId) {
        return getMessages(conversationId, null);
    }

    @Transactional
    public List<Message> getMessages(Long conversationId, Long requestingDoctorId) {
        List<Message> messages = msgRepo.findByConversationIdOrderByCreatedAtAsc(conversationId);

        // If a recipient doctor is fetching their messages, synchronize any "SENT" messages to "DELIVERED"
        if (requestingDoctorId != null && !messages.isEmpty()) {
            List<Long> newlyDeliveredIds = new ArrayList<>();
            LocalDateTime now = LocalDateTime.now();
            Long senderId = null;

            for (Message m : messages) {
                if (requestingDoctorId.equals(m.getReceiverId()) && "SENT".equalsIgnoreCase(m.getStatus())) {
                    m.setStatus("DELIVERED");
                    m.setDeliveredAt(now);
                    msgRepo.save(m);
                    newlyDeliveredIds.add(m.getId());
                    if (senderId == null) {
                        senderId = m.getSenderId();
                    }
                }
            }

            if (!newlyDeliveredIds.isEmpty()) {
                broadcastStatusUpdate(conversationId, senderId, requestingDoctorId, newlyDeliveredIds, "DELIVERED", null, now);
            }
        }

        return messages;
    }

    @Transactional
    public Message sendMessage(Long conversationId, Long senderId, Long receiverId, String text, String attachmentUrl, String attachmentType) {
        Message msg = new Message(conversationId, senderId, receiverId, text, attachmentUrl, attachmentType);
        msg.setStatus("SENT");
        msg.setCreatedAt(LocalDateTime.now());
        Message saved = msgRepo.save(msg);

        convRepo.findById(conversationId).ifPresent(conv -> {
            String preview = text != null && !text.isBlank() ? (text.length() > 500 ? text.substring(0, 497) + "..." : text) : "Sent an attachment";
            conv.setLastMessage(preview);
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

            String notifText = senderName + ": " + (text != null && text.length() > 40 ? text.substring(0, 40) + "..." : (text != null && !text.isBlank() ? text : "Sent an attachment"));

            notificationRepo.save(new Notification(
                    receiverId,
                    senderId,
                    senderName,
                    senderAvatar,
                    "NEW_MESSAGE",
                    notifText,
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
    public boolean markMessageAsRead(Long messageId, Long readerDoctorId) {
        return msgRepo.findById(messageId).map(m -> {
            // Only recipient can mark message as read
            if (readerDoctorId != null && !readerDoctorId.equals(m.getReceiverId())) {
                return false;
            }
            LocalDateTime now = LocalDateTime.now();
            m.setRead(true);
            m.setStatus("SEEN");
            m.setReadAt(now);
            if (m.getDeliveredAt() == null) {
                m.setDeliveredAt(now);
            }
            msgRepo.save(m);

            broadcastStatusUpdate(m.getConversationId(), m.getSenderId(), readerDoctorId, List.of(m.getId()), "SEEN", now, m.getDeliveredAt());
            return true;
        }).orElse(false);
    }

    @Transactional
    public boolean markMessageAsDelivered(Long messageId, Long receiverDoctorId) {
        return msgRepo.findById(messageId).map(m -> {
            if (receiverDoctorId != null && !receiverDoctorId.equals(m.getReceiverId())) {
                return false;
            }
            // Do not downgrade if already SEEN
            if ("SEEN".equalsIgnoreCase(m.getStatus())) {
                return true;
            }
            LocalDateTime now = LocalDateTime.now();
            m.setStatus("DELIVERED");
            if (m.getDeliveredAt() == null) {
                m.setDeliveredAt(now);
            }
            msgRepo.save(m);

            broadcastStatusUpdate(m.getConversationId(), m.getSenderId(), receiverDoctorId, List.of(m.getId()), "DELIVERED", null, now);
            return true;
        }).orElse(false);
    }

    @Transactional
    public void markConversationAsDelivered(Long conversationId, Long receiverDoctorId) {
        if (conversationId == null || receiverDoctorId == null) return;

        List<Message> messages = msgRepo.findByConversationIdOrderByCreatedAtAsc(conversationId);
        List<Long> deliveredIds = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        Long senderId = null;

        for (Message m : messages) {
            if (receiverDoctorId.equals(m.getReceiverId()) && "SENT".equalsIgnoreCase(m.getStatus())) {
                m.setStatus("DELIVERED");
                m.setDeliveredAt(now);
                msgRepo.save(m);
                deliveredIds.add(m.getId());
                if (senderId == null) senderId = m.getSenderId();
            }
        }

        if (!deliveredIds.isEmpty()) {
            broadcastStatusUpdate(conversationId, senderId, receiverDoctorId, deliveredIds, "DELIVERED", null, now);
        }
    }

    @Transactional
    public void markConversationAsRead(Long conversationId, Long doctorId) {
        if (conversationId == null || doctorId == null) return;

        Optional<Conversation> convOpt = convRepo.findById(conversationId);
        if (convOpt.isEmpty()) return;

        Conversation conv = convOpt.get();
        // Participant check
        if (!doctorId.equals(conv.getDoctor1Id()) && !doctorId.equals(conv.getDoctor2Id())) {
            return;
        }

        if (conv.getDoctor1Id().equals(doctorId)) {
            conv.setUnreadCountDoctor1(0);
        } else {
            conv.setUnreadCountDoctor2(0);
        }
        convRepo.save(conv);

        List<Message> messages = msgRepo.findByConversationIdOrderByCreatedAtAsc(conversationId);
        List<Long> seenIds = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        Long otherDoctorId = conv.getDoctor1Id().equals(doctorId) ? conv.getDoctor2Id() : conv.getDoctor1Id();

        for (Message m : messages) {
            // Mark only messages received by the current user as seen; do not mark their own sent messages as seen
            if (doctorId.equals(m.getReceiverId()) && (!m.isRead() || !"SEEN".equalsIgnoreCase(m.getStatus()))) {
                m.setRead(true);
                m.setStatus("SEEN");
                m.setReadAt(now);
                if (m.getDeliveredAt() == null) {
                    m.setDeliveredAt(now);
                }
                msgRepo.save(m);
                seenIds.add(m.getId());
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

        if (!seenIds.isEmpty()) {
            broadcastStatusUpdate(conversationId, otherDoctorId, doctorId, seenIds, "SEEN", now, null);
        }
    }

    private void broadcastStatusUpdate(Long conversationId, Long senderId, Long receiverOrReaderId,
                                       List<Long> messageIds, String status, LocalDateTime readAt, LocalDateTime deliveredAt) {
        Map<String, Object> event = new HashMap<>();
        event.put("type", "MESSAGE_STATUS_UPDATE");
        event.put("status", status);
        event.put("conversationId", conversationId);
        event.put("messageIds", messageIds);
        if (readAt != null) event.put("readAt", readAt.toString());
        if (deliveredAt != null) event.put("deliveredAt", deliveredAt.toString());
        event.put("readerId", receiverOrReaderId);
        event.put("receiverId", receiverOrReaderId);
        event.put("timestamp", LocalDateTime.now().toString());

        try {
            messagingTemplate.convertAndSend("/topic/messages/" + conversationId, (Object) event);
            if (senderId != null) {
                messagingTemplate.convertAndSend("/topic/user/" + senderId + "/messages", (Object) event);
            }
            if (receiverOrReaderId != null) {
                messagingTemplate.convertAndSend("/topic/user/" + receiverOrReaderId + "/messages", (Object) event);
            }
        } catch (Exception ignored) {}
    }
}
