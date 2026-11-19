package com.fundwise.api.controller.compliance;

import com.fundwise.api.model.Transaction;
import com.fundwise.api.model.User;
import com.fundwise.api.model.compliance.*;
import com.fundwise.api.repository.TransactionRepository;
import com.fundwise.api.repository.UserRepository;
import com.fundwise.api.repository.compliance.*;
import com.fundwise.api.service.compliance.ComplianceAuditService;
import com.fundwise.api.service.compliance.ComplianceReportService;
import com.fundwise.api.service.compliance.RulesEngineService;
import com.fundwise.api.service.compliance.WatchlistScreeningService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/compliance")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'COMPLIANCE_OFFICER')")
public class ComplianceController {

    private final ComplianceAlertRepository alertRepository;
    private final ComplianceCaseRepository caseRepository;
    private final DetectionRuleRepository ruleRepository;
    private final WatchlistRepository watchlistRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final RulesEngineService rulesEngineService;
    private final WatchlistScreeningService watchlistScreeningService;
    private final ComplianceAuditService auditService;
    private final ComplianceReportService reportService;

    // ==================== Dashboard ====================

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        Map<String, Object> dashboard = new HashMap<>();

        // Alert statistics
        long openAlerts = alertRepository.countByStatus(ComplianceAlert.AlertStatus.OPEN);
        long underReviewAlerts = alertRepository.countByStatus(ComplianceAlert.AlertStatus.UNDER_REVIEW);
        long escalatedAlerts = alertRepository.countByStatus(ComplianceAlert.AlertStatus.ESCALATED);
        long resolvedToday = alertRepository.countResolvedSince(LocalDateTime.now().minusDays(1));

        dashboard.put("openAlerts", openAlerts);
        dashboard.put("underReviewAlerts", underReviewAlerts);
        dashboard.put("escalatedAlerts", escalatedAlerts);
        dashboard.put("resolvedToday", resolvedToday);
        dashboard.put("totalAlerts", openAlerts + underReviewAlerts + escalatedAlerts);

        // Case statistics
        long openCases = caseRepository.countByStatus(ComplianceCase.CaseStatus.OPEN);
        long investigatingCases = caseRepository.countByStatus(ComplianceCase.CaseStatus.INVESTIGATING);

        dashboard.put("openCases", openCases);
        dashboard.put("investigatingCases", investigatingCases);

        // Risk distribution
        dashboard.put("highRiskAlerts", alertRepository.countBySeverity(DetectionRule.Severity.HIGH));
        dashboard.put("criticalAlerts", alertRepository.countBySeverity(DetectionRule.Severity.CRITICAL));

        // Watchlist stats
        dashboard.put("watchlistStats", watchlistScreeningService.getWatchlistStats());

        // Active rules
        dashboard.put("activeRules", ruleRepository.countByEnabledTrue());

        // Recent alerts for chart
        List<Object[]> alertsByDay = alertRepository.countByDayLast7Days();
        dashboard.put("alertTrend", alertsByDay);

        // Alert type distribution
        List<Object[]> alertsByType = alertRepository.countByAlertType();
        dashboard.put("alertsByType", alertsByType);

