package com.fundwise.api.repository.compliance;

import com.fundwise.api.model.compliance.WatchlistMatch;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WatchlistMatchRepository extends JpaRepository<WatchlistMatch, Long> {

    Optional<WatchlistMatch> findByMatchId(String matchId);

    List<WatchlistMatch> findByUserId(Long userId);

    Page<WatchlistMatch> findByStatus(WatchlistMatch.MatchStatus status, Pageable pageable);

    @Query("SELECT m FROM WatchlistMatch m WHERE m.matchScore >= :minScore")
    List<WatchlistMatch> findHighConfidenceMatches(@Param("minScore") double minScore);

    @Query("SELECT COUNT(m) FROM WatchlistMatch m WHERE m.status = :status")
    Long countByStatus(@Param("status") WatchlistMatch.MatchStatus status);
}
