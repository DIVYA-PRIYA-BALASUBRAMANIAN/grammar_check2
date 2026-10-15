package com.doctorvet.service;

import com.doctorvet.model.Campaign;
import com.doctorvet.model.CampaignEvent;
import com.doctorvet.repository.CampaignEventRepository;
import com.doctorvet.repository.CampaignRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CampaignService {

    private final CampaignRepository campaignRepo;
    private final CampaignEventRepository eventRepo;

    public CampaignService(CampaignRepository campaignRepo, CampaignEventRepository eventRepo) {
        this.campaignRepo = campaignRepo;
        this.eventRepo = eventRepo;
    }

    public record CampaignDto(
            String title,
            String description,
            String campaignType,
            String posterUrl,
            String destinationUrl,
            String placement,
            String targetAudience,
            LocalDate startDate,
            LocalDate endDate,
            Double dailyBudget,
            String status
    ) {}

    public record DailyMetric(
            String date,
            long views,
            long clicks
    ) {}

    public record CampaignPerformanceItem(
            Long id,
            String title,
            String status,
            String destinationUrl,
            long views,
            long clicks,
            String ctr
    ) {}

    public record ReportResult(
            long totalViews,
            long totalClicks,
            String ctr,
            List<DailyMetric> chartData,
            List<CampaignPerformanceItem> campaigns
    ) {}

    @Transactional
    public Campaign createCampaign(Long advertiserId, CampaignDto dto) {
        if (dto.title() == null || dto.title().isBlank()) {
            throw new IllegalArgumentException("Campaign title is required");
        }
        if (dto.destinationUrl() == null || dto.destinationUrl().isBlank()) {
            throw new IllegalArgumentException("Destination URL is required");
        }

        String destination = dto.destinationUrl().trim();
        if (!destination.startsWith("http://") && !destination.startsWith("https://")) {
            destination = "https://" + destination;
        }

        Campaign campaign = new Campaign(
                advertiserId,
                dto.title().trim(),
                dto.description(),
                dto.campaignType() != null ? dto.campaignType() : "Sponsored Post",
                dto.posterUrl(),
                destination,
                dto.placement() != null ? dto.placement() : "Feed & Clinical Cases",
                dto.targetAudience() != null ? dto.targetAudience() : "All Veterinarians",
                dto.startDate() != null ? dto.startDate() : LocalDate.now(),
                dto.endDate() != null ? dto.endDate() : LocalDate.now().plusDays(14),
                dto.dailyBudget() != null ? dto.dailyBudget() : 2500.0,
                dto.status() != null ? dto.status() : "Live"
        );

        return campaignRepo.save(campaign);
    }

    public List<Campaign> getAdvertiserCampaigns(Long advertiserId) {
        return campaignRepo.findByAdvertiserIdOrderByCreatedAtDesc(advertiserId);
    }

    public Optional<Campaign> getById(Long id) {
        return campaignRepo.findById(id);
    }

    @Transactional
    public Campaign updateCampaign(Long campaignId, Long advertiserId, CampaignDto dto) {
        Campaign campaign = campaignRepo.findById(campaignId)
                .orElseThrow(() -> new IllegalArgumentException("Campaign not found with ID: " + campaignId));

        if (!campaign.getAdvertiserId().equals(advertiserId)) {
            throw new SecurityException("Unauthorized: You do not own this campaign");
        }

        if (dto.title() != null && !dto.title().isBlank()) campaign.setTitle(dto.title().trim());
        if (dto.description() != null) campaign.setDescription(dto.description());
        if (dto.campaignType() != null) campaign.setCampaignType(dto.campaignType());
        if (dto.posterUrl() != null) campaign.setPosterUrl(dto.posterUrl());
        if (dto.destinationUrl() != null && !dto.destinationUrl().isBlank()) {
            String dest = dto.destinationUrl().trim();
            if (!dest.startsWith("http://") && !dest.startsWith("https://")) dest = "https://" + dest;
            campaign.setDestinationUrl(dest);
        }
        if (dto.placement() != null) campaign.setPlacement(dto.placement());
        if (dto.targetAudience() != null) campaign.setTargetAudience(dto.targetAudience());
        if (dto.startDate() != null) campaign.setStartDate(dto.startDate());
        if (dto.endDate() != null) campaign.setEndDate(dto.endDate());
        if (dto.dailyBudget() != null) campaign.setDailyBudget(dto.dailyBudget());
        if (dto.status() != null) campaign.setStatus(dto.status());

        return campaignRepo.save(campaign);
    }

    @Transactional
    public void deleteCampaign(Long campaignId, Long advertiserId) {
        Campaign campaign = campaignRepo.findById(campaignId)
                .orElseThrow(() -> new IllegalArgumentException("Campaign not found"));

        if (!campaign.getAdvertiserId().equals(advertiserId)) {
            throw new SecurityException("Unauthorized: You do not own this campaign");
        }

        campaignRepo.delete(campaign);
    }

    @Transactional
    public Campaign updateStatus(Long campaignId, String status) {
        Campaign campaign = campaignRepo.findById(campaignId)
                .orElseThrow(() -> new IllegalArgumentException("Campaign not found"));
        campaign.setStatus(status);
        return campaignRepo.save(campaign);
    }

    @Transactional
    public void recordEvent(Long campaignId, String eventType, String userIp, String sessionId, String userAgent) {
        Campaign campaign = campaignRepo.findById(campaignId).orElse(null);
        if (campaign == null) return;

        LocalDate today = LocalDate.now();
        String type = "CLICK".equalsIgnoreCase(eventType) ? "CLICK" : "VIEW";

        // De-duplicate rapid duplicate views from the same IP today
        if (userIp != null && !userIp.isBlank()) {
            boolean alreadyLogged = eventRepo.existsDuplicateToday(campaignId, type, userIp, today);
            if (alreadyLogged && "VIEW".equals(type)) {
                return;
            }
        }

        CampaignEvent event = new CampaignEvent(campaignId, type, userIp, sessionId, userAgent, today);
        eventRepo.save(event);

        if ("CLICK".equals(type)) {
            campaign.setClicksCount(campaign.getClicksCount() + 1);
        } else {
            campaign.setViewsCount(campaign.getViewsCount() + 1);
        }
        campaignRepo.save(campaign);
    }

    public ReportResult getReports(Long advertiserId, String preset, LocalDate customFrom, LocalDate customTo) {
        List<Campaign> campaigns = campaignRepo.findByAdvertiserIdOrderByCreatedAtDesc(advertiserId);
        if (campaigns.isEmpty()) {
            return new ReportResult(0, 0, "0.00%", Collections.emptyList(), Collections.emptyList());
        }

        LocalDate today = LocalDate.now();
        LocalDate fromDate = customFrom != null ? customFrom : today.minusDays(6);
        LocalDate toDate = customTo != null ? customTo : today;

        if (preset != null) {
            switch (preset.trim().toLowerCase()) {
                case "today" -> {
                    fromDate = today;
                    toDate = today;
                }
                case "last 7 days", "7days" -> {
                    fromDate = today.minusDays(6);
                    toDate = today;
                }
                case "last 30 days", "30days" -> {
                    fromDate = today.minusDays(29);
                    toDate = today;
                }
                case "this month", "month" -> {
                    fromDate = today.withDayOfMonth(1);
                    toDate = today;
                }
            }
        }

        List<Long> campaignIds = campaigns.stream().map(Campaign::getId).toList();
        List<CampaignEvent> events = eventRepo.findByCampaignIdInAndEventDateBetween(campaignIds, fromDate, toDate);

        long totalViews = events.stream().filter(e -> "VIEW".equalsIgnoreCase(e.getEventType())).count();
        long totalClicks = events.stream().filter(e -> "CLICK".equalsIgnoreCase(e.getEventType())).count();

        // If no events in table yet, fallback to campaign all-time counters for continuity
        if (totalViews == 0 && totalClicks == 0) {
            totalViews = campaigns.stream().mapToLong(Campaign::getViewsCount).sum();
            totalClicks = campaigns.stream().mapToLong(Campaign::getClicksCount).sum();
        }

        String ctr = totalViews > 0 ? String.format(Locale.US, "%.2f%%", ((double) totalClicks / totalViews) * 100.0) : "0.00%";

        // Build daily chart metrics
        List<DailyMetric> chartData = new ArrayList<>();
        long daysBetween = ChronoUnit.DAYS.between(fromDate, toDate);
        if (daysBetween < 0) daysBetween = 0;
        if (daysBetween > 90) daysBetween = 90;

        for (int i = 0; i <= daysBetween; i++) {
            LocalDate d = fromDate.plusDays(i);
            long dViews = events.stream().filter(e -> e.getEventDate().equals(d) && "VIEW".equalsIgnoreCase(e.getEventType())).count();
            long dClicks = events.stream().filter(e -> e.getEventDate().equals(d) && "CLICK".equalsIgnoreCase(e.getEventType())).count();
            chartData.add(new DailyMetric(d.toString(), dViews, dClicks));
        }

        // Per-campaign performance
        Map<Long, List<CampaignEvent>> eventsByCampaign = events.stream().collect(Collectors.groupingBy(CampaignEvent::getCampaignId));
        List<CampaignPerformanceItem> perfList = new ArrayList<>();

        for (Campaign c : campaigns) {
            List<CampaignEvent> cEvents = eventsByCampaign.getOrDefault(c.getId(), Collections.emptyList());
            long cViews = cEvents.stream().filter(e -> "VIEW".equalsIgnoreCase(e.getEventType())).count();
            long cClicks = cEvents.stream().filter(e -> "CLICK".equalsIgnoreCase(e.getEventType())).count();

            if (cViews == 0 && cClicks == 0) {
                cViews = c.getViewsCount();
                cClicks = c.getClicksCount();
            }

            String cCtr = cViews > 0 ? String.format(Locale.US, "%.2f%%", ((double) cClicks / cViews) * 100.0) : "0.00%";
            perfList.add(new CampaignPerformanceItem(c.getId(), c.getTitle(), c.getStatus(), c.getDestinationUrl(), cViews, cClicks, cCtr));
        }

        return new ReportResult(totalViews, totalClicks, ctr, chartData, perfList);
    }

    public String generateCsv(Long advertiserId, LocalDate from, LocalDate to) {
        ReportResult reports = getReports(advertiserId, null, from, to);

        StringBuilder sb = new StringBuilder();
        sb.append("Campaign ID,Campaign Title,Status,Destination URL,Views,Clicks,CTR\n");

        for (CampaignPerformanceItem item : reports.campaigns()) {
            sb.append(item.id()).append(",")
              .append("\"").append(item.title().replace("\"", "\"\"")).append("\",")
              .append(item.status()).append(",")
              .append("\"").append(item.destinationUrl().replace("\"", "\"\"")).append("\",")
              .append(item.views()).append(",")
              .append(item.clicks()).append(",")
              .append(item.ctr()).append("\n");
        }

        return sb.toString();
    }

    public List<Campaign> getPublicLiveCampaigns(String placement) {
        List<Campaign> live = campaignRepo.findByStatusIgnoreCase("Live");
        if (placement == null || placement.isBlank()) {
            return live;
        }
        return live.stream()
                .filter(c -> c.getPlacement().toLowerCase().contains(placement.toLowerCase())
                        || placement.toLowerCase().contains(c.getPlacement().toLowerCase()))
                .toList();
    }
}
