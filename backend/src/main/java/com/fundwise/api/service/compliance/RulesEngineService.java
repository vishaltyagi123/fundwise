package com.fundwise.api.service.compliance;

import com.fundwise.api.model.Transaction;
import com.fundwise.api.model.User;
import com.fundwise.api.model.compliance.ComplianceAlert;
import com.fundwise.api.model.compliance.DetectionRule;
import com.fundwise.api.repository.TransactionRepository;
import com.fundwise.api.repository.compliance.ComplianceAlertRepository;
import com.fundwise.api.repository.compliance.DetectionRuleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class RulesEngineService {

    private final DetectionRuleRepository ruleRepository;
    private final ComplianceAlertRepository alertRepository;
    private final TransactionRepository transactionRepository;

    private static final Set<String> HIGH_RISK_COUNTRIES = Set.of(
        "AF", "BY", "CF", "CU", "CD", "IR", "IQ", "LB", "LY", "ML",
        "MM", "NI", "KP", "RU", "SO", "SS", "SD", "SY", "VE", "YE", "ZW"
    );

    /**
     * Evaluate all active rules against a transaction
     */
    @Transactional
    public List<ComplianceAlert> evaluateTransaction(Transaction transaction) {
        List<ComplianceAlert> generatedAlerts = new ArrayList<>();
        List<DetectionRule> activeRules = ruleRepository.findByEnabledTrue();

        for (DetectionRule rule : activeRules) {
            Optional<ComplianceAlert> alert = evaluateRule(rule, transaction);
            alert.ifPresent(a -> {
                alertRepository.save(a);
                generatedAlerts.add(a);
                log.info("Alert generated: {} for transaction {}", a.getAlertNumber(), transaction.getReferenceNumber());
            });
        }

        return generatedAlerts;
    }

    /**
     * Evaluate a single rule against a transaction
     */
    private Optional<ComplianceAlert> evaluateRule(DetectionRule rule, Transaction transaction) {
        return switch (rule.getType()) {
            case THRESHOLD_BREACH -> evaluateThresholdRule(rule, transaction);
            case STRUCTURING -> evaluateStructuringRule(rule, transaction);
            case VELOCITY -> evaluateVelocityRule(rule, transaction);
            case HIGH_RISK_JURISDICTION -> evaluateHighRiskJurisdictionRule(rule, transaction);
            default -> Optional.empty();
        };
    }

    /**
     * Threshold breach: Amount exceeds configured limit
     */
    private Optional<ComplianceAlert> evaluateThresholdRule(DetectionRule rule, Transaction transaction) {
        if (rule.getThresholdAmount() == null) return Optional.empty();

        if (transaction.getAmount().compareTo(rule.getThresholdAmount()) > 0) {
            return Optional.of(createAlert(
                rule,
                transaction,
                String.format("Transaction amount %s exceeds threshold of %s",
                    transaction.getAmount(), rule.getThresholdAmount()),
                calculateRiskScore(rule, transaction)
            ));
        }
        return Optional.empty();
    }

    /**
     * Structuring: Multiple transactions below threshold within time window
     */
    private Optional<ComplianceAlert> evaluateStructuringRule(DetectionRule rule, Transaction transaction) {
        if (rule.getThresholdAmount() == null || rule.getTimeWindowHours() == null ||
            rule.getTransactionCount() == null) return Optional.empty();

        // Only check if current transaction is below threshold (structuring pattern)
        if (transaction.getAmount().compareTo(rule.getThresholdAmount()) >= 0) {
            return Optional.empty();
        }

        User user = transaction.getFromAccount() != null ?
            transaction.getFromAccount().getUser() : transaction.getToAccount().getUser();

        if (user == null) return Optional.empty();

        LocalDateTime startTime = LocalDateTime.now().minusHours(rule.getTimeWindowHours());
        List<Transaction> recentTransactions = transactionRepository
            .findByUserIdAndDateRange(user.getId(), startTime);

        // Count transactions below threshold
        long belowThresholdCount = recentTransactions.stream()
            .filter(t -> t.getAmount().compareTo(rule.getThresholdAmount()) < 0)
            .count();

        BigDecimal totalAmount = recentTransactions.stream()
            .filter(t -> t.getAmount().compareTo(rule.getThresholdAmount()) < 0)
            .map(Transaction::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (belowThresholdCount >= rule.getTransactionCount()) {
            return Optional.of(createAlert(
                rule,
                transaction,
                String.format("Potential structuring detected: %d transactions totaling %s within %d hours",
                    belowThresholdCount, totalAmount, rule.getTimeWindowHours()),
                calculateRiskScore(rule, transaction)
            ));
        }
        return Optional.empty();
    }

    /**
     * Velocity: Unusual frequency of transactions
     */
    private Optional<ComplianceAlert> evaluateVelocityRule(DetectionRule rule, Transaction transaction) {
        if (rule.getVelocityLimit() == null || rule.getTimeWindowHours() == null) return Optional.empty();

        User user = transaction.getFromAccount() != null ?
            transaction.getFromAccount().getUser() : transaction.getToAccount().getUser();

        if (user == null) return Optional.empty();

        LocalDateTime startTime = LocalDateTime.now().minusHours(rule.getTimeWindowHours());
        List<Transaction> recentTransactions = transactionRepository
            .findByUserIdAndDateRange(user.getId(), startTime);

        if (recentTransactions.size() >= rule.getVelocityLimit()) {
            return Optional.of(createAlert(
                rule,
                transaction,
                String.format("Unusual transaction velocity: %d transactions within %d hours (limit: %d)",
                    recentTransactions.size(), rule.getTimeWindowHours(), rule.getVelocityLimit()),
                calculateRiskScore(rule, transaction)
            ));
        }
        return Optional.empty();
    }

    /**
     * High-risk jurisdiction: Transaction involves sanctioned country
     */
    private Optional<ComplianceAlert> evaluateHighRiskJurisdictionRule(DetectionRule rule, Transaction transaction) {
        // In real implementation, would check country from transaction metadata
        // For demo, using rule's configured country codes
        Set<String> riskCountries = rule.getCountryCodes() != null ?
            new HashSet<>(Arrays.asList(rule.getCountryCodes().split(","))) :
            HIGH_RISK_COUNTRIES;

        // Simulated check - in production would extract country from transaction data
        String transactionCountry = extractCountryFromTransaction(transaction);

        if (transactionCountry != null && riskCountries.contains(transactionCountry.toUpperCase())) {
            return Optional.of(createAlert(
                rule,
                transaction,
                String.format("Transaction involves high-risk jurisdiction: %s", transactionCountry),
                calculateRiskScore(rule, transaction)
            ));
        }
        return Optional.empty();
    }

    private String extractCountryFromTransaction(Transaction transaction) {
        // Placeholder - would extract from SWIFT codes, IP addresses, etc.
        return null;
    }

    private ComplianceAlert createAlert(DetectionRule rule, Transaction transaction,
                                        String description, int riskScore) {
        User user = transaction.getFromAccount() != null ?
            transaction.getFromAccount().getUser() :
            transaction.getToAccount().getUser();

        return ComplianceAlert.builder()
            .alertNumber(generateAlertNumber())
            .rule(rule)
            .transaction(transaction)
            .user(user)
            .alertType(rule.getType().name())
            .severity(rule.getSeverity())
            .description(description)
            .flaggedAmount(transaction.getAmount())
            .riskScore(riskScore)
            .status(ComplianceAlert.AlertStatus.OPEN)
            .build();
    }

    private int calculateRiskScore(DetectionRule rule, Transaction transaction) {
        int baseScore = switch (rule.getSeverity()) {
            case LOW -> 25;
            case MEDIUM -> 50;
            case HIGH -> 75;
            case CRITICAL -> 90;
        };

        // Adjust based on amount
        if (transaction.getAmount().compareTo(new BigDecimal("10000")) > 0) {
            baseScore += 10;
        }

        return Math.min(baseScore, 100);
    }

    private String generateAlertNumber() {
        return "ALT-" + System.currentTimeMillis() + "-" +
               UUID.randomUUID().toString().substring(0, 4).toUpperCase();
    }

    /**
     * Get all active rules
     */
    public List<DetectionRule> getActiveRules() {
        return ruleRepository.findByEnabledTrue();
    }

    /**
     * Toggle rule status
     */
    @Transactional
    public DetectionRule toggleRule(Long ruleId) {
        DetectionRule rule = ruleRepository.findById(ruleId)
            .orElseThrow(() -> new RuntimeException("Rule not found"));
        rule.setEnabled(!rule.getEnabled());
        return ruleRepository.save(rule);
    }
}
