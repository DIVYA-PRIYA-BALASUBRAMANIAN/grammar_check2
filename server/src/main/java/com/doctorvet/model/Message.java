package com.doctorvet.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long conversationId;

    @Column(nullable = false)
    private Long senderId;

    private Long receiverId;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String text;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String attachmentUrl;
    private String attachmentType; // image, scan, document

    private boolean isRead = false;

    @Column(length = 20)
    private String status = "SENT"; // SENT, DELIVERED, SEEN

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime deliveredAt;
    private LocalDateTime readAt;

    public Message() {}

    public Message(Long conversationId, Long senderId, Long receiverId, String text, String attachmentUrl, String attachmentType) {
        this.conversationId = conversationId;
        this.senderId = senderId;
        this.receiverId = receiverId;
        this.text = text;
        this.attachmentUrl = attachmentUrl;
        this.attachmentType = attachmentType;
        this.isRead = false;
        this.status = "SENT";
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getConversationId() { return conversationId; }
    public void setConversationId(Long conversationId) { this.conversationId = conversationId; }

    public Long getSenderId() { return senderId; }
    public void setSenderId(Long senderId) { this.senderId = senderId; }

    public Long getReceiverId() { return receiverId; }
    public void setReceiverId(Long receiverId) { this.receiverId = receiverId; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    // Message field alias
    public String getMessage() { return text; }
    public void setMessage(String message) { this.text = message; }

    public String getAttachmentUrl() { return attachmentUrl; }
    public void setAttachmentUrl(String attachmentUrl) { this.attachmentUrl = attachmentUrl; }

    public String getAttachmentType() { return attachmentType; }
    public void setAttachmentType(String attachmentType) { this.attachmentType = attachmentType; }

    @com.fasterxml.jackson.annotation.JsonProperty("isRead")
    public boolean isRead() { return isRead; }
    public void setRead(boolean read) {
        this.isRead = read;
        if (read) {
            this.status = "SEEN";
            if (this.readAt == null) {
                this.readAt = LocalDateTime.now();
            }
            if (this.deliveredAt == null) {
                this.deliveredAt = this.readAt;
            }
        }
    }

    public String getStatus() { return status; }
    public void setStatus(String status) {
        this.status = status;
        if ("SEEN".equalsIgnoreCase(status)) {
            this.isRead = true;
            if (this.readAt == null) {
                this.readAt = LocalDateTime.now();
            }
            if (this.deliveredAt == null) {
                this.deliveredAt = this.readAt;
            }
        } else if ("DELIVERED".equalsIgnoreCase(status)) {
            if (this.deliveredAt == null) {
                this.deliveredAt = LocalDateTime.now();
            }
        }
    }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getDeliveredAt() { return deliveredAt; }
    public void setDeliveredAt(LocalDateTime deliveredAt) { this.deliveredAt = deliveredAt; }

    public LocalDateTime getReadAt() { return readAt; }
    public void setReadAt(LocalDateTime readAt) { this.readAt = readAt; }
}
