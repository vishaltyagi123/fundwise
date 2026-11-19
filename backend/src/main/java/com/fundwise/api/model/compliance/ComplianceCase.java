package com.fundwise.api.model.compliance;

import com.fundwise.api.model.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "compliance_cases")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplianceCase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "case_number", nullable = false, unique = true)
    private String caseNumber;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "case_type_enum")
    private CaseType type;

    @Column(name = "case_type")
    private String caseType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private CasePriority priority = CasePriority.MEDIUM;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private CaseStatus status = CaseStatus.OPEN;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to")
    private User assignedTo;

    @OneToMany(mappedBy = "complianceCase", cascade = CascadeType.ALL)
    @Builder.Default
    private List<ComplianceAlert> alerts = new ArrayList<>();

    @Column(name = "investigation_notes", columnDefinition = "TEXT")
    private String investigationNotes;

    @Column(columnDefinition = "TEXT")
    private String decision;

    @Enumerated(EnumType.STRING)
    @Column(name = "risk_level")
    private DetectionRule.Severity riskLevel;

    @Column(name = "total_flagged_amount", precision = 19, scale = 4)
    private BigDecimal totalFlaggedAmount;

    @Column(name = "sar_filed")
    @Builder.Default
    private Boolean sarFiled = false;

    @Column(name = "sar_reference")
    private String sarReference;

    @Column(name = "due_date")
    private LocalDateTime dueDate;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "closed_by")
    private User closedBy;

    @Column(name = "closure_reason", columnDefinition = "TEXT")
    private String closureReason;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum CaseType {
        SUSPICIOUS_TRANSACTION,
        WATCHLIST_HIT,
        UNUSUAL_ACTIVITY,
        KYC_REVIEW,
        SANCTIONS_SCREENING,
        FRAUD_INVESTIGATION
    }

    public enum CasePriority {
        LOW, MEDIUM, HIGH, CRITICAL
    }

    public enum CaseStatus {
        OPEN,
        IN_PROGRESS,
        INVESTIGATING,
        PENDING_REVIEW,
        ESCALATED,
        CLOSED,
        CLOSED_NO_ACTION,
        CLOSED_SAR_FILED,
        CLOSED_ACCOUNT_BLOCKED
    }
}