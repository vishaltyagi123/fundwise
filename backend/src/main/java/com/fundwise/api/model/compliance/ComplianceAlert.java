package com.fundwise.api.model.compliance;

import com.fundwise.api.model.Transaction;
import com.fundwise.api.model.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "compliance_alerts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplianceAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "alert_number", nullable = false, unique = true)
    private String alertNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rule_id", nullable = false)
    private DetectionRule rule;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_id")
    private Transaction transaction;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "alert_type", nullable = false)
    private String alertType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DetectionRule.Severity severity;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "flagged_amount", precision = 19, scale = 2)
    private BigDecimal flaggedAmount;

    @Column(name = "risk_score")
    private Integer riskScore; // 0-100

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private AlertStatus status = AlertStatus.OPEN;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to")
    private User assignedTo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "case_id")
    private ComplianceCase complianceCase;

    @Column(name = "resolution_notes", columnDefinition = "TEXT")
    private String resolutionNotes;

    @Column(name = "investigator_notes", columnDefinition = "TEXT")
    private String investigatorNotes;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resolved_by")
    private User resolvedBy;

    @Column(name = "is_false_positive")
    @Builder.Default
    private Boolean isFalsePositive = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum AlertStatus {
        OPEN,           // New alert, not reviewed
        UNDER_REVIEW,   // Being investigated
        ESCALATED,      // Escalated to senior compliance
        RESOLVED,       // Investigation complete
        CLOSED,         // No action required
        FALSE_POSITIVE  // Marked as false positive
    }
}