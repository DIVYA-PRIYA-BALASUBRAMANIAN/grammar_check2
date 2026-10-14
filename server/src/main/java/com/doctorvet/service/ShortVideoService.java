package com.doctorvet.service;

import com.doctorvet.model.ShortVideo;
import com.doctorvet.repository.ShortVideoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ShortVideoService {

    private final ShortVideoRepository videoRepo;

    public ShortVideoService(ShortVideoRepository videoRepo) {
        this.videoRepo = videoRepo;
    }

    public List<ShortVideo> getAllVideos() {
        return videoRepo.findAll();
    }

    @Transactional
    public ShortVideo createVideo(ShortVideo video) {
        if (video.getViews() == null || video.getViews().isBlank()) {
            video.setViews("1");
        }
        if (video.getViewsCount() == 0) {
            video.setViewsCount(1);
        }
        return videoRepo.save(video);
    }
}
