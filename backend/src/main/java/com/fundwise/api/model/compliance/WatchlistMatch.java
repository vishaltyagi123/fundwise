package com.fundwise.api.model.compliance;

import com.fundwise.api.model.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "watchlist_matches")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WatchlistMatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "match_id", nullable = false, unique = true)
    private String matchId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "watchlist_entry_id", nullable = false)
    private WatchlistEntry watchlistEntry;

    @Column(name = "match_score", nullable = false)
    private Double matchScore; // 0.0 to 1.0 (percentage similarity)

    @Column(name = "match_type", nullable = false)
    private String matchType; // EXACT, FUZZY, PARTIAL

    @Column(name = "matched_fields")
    private String matchedFields; // Which fields matched

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private MatchStatus status = MatchStatus.PENDING_REVIEW;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "review_notes", columnDefinition = "TEXT")
    private String reviewNotes;

    @Column(name = "is_true_match")
    private Boolean isTrueMatch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "alert_id")
    private ComplianceAlert alert;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum MatchStatus {
        PENDING_REVIEW,
        CONFIRMED_MATCH,
        FALSE_POSITIVE,
        ESCALATED
    }
}
