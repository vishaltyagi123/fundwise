package com.fundwise.api.model.compliance;

import com.fundwise.api.model.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "compliance_audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplianceAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AuditAction action;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AuditCategory category;

    @Column(name = "entity_type", nullable = false)
    private String entityType;

    @Column(name = "entity_id")
    private Long entityId;

    @Column(name = "entity_reference")
    private String entityReference;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "performed_by")
    private User performedBy;

    @Column(name = "performed_by_name")
    private String performedByName;

    @Column(length = 1000)
    private String description;

    @Column(name = "old_value", length = 2000)
    private String oldValue;

    @Column(name = "new_value", length = 2000)
    private String newValue;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "user_agent")
    private String userAgent;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum AuditAction {
        // Alert actions
        ALERT_CREATED,
        ALERT_VIEWED,
        ALERT_STATUS_CHANGED,
        ALERT_ESCALATED,
        ALERT_RESOLVED,
        ALERT_NOTES_ADDED,

        // Case actions
        CASE_CREATED,
        CASE_VIEWED,
        CASE_ASSIGNED,
        CASE_STATUS_CHANGED,
        CASE_CLOSED,
        CASE_DECISION_MADE,

        // Rule actions
        RULE_CREATED,
        RULE_UPDATED,
        RULE_ENABLED,
        RULE_DISABLED,
        RULE_DELETED,

        // Watchlist actions
        WATCHLIST_ENTRY_ADDED,
        WATCHLIST_ENTRY_UPDATED,
        WATCHLIST_ENTRY_DEACTIVATED,
        WATCHLIST_SCREENING_RUN,
        WATCHLIST_MATCH_FOUND,

        // Monitoring actions
        TRANSACTION_MONITORED,
        BATCH_MONITORING_RUN,
        SCREENING_COMPLETED,

        // Report actions
        REPORT_GENERATED,
        REPORT_EXPORTED,

        // System actions
        SYSTEM_CONFIG_CHANGED,
        USER_ACCESS_GRANTED,
        USER_ACCESS_REVOKED
    }

    public enum AuditCategory {
        ALERT_MANAGEMENT,
        CASE_MANAGEMENT,
        RULE_CONFIGURATION,
        WATCHLIST_MANAGEMENT,
        TRANSACTION_MONITORING,
        SCREENING,
        REPORTING,
        SYSTEM_ADMINISTRATION
    }
}
