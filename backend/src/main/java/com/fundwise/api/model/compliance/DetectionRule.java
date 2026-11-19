package com.fundwise.api.model.compliance;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "detection_rules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DetectionRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "rule_code", nullable = false, unique = true)
    private String ruleCode;

    @Column(name = "rule_name", nullable = false)
    private String ruleName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RuleType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private RuleCategory category = RuleCategory.AML;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Severity severity = Severity.MEDIUM;

    // Rule parameters stored as JSON
    @Column(name = "threshold_amount", precision = 19, scale = 2)
    private BigDecimal thresholdAmount;

    @Column(name = "time_window_hours")
    private Integer timeWindowHours;

    @Column(name = "transaction_count")
    private Integer transactionCount;

    @Column(name = "velocity_limit")
    private Integer velocityLimit;

    @Column(name = "country_codes")
    private String countryCodes; // Comma-separated high-risk countries

    @Column(nullable = false)
    @Builder.Default
    private Boolean enabled = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum RuleType {
        THRESHOLD_BREACH,       // Amount exceeds limit
        STRUCTURING,            // Multiple small transactions
        VELOCITY,               // Unusual frequency
        HIGH_RISK_JURISDICTION, // Country-based risk
        SELF_HOSTED_WALLET,     // Crypto self-custody
        CRYPTO_TRAVEL_RULE,     // Crypto compliance
        WATCHLIST_MATCH,        // Sanctions/PEP match
        UNUSUAL_PATTERN         // ML-detected anomaly
    }

    public enum RuleCategory {
        AML,        // Anti-Money Laundering
        KYC,        // Know Your Customer
        SANCTIONS,  // Sanctions screening
        FRAUD,      // Fraud detection
        CRYPTO      // Cryptocurrency compliance
    }

    public enum Severity {
        LOW, MEDIUM, HIGH, CRITICAL
    }
}