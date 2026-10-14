package com.doctorvet.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "doctor_connections")
public class DoctorConnection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long doctor1Id;

    @Column(nullable = false)
    private Long doctor2Id;

    private LocalDateTime connectedAt = LocalDateTime.now();

    public DoctorConnection() {}

    public DoctorConnection(Long doctor1Id, Long doctor2Id) {
        this.doctor1Id = doctor1Id;
        this.doctor2Id = doctor2Id;
        this.connectedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getDoctor1Id() { return doctor1Id; }
    public void setDoctor1Id(Long doctor1Id) { this.doctor1Id = doctor1Id; }

    public Long getDoctor2Id() { return doctor2Id; }
    public void setDoctor2Id(Long doctor2Id) { this.doctor2Id = doctor2Id; }

    public LocalDateTime getConnectedAt() { return connectedAt; }
    public void setConnectedAt(LocalDateTime connectedAt) { this.connectedAt = connectedAt; }
}
