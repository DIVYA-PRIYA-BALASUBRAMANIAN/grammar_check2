package com.doctorvet.service;

import com.doctorvet.model.ConnectionRequest;
import com.doctorvet.model.DoctorConnection;
import com.doctorvet.model.DoctorProfile;
import com.doctorvet.model.Notification;
import com.doctorvet.repository.ConnectionRequestRepository;
import com.doctorvet.repository.DoctorConnectionRepository;
import com.doctorvet.repository.DoctorProfileRepository;
import com.doctorvet.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class ConnectionService {

    private final ConnectionRequestRepository requestRepo;
    private final DoctorConnectionRepository connectionRepo;
    private final DoctorProfileRepository doctorRepo;
    private final NotificationRepository notificationRepo;
    private final org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;

    public ConnectionService(ConnectionRequestRepository requestRepo,
                             DoctorConnectionRepository connectionRepo,
                             DoctorProfileRepository doctorRepo,
                             NotificationRepository notificationRepo,
                             org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate) {
        this.requestRepo = requestRepo;
        this.connectionRepo = connectionRepo;
        this.doctorRepo = doctorRepo;
        this.notificationRepo = notificationRepo;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional
    public ConnectionRequest sendRequest(Long senderId, String senderName, String senderAvatar, String senderSpecialty, Long receiverId) {
        if (senderId.equals(receiverId)) {
            throw new IllegalArgumentException("Cannot connect with yourself");
        }

        if (connectionRepo.findConnectionBetween(senderId, receiverId).isPresent()) {
            throw new IllegalStateException("Already connected");
        }

        Optional<ConnectionRequest> existing = requestRepo.findBySenderIdAndReceiverIdAndStatus(senderId, receiverId, "PENDING");
        if (existing.isPresent()) {
            return existing.get();
        }

        ConnectionRequest req = new ConnectionRequest(senderId, senderName, senderAvatar, senderSpecialty, receiverId);
        ConnectionRequest saved = requestRepo.save(req);

        notificationRepo.save(new Notification(
                receiverId,
                senderId,
                senderName,
                senderAvatar,
                "CONNECTION_REQUEST",
                senderName + " sent you a connection request.",
                saved.getId()
        ));

        try {
            messagingTemplate.convertAndSend("/topic/user/" + receiverId + "/notifications", "CONNECTION_REQUEST");
        } catch (Exception ignored) {}

        return saved;
    }

    @Transactional
    public Optional<ConnectionRequest> acceptRequest(Long requestId) {
        return requestRepo.findById(requestId).map(req -> {
            req.setStatus("ACCEPTED");
            requestRepo.save(req);

            if (connectionRepo.findConnectionBetween(req.getSenderId(), req.getReceiverId()).isEmpty()) {
                connectionRepo.save(new DoctorConnection(req.getSenderId(), req.getReceiverId()));
            }

            doctorRepo.findById(req.getSenderId()).ifPresent(d -> {
                d.setConnectionsCount(d.getConnectionsCount() + 1);
                doctorRepo.save(d);
            });
            doctorRepo.findById(req.getReceiverId()).ifPresent(d -> {
                d.setConnectionsCount(d.getConnectionsCount() + 1);
                doctorRepo.save(d);
            });

            Optional<DoctorProfile> receiver = doctorRepo.findById(req.getReceiverId());
            DoctorProfile recProfile = receiver.orElse(null);
            String receiverName = (recProfile != null && recProfile.getName() != null) ? recProfile.getName() : "Doctor";
            String receiverAvatar = recProfile != null ? recProfile.getAvatar() : null;

            notificationRepo.save(new Notification(
                    req.getSenderId(),
                    req.getReceiverId(),
                    receiverName,
                    receiverAvatar,
                    "CONNECTION_ACCEPTED",
                    receiverName + " accepted your connection request.",
                    req.getReceiverId()
            ));

            try {
                messagingTemplate.convertAndSend("/topic/user/" + req.getSenderId() + "/notifications", "CONNECTION_ACCEPTED");
            } catch (Exception ignored) {}

            return req;
        });
    }

    @Transactional
    public Optional<ConnectionRequest> rejectRequest(Long requestId) {
        return requestRepo.findById(requestId).map(req -> {
            req.setStatus("REJECTED");
            return requestRepo.save(req);
        });
    }

    @Transactional
    public Optional<ConnectionRequest> cancelRequest(Long requestId) {
        return requestRepo.findById(requestId).map(req -> {
            req.setStatus("WITHDRAWN");
            return requestRepo.save(req);
        });
    }

    @Transactional
    public boolean disconnect(Long currentDoctorId, Long targetDoctorId) {
        Optional<DoctorConnection> conn = connectionRepo.findConnectionBetween(currentDoctorId, targetDoctorId);
        if (conn.isPresent()) {
            connectionRepo.delete(conn.get());
            doctorRepo.findById(currentDoctorId).ifPresent(d -> {
                d.setConnectionsCount(Math.max(0, d.getConnectionsCount() - 1));
                doctorRepo.save(d);
            });
            doctorRepo.findById(targetDoctorId).ifPresent(d -> {
                d.setConnectionsCount(Math.max(0, d.getConnectionsCount() - 1));
                doctorRepo.save(d);
            });
            return true;
        }
        return false;
    }

    public List<ConnectionRequest> getPendingRequests(Long doctorId) {
        return requestRepo.findByReceiverIdAndStatusOrderByCreatedAtDesc(doctorId, "PENDING");
    }

    public List<ConnectionRequest> getSentRequests(Long doctorId) {
        return requestRepo.findBySenderIdAndStatusOrderByCreatedAtDesc(doctorId, "PENDING");
    }

    public List<DoctorProfile> getMyConnections(Long doctorId) {
        List<DoctorConnection> connections = connectionRepo.findAllByDoctorId(doctorId);
        List<Long> peerIds = new ArrayList<>();
        for (DoctorConnection c : connections) {
            if (c.getDoctor1Id().equals(doctorId)) {
                peerIds.add(c.getDoctor2Id());
            } else {
                peerIds.add(c.getDoctor1Id());
            }
        }
        return doctorRepo.findAllById(peerIds);
    }

    public List<DoctorProfile> getSuggestions(Long doctorId) {
        List<DoctorConnection> myConnections = connectionRepo.findAllByDoctorId(doctorId);
        Set<Long> connectedIds = new HashSet<>();
        connectedIds.add(doctorId);
        for (DoctorConnection c : myConnections) {
            connectedIds.add(c.getDoctor1Id());
            connectedIds.add(c.getDoctor2Id());
        }

        List<DoctorProfile> all = doctorRepo.findAll();
        List<DoctorProfile> suggestions = new ArrayList<>();
        for (DoctorProfile d : all) {
            if (!connectedIds.contains(d.getId())) {
                suggestions.add(d);
            }
        }
        return suggestions;
    }
}
