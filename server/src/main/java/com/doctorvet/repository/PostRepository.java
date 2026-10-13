package com.doctorvet.repository;

import com.doctorvet.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByPostType(String postType);
    List<Post> findAllByOrderByCreatedAtDesc();
}