        return ResponseEntity.ok(dashboard);
    }

    // ==================== Alerts ====================

    @GetMapping("/alerts")
    public ResponseEntity<Page<ComplianceAlert>> getAlerts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String severity,
            @RequestParam(required = false) String alertType) {

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<ComplianceAlert> alerts;
        if (status != null) {
            alerts = alertRepository.findByStatus(
                ComplianceAlert.AlertStatus.valueOf(status.toUpperCase()), pageRequest);
        } else if (severity != null) {
            alerts = alertRepository.findBySeverity(
                DetectionRule.Severity.valueOf(severity.toUpperCase()), pageRequest);
        } else {
            alerts = alertRepository.findAll(pageRequest);
        }

        return ResponseEntity.ok(alerts);
    }

    @GetMapping("/alerts/{id}")
    public ResponseEntity<ComplianceAlert> getAlert(@PathVariable Long id) {
        return alertRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/alerts/{id}/status")
    public ResponseEntity<ComplianceAlert> updateAlertStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return alertRepository.findById(id)
            .map(alert -> {
                alert.setStatus(ComplianceAlert.AlertStatus.valueOf(body.get("status").toUpperCase()));
                if (body.containsKey("notes")) {
                    alert.setInvestigatorNotes(body.get("notes"));
                }
                if (alert.getStatus() == ComplianceAlert.AlertStatus.RESOLVED ||
                    alert.getStatus() == ComplianceAlert.AlertStatus.FALSE_POSITIVE) {
                    alert.setResolvedAt(LocalDateTime.now());
                }
                return ResponseEntity.ok(alertRepository.save(alert));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/alerts/{id}/escalate")
    public ResponseEntity<ComplianceCase> escalateAlert(@PathVariable Long id) {
        return alertRepository.findById(id)
            .map(alert -> {
                // Create a case from the alert
                ComplianceCase complianceCase = ComplianceCase.builder()
                    .caseNumber("CASE-" + System.currentTimeMillis())
                    .title("Escalated: " + alert.getAlertType())
                    .description(alert.getDescription())
                    .user(alert.getUser())
                    .priority(mapSeverityToPriority(alert.getSeverity()))
                    .status(ComplianceCase.CaseStatus.OPEN)
                    .caseType(alert.getAlertType())
                    .riskLevel(alert.getSeverity())
                    .totalFlaggedAmount(alert.getFlaggedAmount())
                    .build();

                complianceCase = caseRepository.save(complianceCase);

                // Update alert status
                alert.setStatus(ComplianceAlert.AlertStatus.ESCALATED);
                alert.setComplianceCase(complianceCase);
                alertRepository.save(alert);

                return ResponseEntity.ok(complianceCase);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    // ==================== Cases ====================

    @GetMapping("/cases")
    public ResponseEntity<Page<ComplianceCase>> getCases(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status) {

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<ComplianceCase> cases;
        if (status != null) {
            cases = caseRepository.findByStatus(
                ComplianceCase.CaseStatus.valueOf(status.toUpperCase()), pageRequest);
        } else {
            cases = caseRepository.findAll(pageRequest);
        }

        return ResponseEntity.ok(cases);
    }

    @GetMapping("/cases/{id}")
    public ResponseEntity<ComplianceCase> getCase(@PathVariable Long id) {
        return caseRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/cases/{id}")
    public ResponseEntity<ComplianceCase> updateCase(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return caseRepository.findById(id)
            .map(c -> {
                if (body.containsKey("status")) {
                    c.setStatus(ComplianceCase.CaseStatus.valueOf(body.get("status").toUpperCase()));
                }
                if (body.containsKey("notes")) {
                    c.setInvestigationNotes(body.get("notes"));
                }
                if (body.containsKey("decision")) {
                    c.setDecision(body.get("decision"));
                }
                if (c.getStatus() == ComplianceCase.CaseStatus.CLOSED) {
                    c.setClosedAt(LocalDateTime.now());
                }
                return ResponseEntity.ok(caseRepository.save(c));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    // ==================== Rules ====================

    @GetMapping("/rules")
    public ResponseEntity<List<DetectionRule>> getRules() {
        return ResponseEntity.ok(ruleRepository.findAll());
    }

    @GetMapping("/rules/active")
    public ResponseEntity<List<DetectionRule>> getActiveRules() {
        return ResponseEntity.ok(rulesEngineService.getActiveRules());
    }

    @PostMapping("/rules")
    public ResponseEntity<DetectionRule> createRule(@RequestBody DetectionRule rule) {
        return ResponseEntity.ok(ruleRepository.save(rule));
    }

    @PutMapping("/rules/{id}")
    public ResponseEntity<DetectionRule> updateRule(
            @PathVariable Long id,
            @RequestBody DetectionRule rule) {
        return ruleRepository.findById(id)
            .map(existing -> {
                existing.setRuleName(rule.getRuleName());
                existing.setDescription(rule.getDescription());
                existing.setThresholdAmount(rule.getThresholdAmount());
                existing.setTimeWindowHours(rule.getTimeWindowHours());
                existing.setTransactionCount(rule.getTransactionCount());
                existing.setVelocityLimit(rule.getVelocityLimit());
                existing.setSeverity(rule.getSeverity());
                existing.setEnabled(rule.getEnabled());
                return ResponseEntity.ok(ruleRepository.save(existing));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/rules/{id}/toggle")
    public ResponseEntity<DetectionRule> toggleRule(@PathVariable Long id) {
        return ResponseEntity.ok(rulesEngineService.toggleRule(id));
    }

    // ==================== Watchlist ====================

    @GetMapping("/watchlist")
    public ResponseEntity<Page<WatchlistEntry>> getWatchlist(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(required = false) String type) {

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "updatedAt"));

        Page<WatchlistEntry> entries;
        if (type != null) {
            entries = watchlistRepository.findByType(
                WatchlistEntry.WatchlistType.valueOf(type.toUpperCase()), pageRequest);
        } else {
            entries = watchlistRepository.findAll(pageRequest);
        }

        return ResponseEntity.ok(entries);
    }

    @GetMapping("/watchlist/search")
    public ResponseEntity<List<WatchlistEntry>> searchWatchlist(@RequestParam String query) {
        return ResponseEntity.ok(watchlistScreeningService.searchWatchlist(query));
    }

    @PostMapping("/watchlist")
    public ResponseEntity<WatchlistEntry> addWatchlistEntry(@RequestBody WatchlistEntry entry) {
        entry.setEntryId("WL-" + System.currentTimeMillis());
        entry.setActive(true);
        return ResponseEntity.ok(watchlistRepository.save(entry));
    }

    @PostMapping("/watchlist/screen/{userId}")
    public ResponseEntity<List<WatchlistMatch>> screenUser(@PathVariable Long userId) {
        return userRepository.findById(userId)
            .map(user -> ResponseEntity.ok(watchlistScreeningService.screenUser(user)))
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/watchlist/screen-all")
    public ResponseEntity<Map<Long, List<WatchlistMatch>>> screenAllUsers() {
        return ResponseEntity.ok(watchlistScreeningService.screenAllUsers());
    }

    // ==================== Transaction Monitoring ====================

    @PostMapping("/monitor/transaction/{transactionId}")
    public ResponseEntity<List<ComplianceAlert>> monitorTransaction(@PathVariable Long transactionId) {
        return transactionRepository.findById(transactionId)
            .map(transaction -> ResponseEntity.ok(rulesEngineService.evaluateTransaction(transaction)))
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/monitor/batch")
    public ResponseEntity<Map<String, Object>> monitorBatch(
            @RequestParam(defaultValue = "100") int limit) {
        // Get unscreened transactions
        List<Transaction> transactions = transactionRepository
            .findRecentUnscreened(PageRequest.of(0, limit));

        int alertCount = 0;
        for (Transaction transaction : transactions) {
            List<ComplianceAlert> alerts = rulesEngineService.evaluateTransaction(transaction);
            alertCount += alerts.size();
        }

        Map<String, Object> result = new HashMap<>();
        result.put("transactionsProcessed", transactions.size());
        result.put("alertsGenerated", alertCount);

        return ResponseEntity.ok(result);
    }

    // ==================== Reports ====================

    @GetMapping("/reports/executive-summary")
    public ResponseEntity<Map<String, Object>> getExecutiveSummary(
            @RequestParam(defaultValue = "30") int days) {
        LocalDateTime startDate = LocalDateTime.now().minusDays(days);
        return ResponseEntity.ok(reportService.generateExecutiveSummary(startDate, LocalDateTime.now()));
    }

    @GetMapping("/reports/alerts")
    public ResponseEntity<Map<String, Object>> getAlertReport(
            @RequestParam(defaultValue = "30") int days) {
        LocalDateTime startDate = LocalDateTime.now().minusDays(days);
        return ResponseEntity.ok(reportService.generateAlertReport(startDate, LocalDateTime.now()));
    }

    @GetMapping("/reports/sar/{alertId}")
    public ResponseEntity<Map<String, Object>> getSARData(@PathVariable Long alertId) {
        return ResponseEntity.ok(reportService.generateSARData(alertId));
    }

    @GetMapping("/reports/rule-effectiveness")
    public ResponseEntity<Map<String, Object>> getRuleEffectivenessReport() {
        return ResponseEntity.ok(reportService.generateRuleEffectivenessReport());
    }

    @GetMapping("/reports/metrics")
    public ResponseEntity<Map<String, Object>> getMetricsDashboard() {
        return ResponseEntity.ok(reportService.generateMetricsDashboard());
    }

    // ==================== Audit Logs ====================

    @GetMapping("/audit-logs")
    public ResponseEntity<Page<ComplianceAuditLog>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(auditService.getAuditLogs(page, size));
    }

    @GetMapping("/audit-logs/entity/{entityType}/{entityId}")
    public ResponseEntity<List<ComplianceAuditLog>> getEntityAuditHistory(
            @PathVariable String entityType,
            @PathVariable Long entityId) {
        return ResponseEntity.ok(auditService.getEntityHistory(entityType, entityId));
    }

    @GetMapping("/audit-logs/statistics")
    public ResponseEntity<Map<String, Object>> getAuditStatistics(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(auditService.getAuditStatistics(days));
    }

    // ==================== Helpers ====================

    private ComplianceCase.CasePriority mapSeverityToPriority(DetectionRule.Severity severity) {
        return switch (severity) {
            case LOW -> ComplianceCase.CasePriority.LOW;
            case MEDIUM -> ComplianceCase.CasePriority.MEDIUM;
            case HIGH -> ComplianceCase.CasePriority.HIGH;
            case CRITICAL -> ComplianceCase.CasePriority.CRITICAL;
        };
    }
}
