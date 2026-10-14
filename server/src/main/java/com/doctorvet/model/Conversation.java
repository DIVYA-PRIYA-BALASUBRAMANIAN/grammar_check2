package com.doctorvet.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "conversations")
public class Conversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long doctor1Id;

    @Column(nullable = false)
    private Long doctor2Id;

    private String doctor1Name;
    private String doctor2Name;
    private String doctor1Avatar;
    private String doctor2Avatar;

    @Column(length = 1000)
    private String lastMessage;

    private Long lastMessageSenderId;
    private int unreadCountDoctor1 = 0;
    private int unreadCountDoctor2 = 0;

    private LocalDateTime updatedAt = LocalDateTime.now();

    public Conversation() {}

    public Conversation(Long doctor1Id, Long doctor2Id, String doctor1Name, String doctor2Name, String doctor1Avatar, String doctor2Avatar) {
        this.doctor1Id = doctor1Id;
        this.doctor2Id = doctor2Id;
        this.doctor1Name = doctor1Name;
        this.doctor2Name = doctor2Name;
        this.doctor1Avatar = doctor1Avatar;
        this.doctor2Avatar = doctor2Avatar;
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getDoctor1Id() { return doctor1Id; }
    public void setDoctor1Id(Long doctor1Id) { this.doctor1Id = doctor1Id; }

    public Long getDoctor2Id() { return doctor2Id; }
    public void setDoctor2Id(Long doctor2Id) { this.doctor2Id = doctor2Id; }

    public String getDoctor1Name() { return doctor1Name; }
    public void setDoctor1Name(String doctor1Name) { this.doctor1Name = doctor1Name; }

    public String getDoctor2Name() { return doctor2Name; }
    public void setDoctor2Name(String doctor2Name) { this.doctor2Name = doctor2Name; }

    public String getDoctor1Avatar() { return doctor1Avatar; }
    public void setDoctor1Avatar(String doctor1Avatar) { this.doctor1Avatar = doctor1Avatar; }

    public String getDoctor2Avatar() { return doctor2Avatar; }
    public void setDoctor2Avatar(String doctor2Avatar) { this.doctor2Avatar = doctor2Avatar; }

    public String getLastMessage() { return lastMessage; }
    public void setLastMessage(String lastMessage) { this.lastMessage = lastMessage; }

    public Long getLastMessageSenderId() { return lastMessageSenderId; }
    public void setLastMessageSenderId(Long lastMessageSenderId) { this.lastMessageSenderId = lastMessageSenderId; }

    public int getUnreadCountDoctor1() { return unreadCountDoctor1; }
    public void setUnreadCountDoctor1(int unreadCountDoctor1) { this.unreadCountDoctor1 = unreadCountDoctor1; }

    public int getUnreadCountDoctor2() { return unreadCountDoctor2; }
    public void setUnreadCountDoctor2(int unreadCountDoctor2) { this.unreadCountDoctor2 = unreadCountDoctor2; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
