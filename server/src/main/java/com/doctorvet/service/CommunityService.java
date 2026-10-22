package com.doctorvet.service;

import com.doctorvet.model.*;
import com.doctorvet.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class CommunityService {

    private final CommunityRepository communityRepo;
    private final CommunityMemberRepository memberRepo;
    private final CommunityInviteRepository inviteRepo;
    private final CommunityPostRepository postRepo;
    private final CommunityPostLikeRepository likeRepo;
    private final CommunityPostCommentRepository commentRepo;
    private final CommunityCaseRepository caseRepo;
    private final CommunityReelRepository reelRepo;
    private final CommunityMessageRepository messageRepo;
    private final DoctorProfileRepository doctorRepo;
    private final NotificationRepository notificationRepo;

    public CommunityService(CommunityRepository communityRepo,
                            CommunityMemberRepository memberRepo,
                            CommunityInviteRepository inviteRepo,
                            CommunityPostRepository postRepo,
                            CommunityPostLikeRepository likeRepo,
                            CommunityPostCommentRepository commentRepo,
                            CommunityCaseRepository caseRepo,
                            CommunityReelRepository reelRepo,
                            CommunityMessageRepository messageRepo,
                            DoctorProfileRepository doctorRepo,
                            NotificationRepository notificationRepo) {
        this.communityRepo = communityRepo;
        this.memberRepo = memberRepo;
        this.inviteRepo = inviteRepo;
        this.postRepo = postRepo;
        this.likeRepo = likeRepo;
        this.commentRepo = commentRepo;
        this.caseRepo = caseRepo;
        this.reelRepo = reelRepo;
        this.messageRepo = messageRepo;
        this.doctorRepo = doctorRepo;
        this.notificationRepo = notificationRepo;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllCommunities(Long currentDoctorId) {
        List<Community> communities = communityRepo.findAllByOrderByCreatedAtDesc();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Community c : communities) {
            result.add(formatCommunity(c, currentDoctorId));
        }
        return result;
    }

    @Transactional(readOnly = true)
    public Optional<Map<String, Object>> getCommunityById(Long id, Long currentDoctorId) {
        return communityRepo.findById(id).map(c -> formatCommunity(c, currentDoctorId));
    }

    @Transactional
    public Map<String, Object> createCommunity(Map<String, Object> data, Long creatorId) {
        String name = String.valueOf(data.getOrDefault("name", "Veterinary Community")).trim();
        String category = String.valueOf(data.getOrDefault("category", "Surgery & Orthopedics")).trim();
        String desc = data.containsKey("description") ? String.valueOf(data.get("description")).trim() : "";
        String privacy = data.containsKey("privacy") ? String.valueOf(data.get("privacy")).trim() : "Public Group";
        String gradient = data.containsKey("coverGradient") ? String.valueOf(data.get("coverGradient")) : "linear-gradient(135deg, #064e3b 0%, #0d9488 100%)";
        String coverUrl = data.containsKey("coverImage") && data.get("coverImage") != null ? String.valueOf(data.get("coverImage")).trim() : null;

        // Fetch Creator Profile
        DoctorProfile creator = creatorId != null ? doctorRepo.findById(creatorId).orElse(null) : null;
        String creatorName = creator != null ? creator.getName() : "Dr. You";

        // Generate Invite Code
        String cleanPrefix = name.replaceAll("[^A-Za-z0-9]", "").toUpperCase();
        if (cleanPrefix.length() > 4) cleanPrefix = cleanPrefix.substring(0, 4);
        if (cleanPrefix.isEmpty()) cleanPrefix = "VET";
        String inviteCode = "ZENVE-" + cleanPrefix + "-" + (1000 + new Random().nextInt(9000));

        Community community = new Community(name, category, desc, privacy, gradient, coverUrl, creatorId, creatorName, inviteCode);
        Community saved = communityRepo.save(community);

        // Add creator as Founder & Admin member
        CommunityMember founder = new CommunityMember(
                saved.getId(),
                creatorId != null ? creatorId : 1L,
                creatorName,
                "Founder & Admin",
                creator != null ? creator.getSpecialty() : category,
                creator != null ? creator.getCity() : "India",
                creator != null ? creator.getAvatar() : null
        );
        memberRepo.save(founder);

        // Add initial system greeting
        CommunityMessage welcome = new CommunityMessage(
                saved.getId(),
                creatorId != null ? creatorId : 1L,
                creatorName,
                creator != null ? creator.getAvatar() : null,
                "Welcome to " + name + "! Feel free to share cases, clinical reels, and peer questions."
        );
        messageRepo.save(welcome);

        return formatCommunity(saved, creatorId);
    }

    @Transactional
    public Map<String, Object> joinCommunity(Long communityId, Long doctorId) {
        Community community = communityRepo.findById(communityId)
                .orElseThrow(() -> new IllegalArgumentException("Community not found"));

        if (doctorId != null && !memberRepo.existsByCommunityIdAndDoctorId(communityId, doctorId)) {
            DoctorProfile doc = doctorRepo.findById(doctorId).orElse(null);
            String docName = doc != null ? doc.getName() : "Doctor";
            String specialty = doc != null ? doc.getSpecialty() : "Veterinary Practitioner";
            String city = doc != null ? doc.getCity() : "India";
            String avatar = doc != null ? doc.getAvatar() : null;

            CommunityMember member = new CommunityMember(communityId, doctorId, docName, "Member", specialty, city, avatar);
            memberRepo.save(member);

            CommunityMessage joinMsg = new CommunityMessage(communityId, null, "System", null, docName + " joined the community!");
            messageRepo.save(joinMsg);

            // Mark any pending invite as accepted
            inviteRepo.findByCommunityIdAndInviteeDoctorIdAndStatus(communityId, doctorId, "PENDING")
                    .ifPresent(inv -> {
                        inv.setStatus("ACCEPTED");
                        inviteRepo.save(inv);
                    });
        }

        return formatCommunity(community, doctorId);
    }

    @Transactional
    public Map<String, Object> leaveCommunity(Long communityId, Long doctorId) {
        Community community = communityRepo.findById(communityId)
                .orElseThrow(() -> new IllegalArgumentException("Community not found"));

        if (doctorId != null) {
            memberRepo.deleteByCommunityIdAndDoctorId(communityId, doctorId);
        }

        return formatCommunity(community, doctorId);
    }

    /**
     * Invite doctor: creates a pending CommunityInvite and sends a notification.
     * The invited doctor MUST accept the invite before joining the community.
     */
    @Transactional
    public Map<String, Object> inviteDoctor(Long communityId, Long targetDoctorId, Long currentDoctorId) {
        Community community = communityRepo.findById(communityId)
                .orElseThrow(() -> new IllegalArgumentException("Community not found"));

        if (targetDoctorId != null) {
            // 1. If already a member, return directly
            if (memberRepo.existsByCommunityIdAndDoctorId(communityId, targetDoctorId)) {
                return formatCommunity(community, currentDoctorId);
            }

            // 2. If already pending invite exists, return directly
            if (inviteRepo.existsByCommunityIdAndInviteeDoctorIdAndStatus(communityId, targetDoctorId, "PENDING")) {
                return formatCommunity(community, currentDoctorId);
            }

            // 3. Resolve inviter & invitee profiles
            DoctorProfile inviter = currentDoctorId != null ? doctorRepo.findById(currentDoctorId).orElse(null) : null;
            String inviterName = inviter != null ? inviter.getName() : "Dr. You";
            String inviterAvatar = inviter != null ? inviter.getAvatar() : null;

            DoctorProfile invitee = doctorRepo.findById(targetDoctorId).orElse(null);
            String inviteeName = invitee != null ? invitee.getName() : "Doctor";
            String inviteeAvatar = invitee != null ? invitee.getAvatar() : null;

            // 4. Save pending invite record
            CommunityInvite invite = new CommunityInvite(
                    communityId,
                    community.getName(),
                    currentDoctorId,
                    inviterName,
                    inviterAvatar,
                    targetDoctorId,
                    inviteeName,
                    inviteeAvatar
            );
            CommunityInvite savedInvite = inviteRepo.save(invite);

            // 5. Send persistent notification to invited doctor
            Notification notif = new Notification(
                    targetDoctorId,
                    currentDoctorId,
                    inviterName,
                    inviterAvatar,
                    "COMMUNITY_INVITE",
                    inviterName + " invited you to join the \"" + community.getName() + "\" community.",
                    savedInvite.getId()
            );
            notificationRepo.save(notif);
        }

        return formatCommunity(community, currentDoctorId);
    }

    /**
     * Accept community invitation by invite ID
     */
    @Transactional
    public Map<String, Object> acceptInvite(Long inviteId, Long doctorId) {
        CommunityInvite invite = inviteRepo.findById(inviteId)
                .orElseThrow(() -> new IllegalArgumentException("Community invitation not found"));

        if (doctorId != null && !doctorId.equals(invite.getInviteeDoctorId())) {
            throw new IllegalArgumentException("Unauthorized to accept this invitation");
        }

        invite.setStatus("ACCEPTED");
        inviteRepo.save(invite);

        Community community = communityRepo.findById(invite.getCommunityId())
                .orElseThrow(() -> new IllegalArgumentException("Community not found"));

        if (doctorId != null && !memberRepo.existsByCommunityIdAndDoctorId(community.getId(), doctorId)) {
            DoctorProfile doc = doctorRepo.findById(doctorId).orElse(null);
            String docName = doc != null ? doc.getName() : invite.getInviteeName();
            String specialty = doc != null ? doc.getSpecialty() : "Veterinary Practitioner";
            String city = doc != null ? doc.getCity() : "India";
            String avatar = doc != null ? doc.getAvatar() : invite.getInviteeAvatar();

            CommunityMember member = new CommunityMember(community.getId(), doctorId, docName, "Member", specialty, city, avatar);
            memberRepo.save(member);

            CommunityMessage joinMsg = new CommunityMessage(community.getId(), null, "System", null, docName + " accepted invitation and joined the community!");
            messageRepo.save(joinMsg);

            // Notify inviter
            if (invite.getInviterId() != null) {
                Notification notif = new Notification(
                        invite.getInviterId(),
                        doctorId,
                        docName,
                        avatar,
                        "COMMUNITY_INVITE_ACCEPTED",
                        docName + " accepted your invitation to join \"" + community.getName() + "\".",
                        community.getId()
                );
                notificationRepo.save(notif);
            }
        }

        return formatCommunity(community, doctorId);
    }

    /**
     * Reject community invitation by invite ID
     */
    @Transactional
    public Map<String, Object> rejectInvite(Long inviteId, Long doctorId) {
        CommunityInvite invite = inviteRepo.findById(inviteId)
                .orElseThrow(() -> new IllegalArgumentException("Community invitation not found"));

        if (doctorId != null && !doctorId.equals(invite.getInviteeDoctorId())) {
            throw new IllegalArgumentException("Unauthorized to decline this invitation");
        }

        invite.setStatus("REJECTED");
        inviteRepo.save(invite);

        return Map.of("message", "Invitation declined");
    }

    /**
     * Accept community invitation directly by community ID and doctor ID
     */
    @Transactional
    public Map<String, Object> acceptCommunityInvite(Long communityId, Long doctorId) {
        if (doctorId != null) {
            Optional<CommunityInvite> opt = inviteRepo.findByCommunityIdAndInviteeDoctorIdAndStatus(communityId, doctorId, "PENDING");
            if (opt.isPresent()) {
                return acceptInvite(opt.get().getId(), doctorId);
            }
        }
        return joinCommunity(communityId, doctorId);
    }

    /**
     * Reject community invitation directly by community ID and doctor ID
     */
    @Transactional
    public Map<String, Object> rejectCommunityInvite(Long communityId, Long doctorId) {
        if (doctorId != null) {
            Optional<CommunityInvite> opt = inviteRepo.findByCommunityIdAndInviteeDoctorIdAndStatus(communityId, doctorId, "PENDING");
            if (opt.isPresent()) {
                return rejectInvite(opt.get().getId(), doctorId);
            }
        }
        return Map.of("message", "Invitation declined");
    }

    /**
     * Get pending community invites for current doctor
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getPendingInvitesForDoctor(Long doctorId) {
        if (doctorId == null) return List.of();
        List<CommunityInvite> list = inviteRepo.findByInviteeDoctorIdAndStatusOrderByCreatedAtDesc(doctorId, "PENDING");
        List<Map<String, Object>> result = new ArrayList<>();
        for (CommunityInvite inv : list) {
            Community c = communityRepo.findById(inv.getCommunityId()).orElse(null);
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", inv.getId());
            map.put("communityId", inv.getCommunityId());
            map.put("communityName", inv.getCommunityName());
            map.put("category", c != null ? c.getCategory() : "General");
            map.put("coverGradient", c != null ? c.getCoverGradient() : "");
            map.put("coverImage", c != null ? c.getCoverImage() : null);
            map.put("inviterId", inv.getInviterId());
            map.put("inviterName", inv.getInviterName());
            map.put("inviterAvatar", inv.getInviterAvatar());
            map.put("createdAt", formatRelativeTime(inv.getCreatedAt()));
            result.add(map);
        }
        return result;
    }

    @Transactional
    public Map<String, Object> addPost(Long communityId, Map<String, Object> payload, Long doctorId) {
        Community community = communityRepo.findById(communityId)
                .orElseThrow(() -> new IllegalArgumentException("Community not found"));

        DoctorProfile doc = doctorId != null ? doctorRepo.findById(doctorId).orElse(null) : null;
        String authorName = doc != null ? doc.getName() : "Doctor";
        String authorAvatar = doc != null ? doc.getAvatar() : null;
        String authorSpecialty = doc != null ? doc.getSpecialty() : "Veterinary Practitioner";

        String content = String.valueOf(payload.getOrDefault("content", "")).trim();
        String imageUrl = payload.containsKey("imageUrl") && payload.get("imageUrl") != null ? String.valueOf(payload.get("imageUrl")).trim() : null;
        String tag = payload.containsKey("tag") && payload.get("tag") != null ? String.valueOf(payload.get("tag")).trim() : "Clinical Discussion";

        CommunityPost post = new CommunityPost(communityId, doctorId, authorName, authorAvatar, authorSpecialty, tag, content, imageUrl);
        postRepo.save(post);

        return formatCommunity(community, doctorId);
    }

    @Transactional
    public Map<String, Object> togglePostLike(Long communityId, Long postId, Long doctorId) {
        Community community = communityRepo.findById(communityId)
                .orElseThrow(() -> new IllegalArgumentException("Community not found"));
        CommunityPost post = postRepo.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));

        if (doctorId != null) {
            Optional<CommunityPostLike> existing = likeRepo.findByCommunityPostIdAndDoctorId(postId, doctorId);
            if (existing.isPresent()) {
                likeRepo.delete(existing.get());
                post.setLikes(Math.max(0, post.getLikes() - 1));
            } else {
                likeRepo.save(new CommunityPostLike(postId, doctorId));
                post.setLikes(post.getLikes() + 1);
            }
            postRepo.save(post);
        }

        return formatCommunity(community, doctorId);
    }

    @Transactional
    public Map<String, Object> addComment(Long communityId, Long postId, String text, Long authorId) {
        Community community = communityRepo.findById(communityId)
                .orElseThrow(() -> new IllegalArgumentException("Community not found"));
        if (!postRepo.existsById(postId)) {
            throw new IllegalArgumentException("Post not found");
        }

        DoctorProfile doc = authorId != null ? doctorRepo.findById(authorId).orElse(null) : null;
        String authorName = doc != null ? doc.getName() : "Doctor";
        String authorAvatar = doc != null ? doc.getAvatar() : null;

        CommunityPostComment comment = new CommunityPostComment(postId, authorId, authorName, authorAvatar, text.trim());
        commentRepo.save(comment);

        return formatCommunity(community, authorId);
    }

    @Transactional
    public Map<String, Object> addCase(Long communityId, Map<String, Object> payload, Long authorId) {
        Community community = communityRepo.findById(communityId)
                .orElseThrow(() -> new IllegalArgumentException("Community not found"));

        DoctorProfile doc = authorId != null ? doctorRepo.findById(authorId).orElse(null) : null;
        String authorName = doc != null ? doc.getName() : "Doctor";
        String authorAvatar = doc != null ? doc.getAvatar() : null;

        String title = String.valueOf(payload.getOrDefault("title", "")).trim();
        String species = payload.containsKey("species") ? String.valueOf(payload.get("species")).trim() : "Canine";
        String age = payload.containsKey("age") ? String.valueOf(payload.get("age")).trim() : "Adult";
        String diagnosis = payload.containsKey("diagnosis") ? String.valueOf(payload.get("diagnosis")).trim() : "";
        String treatment = payload.containsKey("treatment") ? String.valueOf(payload.get("treatment")).trim() : "";
        String imageUrl = payload.containsKey("imageUrl") && payload.get("imageUrl") != null ? String.valueOf(payload.get("imageUrl")).trim() : null;

        CommunityCase cCase = new CommunityCase(communityId, authorId, authorName, authorAvatar, title, species, age, diagnosis, treatment, imageUrl);
        caseRepo.save(cCase);

        return formatCommunity(community, authorId);
    }

    @Transactional
    public Map<String, Object> addReel(Long communityId, Map<String, Object> payload, Long authorId) {
        Community community = communityRepo.findById(communityId)
                .orElseThrow(() -> new IllegalArgumentException("Community not found"));

        DoctorProfile doc = authorId != null ? doctorRepo.findById(authorId).orElse(null) : null;
        String authorName = doc != null ? doc.getName() : "Doctor";

        String title = String.valueOf(payload.getOrDefault("title", "")).trim();
        String videoUrl = String.valueOf(payload.getOrDefault("videoUrl", "")).trim();
        String thumbnail = payload.containsKey("thumbnail") && payload.get("thumbnail") != null ? String.valueOf(payload.get("thumbnail")).trim() : null;
        String duration = payload.containsKey("duration") ? String.valueOf(payload.get("duration")).trim() : "0:45";

        CommunityReel reel = new CommunityReel(communityId, authorId, authorName, title, videoUrl, thumbnail, duration);
        reelRepo.save(reel);

        return formatCommunity(community, authorId);
    }

    @Transactional
    public Map<String, Object> deletePost(Long communityId, Long postId, Long doctorId) {
        Community community = communityRepo.findById(communityId)
                .orElseThrow(() -> new IllegalArgumentException("Community not found"));
        CommunityPost post = postRepo.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));

        likeRepo.deleteAll(likeRepo.findByCommunityPostId(postId));
        commentRepo.deleteAll(commentRepo.findByCommunityPostIdOrderByCreatedAtAsc(postId));
        postRepo.delete(post);

        return formatCommunity(community, doctorId);
    }

    @Transactional
    public Map<String, Object> deleteCase(Long communityId, Long caseId, Long doctorId) {
        Community community = communityRepo.findById(communityId)
                .orElseThrow(() -> new IllegalArgumentException("Community not found"));
        CommunityCase cCase = caseRepo.findById(caseId)
                .orElseThrow(() -> new IllegalArgumentException("Case not found"));

        caseRepo.delete(cCase);

        return formatCommunity(community, doctorId);
    }

    @Transactional
    public Map<String, Object> deleteReel(Long communityId, Long reelId, Long doctorId) {
        Community community = communityRepo.findById(communityId)
                .orElseThrow(() -> new IllegalArgumentException("Community not found"));
        CommunityReel reel = reelRepo.findById(reelId)
                .orElseThrow(() -> new IllegalArgumentException("Reel not found"));

        reelRepo.delete(reel);

        return formatCommunity(community, doctorId);
    }

    @Transactional
    public Map<String, Object> updateCoverPhoto(Long communityId, String coverImageUrl, Long doctorId) {
        Community community = communityRepo.findById(communityId)
                .orElseThrow(() -> new IllegalArgumentException("Community not found"));

        community.setCoverImage(coverImageUrl);
        communityRepo.save(community);

        return formatCommunity(community, doctorId);
    }

    @Transactional
    public Map<String, Object> sendMessage(Long communityId, String text, Long senderId) {
        Community community = communityRepo.findById(communityId)
                .orElseThrow(() -> new IllegalArgumentException("Community not found"));

        DoctorProfile doc = senderId != null ? doctorRepo.findById(senderId).orElse(null) : null;
        String senderName = doc != null ? doc.getName() : "Doctor";
        String senderAvatar = doc != null ? doc.getAvatar() : null;

        CommunityMessage msg = new CommunityMessage(communityId, senderId, senderName, senderAvatar, text.trim());
        messageRepo.save(msg);

        return formatCommunity(community, senderId);
    }

    @Transactional
    public Map<String, Object> joinByCode(String code, Long doctorId) {
        if (code == null || code.isBlank()) {
            throw new IllegalArgumentException("Invalid invite code");
        }
        String cleanCode = code.trim().toUpperCase();
        if (cleanCode.contains("CODE=")) {
            cleanCode = cleanCode.substring(cleanCode.indexOf("CODE=") + 5);
            if (cleanCode.contains("&")) {
                cleanCode = cleanCode.substring(0, cleanCode.indexOf("&"));
            }
        }

        final String targetCode = cleanCode;
        Community community = communityRepo.findByInviteCodeIgnoreCase(targetCode)
                .or(() -> {
                    try {
                        String numStr = targetCode.replaceAll("[^0-9]", "");
                        if (!numStr.isEmpty()) {
                            return communityRepo.findById(Long.parseLong(numStr));
                        }
                    } catch (Exception ignored) {}
                    return Optional.empty();
                })
                .orElseThrow(() -> new IllegalArgumentException("Community not found for invite code: " + code));

        return joinCommunity(community.getId(), doctorId);
    }

    // Helper: format community entity into full UI-compatible JSON representation
    private Map<String, Object> formatCommunity(Community c, Long currentDoctorId) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", c.getId());
        map.put("name", c.getName());
        map.put("category", c.getCategory());
        map.put("description", c.getDescription() != null ? c.getDescription() : "");
        map.put("privacy", c.getPrivacy());
        map.put("coverGradient", c.getCoverGradient());
        map.put("coverImage", c.getCoverImage());
        map.put("creatorId", c.getCreatorId());
        map.put("creatorName", c.getCreatorName());
        map.put("createdAt", c.getCreatedAt() != null ? c.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")) : "");
        map.put("inviteCode", c.getInviteCode());

        // Live doctor profile lookup map for up-to-date name, avatar, specialty
        Map<Long, DoctorProfile> doctorById = new HashMap<>();
        List<DoctorProfile> allDoctors = doctorRepo.findAll();
        for (DoctorProfile dp : allDoctors) {
            if (dp.getId() != null) {
                doctorById.put(dp.getId(), dp);
            }
        }

        java.util.function.BiFunction<Long, String, DoctorProfile> findDoc = (docId, docName) -> {
            if (docId != null && doctorById.containsKey(docId)) {
                return doctorById.get(docId);
            }
            if (docName != null && !docName.isBlank()) {
                String cleanTarget = docName.toLowerCase().replaceAll("(?i)^dr\\.?\\s*", "").trim();
                for (DoctorProfile dp : allDoctors) {
                    if (dp.getName() != null) {
                        String clean = dp.getName().toLowerCase().replaceAll("(?i)^dr\\.?\\s*", "").trim();
                        if (clean.equals(cleanTarget)) {
                            return dp;
                        }
                    }
                }
            }
            return null;
        };

        DoctorProfile creatorDoc = findDoc.apply(c.getCreatorId(), c.getCreatorName());
        if (creatorDoc != null) {
            if (creatorDoc.getName() != null) map.put("creatorName", creatorDoc.getName());
            if (creatorDoc.getAvatar() != null) map.put("creatorAvatar", creatorDoc.getAvatar());
        }

        // Members
        List<CommunityMember> members = memberRepo.findByCommunityIdOrderByJoinedAtAsc(c.getId());
        List<Map<String, Object>> memberList = new ArrayList<>();
        for (CommunityMember m : members) {
            DoctorProfile dp = findDoc.apply(m.getDoctorId(), m.getDoctorName());
            Map<String, Object> mObj = new LinkedHashMap<>();
            mObj.put("id", m.getDoctorId());
            mObj.put("name", dp != null && dp.getName() != null ? dp.getName() : m.getDoctorName());
            mObj.put("role", m.getRole());
            mObj.put("specialty", dp != null && dp.getSpecialty() != null ? dp.getSpecialty() : m.getSpecialty());
            mObj.put("city", dp != null && dp.getCity() != null ? dp.getCity() : m.getCity());
            mObj.put("avatar", dp != null && dp.getAvatar() != null ? dp.getAvatar() : m.getAvatar());
            memberList.add(mObj);
        }
        map.put("members", memberList);

        // Pending Invites list
        List<CommunityInvite> pendingInvites = inviteRepo.findByCommunityIdAndStatus(c.getId(), "PENDING");
        List<Long> pendingDocIds = new ArrayList<>();
        Map<String, Object> myPendingInviteMap = null;
        for (CommunityInvite inv : pendingInvites) {
            pendingDocIds.add(inv.getInviteeDoctorId());
            if (currentDoctorId != null && currentDoctorId.equals(inv.getInviteeDoctorId())) {
                DoctorProfile inviterDoc = findDoc.apply(inv.getInviterId(), inv.getInviterName());
                myPendingInviteMap = new LinkedHashMap<>();
                myPendingInviteMap.put("id", inv.getId());
                myPendingInviteMap.put("communityId", inv.getCommunityId());
                myPendingInviteMap.put("communityName", inv.getCommunityName());
                myPendingInviteMap.put("inviterId", inv.getInviterId());
                myPendingInviteMap.put("inviterName", inviterDoc != null && inviterDoc.getName() != null ? inviterDoc.getName() : inv.getInviterName());
                myPendingInviteMap.put("inviterAvatar", inviterDoc != null && inviterDoc.getAvatar() != null ? inviterDoc.getAvatar() : inv.getInviterAvatar());
                myPendingInviteMap.put("createdAt", formatRelativeTime(inv.getCreatedAt()));
            }
        }
        map.put("pendingInviteDoctorIds", pendingDocIds);
        map.put("hasPendingInviteForMe", myPendingInviteMap != null);
        map.put("myPendingInvite", myPendingInviteMap);

        // Posts
        List<CommunityPost> posts = postRepo.findByCommunityIdOrderByCreatedAtDesc(c.getId());
        List<Map<String, Object>> postList = new ArrayList<>();
        for (CommunityPost p : posts) {
            DoctorProfile dp = findDoc.apply(p.getAuthorId(), p.getAuthorName());
            Map<String, Object> pObj = new LinkedHashMap<>();
            pObj.put("id", p.getId());
            pObj.put("authorId", p.getAuthorId());
            pObj.put("authorName", dp != null && dp.getName() != null ? dp.getName() : p.getAuthorName());
            pObj.put("authorAvatar", dp != null && dp.getAvatar() != null ? dp.getAvatar() : p.getAuthorAvatar());
            pObj.put("authorSpecialty", dp != null && dp.getSpecialty() != null ? dp.getSpecialty() : p.getAuthorSpecialty());
            pObj.put("tag", p.getTag());
            pObj.put("content", p.getContent());
            pObj.put("imageUrl", p.getImageUrl());
            pObj.put("timestamp", formatRelativeTime(p.getCreatedAt()));
            pObj.put("likes", p.getLikes());

            boolean likedByMe = currentDoctorId != null && likeRepo.existsByCommunityPostIdAndDoctorId(p.getId(), currentDoctorId);
            pObj.put("likedByMe", likedByMe);

            // Comments
            List<CommunityPostComment> comments = commentRepo.findByCommunityPostIdOrderByCreatedAtAsc(p.getId());
            List<Map<String, Object>> commentList = new ArrayList<>();
            for (CommunityPostComment comm : comments) {
                DoctorProfile commDoc = findDoc.apply(comm.getAuthorId(), comm.getAuthorName());
                Map<String, Object> cObj = new LinkedHashMap<>();
                cObj.put("id", comm.getId());
                cObj.put("authorId", comm.getAuthorId());
                cObj.put("authorName", commDoc != null && commDoc.getName() != null ? commDoc.getName() : comm.getAuthorName());
                cObj.put("authorAvatar", commDoc != null && commDoc.getAvatar() != null ? commDoc.getAvatar() : comm.getAuthorAvatar());
                cObj.put("text", comm.getText());
                cObj.put("timestamp", formatRelativeTime(comm.getCreatedAt()));
                commentList.add(cObj);
            }
            pObj.put("comments", commentList);

            postList.add(pObj);
        }
        map.put("posts", postList);

        // Cases
        List<CommunityCase> cases = caseRepo.findByCommunityIdOrderByCreatedAtDesc(c.getId());
        List<Map<String, Object>> caseList = new ArrayList<>();
        for (CommunityCase cs : cases) {
            DoctorProfile dp = findDoc.apply(cs.getAuthorId(), cs.getAuthorName());
            Map<String, Object> csObj = new LinkedHashMap<>();
            csObj.put("id", cs.getId());
            csObj.put("authorId", cs.getAuthorId());
            csObj.put("authorName", dp != null && dp.getName() != null ? dp.getName() : cs.getAuthorName());
            csObj.put("authorAvatar", dp != null && dp.getAvatar() != null ? dp.getAvatar() : cs.getAuthorAvatar());
            csObj.put("title", cs.getTitle());
            csObj.put("species", cs.getSpecies());
            csObj.put("age", cs.getAge());
            csObj.put("diagnosis", cs.getDiagnosis());
            csObj.put("treatment", cs.getTreatment());
            csObj.put("imageUrl", cs.getImageUrl());
            csObj.put("timestamp", formatRelativeTime(cs.getCreatedAt()));
            caseList.add(csObj);
        }
        map.put("cases", caseList);

        // Reels
        List<CommunityReel> reels = reelRepo.findByCommunityIdOrderByCreatedAtDesc(c.getId());
        List<Map<String, Object>> reelList = new ArrayList<>();
        for (CommunityReel r : reels) {
            DoctorProfile dp = findDoc.apply(r.getAuthorId(), r.getAuthorName());
            Map<String, Object> rObj = new LinkedHashMap<>();
            rObj.put("id", r.getId());
            rObj.put("authorId", r.getAuthorId());
            rObj.put("authorName", dp != null && dp.getName() != null ? dp.getName() : r.getAuthorName());
            rObj.put("title", r.getTitle());
            rObj.put("videoUrl", r.getVideoUrl());
            rObj.put("thumbnail", r.getThumbnail());
            rObj.put("views", r.getViews());
            rObj.put("duration", r.getDuration());
            rObj.put("timestamp", formatRelativeTime(r.getCreatedAt()));
            reelList.add(rObj);
        }
        map.put("reels", reelList);

        // Chat messages
        List<CommunityMessage> messages = messageRepo.findByCommunityIdOrderByCreatedAtAsc(c.getId());
        List<Map<String, Object>> msgList = new ArrayList<>();
        for (CommunityMessage m : messages) {
            DoctorProfile dp = findDoc.apply(m.getSenderId(), m.getSenderName());
            Map<String, Object> mObj = new LinkedHashMap<>();
            mObj.put("id", m.getId());
            mObj.put("senderId", m.getSenderId());
            mObj.put("senderName", dp != null && dp.getName() != null ? dp.getName() : m.getSenderName());
            mObj.put("senderAvatar", dp != null && dp.getAvatar() != null ? dp.getAvatar() : m.getSenderAvatar());
            mObj.put("text", m.getText());
            mObj.put("timestamp", m.getCreatedAt() != null ? m.getCreatedAt().format(DateTimeFormatter.ofPattern("hh:mm a")) : "Just now");
            msgList.add(mObj);
        }
        map.put("chatMessages", msgList);

        return map;
    }

    @Transactional
    public boolean deleteCommunity(Long communityId, Long requesterDoctorId) {
        Optional<Community> commOpt = communityRepo.findById(communityId);
        if (commOpt.isEmpty()) return false;
        Community community = commOpt.get();

        // Check permission if requesterDoctorId is provided
        if (requesterDoctorId != null && requesterDoctorId > 0) {
            boolean isCreator = community.getCreatorId() != null && community.getCreatorId().equals(requesterDoctorId);
            boolean isAdminMember = memberRepo.findByCommunityIdAndDoctorId(communityId, requesterDoctorId)
                    .map(m -> m.getRole() != null && (m.getRole().contains("Admin") || m.getRole().contains("Founder")))
                    .orElse(false);

            // Log for audit tracking
            System.out.println("Community " + communityId + " delete requested by doctor " + requesterDoctorId + " (isCreator=" + isCreator + ", isAdminMember=" + isAdminMember + ")");
        }

        // 1. Delete all posts and their comments and likes
        List<CommunityPost> posts = postRepo.findByCommunityIdOrderByCreatedAtDesc(communityId);
        for (CommunityPost post : posts) {
            likeRepo.deleteAll(likeRepo.findByCommunityPostId(post.getId()));
            commentRepo.deleteAll(commentRepo.findByCommunityPostIdOrderByCreatedAtAsc(post.getId()));
        }
        postRepo.deleteAll(posts);

        // 2. Delete all cases
        caseRepo.deleteAll(caseRepo.findByCommunityIdOrderByCreatedAtDesc(communityId));

        // 3. Delete all reels
        reelRepo.deleteAll(reelRepo.findByCommunityIdOrderByCreatedAtDesc(communityId));

        // 4. Delete all messages
        messageRepo.deleteAll(messageRepo.findByCommunityIdOrderByCreatedAtAsc(communityId));

        // 5. Delete all invites
        inviteRepo.deleteAll(inviteRepo.findByCommunityId(communityId));

        // 6. Delete all members
        memberRepo.deleteAll(memberRepo.findByCommunityIdOrderByJoinedAtAsc(communityId));

        // 7. Delete the community itself
        communityRepo.delete(community);
        return true;
    }

    private String formatRelativeTime(LocalDateTime dateTime) {
        if (dateTime == null) return "Just now";
        Duration duration = Duration.between(dateTime, LocalDateTime.now());
        long seconds = duration.getSeconds();
        if (seconds < 60) return "Just now";
        long minutes = duration.toMinutes();
        if (minutes < 60) return minutes + "m ago";
        long hours = duration.toHours();
        if (hours < 24) return hours + "h ago";
        long days = duration.toDays();
        if (days < 7) return days + "d ago";
        return dateTime.format(DateTimeFormatter.ofPattern("MMM d, yyyy"));
    }
}
