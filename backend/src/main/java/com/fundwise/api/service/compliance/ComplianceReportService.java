package com.fundwise.api.service.compliance;

import com.fundwise.api.model.compliance.*;
import com.fundwise.api.repository.compliance.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ComplianceReportService {

    private final ComplianceAlertRepository alertRepository;
    private final ComplianceCaseRepository caseRepository;
    private final DetectionRuleRepository ruleRepository;
    private final WatchlistRepository watchlistRepository;
    private final ComplianceAuditService auditService;

    /**
     * Generate Executive Summary Report
     */
    public Map<String, Object> generateExecutiveSummary(LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Generating executive summary report from {} to {}", startDate, endDate);

        Map<String, Object> report = new HashMap<>();
        report.put("reportType", "EXECUTIVE_SUMMARY");
        report.put("generatedAt", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        report.put("period", Map.of("start", startDate.toString(), "end", endDate.toString()));

        // Alert statistics
        Map<String, Object> alertStats = new HashMap<>();
        alertStats.put("total", alertRepository.countByCreatedAtAfter(startDate));
        alertStats.put("bySeverity", alertRepository.countAlertsBySeveritySince(startDate));
        alertStats.put("openCount", alertRepository.countByStatus(ComplianceAlert.AlertStatus.OPEN));
        alertStats.put("resolvedCount", alertRepository.countByStatus(ComplianceAlert.AlertStatus.RESOLVED));
        alertStats.put("falsePositiveCount", alertRepository.countByStatus(ComplianceAlert.AlertStatus.FALSE_POSITIVE));
        report.put("alerts", alertStats);

        // Case statistics
        Map<String, Object> caseStats = new HashMap<>();
        caseStats.put("openCases", caseRepository.countByStatus(ComplianceCase.CaseStatus.OPEN));
        caseStats.put("investigating", caseRepository.countByStatus(ComplianceCase.CaseStatus.INVESTIGATING));
        caseStats.put("closed", caseRepository.countByStatus(ComplianceCase.CaseStatus.CLOSED));
        report.put("cases", caseStats);

        // Rule performance
        Map<String, Object> ruleStats = new HashMap<>();
        ruleStats.put("activeRules", ruleRepository.countByEnabledTrue());
        ruleStats.put("totalRules", ruleRepository.count());
        report.put("rules", ruleStats);

        // Watchlist coverage
        Map<String, Object> watchlistStats = new HashMap<>();
        watchlistStats.put("totalEntries", watchlistRepository.countActive());
        watchlistStats.put("byType", watchlistRepository.countByType());
        report.put("watchlist", watchlistStats);

        // Log report generation
        auditService.logReportGenerated("EXECUTIVE_SUMMARY", startDate + " to " + endDate);

        return report;
    }

    /**
     * Generate Alert Details Report
     */
    public Map<String, Object> generateAlertReport(LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Generating alert details report from {} to {}", startDate, endDate);

        Map<String, Object> report = new HashMap<>();
        report.put("reportType", "ALERT_DETAILS");
        report.put("generatedAt", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        report.put("period", Map.of("start", startDate.toString(), "end", endDate.toString()));

        // Alert breakdown by type
        List<Object[]> alertsByType = alertRepository.countByAlertType();
        report.put("alertsByType", alertsByType);

        // Alert breakdown by severity
        List<Object[]> alertsBySeverity = alertRepository.countAlertsBySeveritySince(startDate);
        report.put("alertsBySeverity", alertsBySeverity);

        // Resolution metrics
        Map<String, Object> resolutionMetrics = new HashMap<>();
        long resolved = alertRepository.countByStatus(ComplianceAlert.AlertStatus.RESOLVED);
        long falsePositive = alertRepository.countByStatus(ComplianceAlert.AlertStatus.FALSE_POSITIVE);
        long total = alertRepository.countByCreatedAtAfter(startDate);

        resolutionMetrics.put("resolvedCount", resolved);
        resolutionMetrics.put("falsePositiveCount", falsePositive);
        resolutionMetrics.put("falsePositiveRate", total > 0 ? (double) falsePositive / total * 100 : 0);
        report.put("resolutionMetrics", resolutionMetrics);

        auditService.logReportGenerated("ALERT_DETAILS", startDate + " to " + endDate);

        return report;
    }

    /**
     * Generate SAR (Suspicious Activity Report) Data
     */
    public Map<String, Object> generateSARData(Long alertId) {
        log.info("Generating SAR data for alert {}", alertId);

        Map<String, Object> sarData = new HashMap<>();

        alertRepository.findById(alertId).ifPresent(alert -> {
            sarData.put("reportType", "SAR_DATA");
            sarData.put("generatedAt", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

            // Alert information
            Map<String, Object> alertInfo = new HashMap<>();
            alertInfo.put("alertNumber", alert.getAlertNumber());
            alertInfo.put("alertType", alert.getAlertType());
            alertInfo.put("severity", alert.getSeverity());
            alertInfo.put("description", alert.getDescription());
            alertInfo.put("riskScore", alert.getRiskScore());
            alertInfo.put("createdAt", alert.getCreatedAt());
            sarData.put("alertInfo", alertInfo);

            // Subject information
            if (alert.getUser() != null) {
                Map<String, Object> subjectInfo = new HashMap<>();
                subjectInfo.put("name", alert.getUser().getFullName());
                subjectInfo.put("email", alert.getUser().getEmail());
                subjectInfo.put("accountInfo", "Account details would be populated here");
                sarData.put("subjectInfo", subjectInfo);
            }

            // Transaction information
            if (alert.getTransaction() != null) {
                Map<String, Object> transactionInfo = new HashMap<>();
                transactionInfo.put("referenceNumber", alert.getTransaction().getReferenceNumber());
                transactionInfo.put("amount", alert.getTransaction().getAmount());
                transactionInfo.put("type", alert.getTransaction().getType());
                transactionInfo.put("date", alert.getTransaction().getCreatedAt());
                sarData.put("transactionInfo", transactionInfo);
            }

            // Rule information
            if (alert.getRule() != null) {
                Map<String, Object> ruleInfo = new HashMap<>();
                ruleInfo.put("ruleCode", alert.getRule().getRuleCode());
                ruleInfo.put("ruleName", alert.getRule().getRuleName());
                ruleInfo.put("category", alert.getRule().getCategory());
                sarData.put("ruleInfo", ruleInfo);
            }
        });

        auditService.logReportGenerated("SAR_DATA", "Alert ID: " + alertId);

        return sarData;
    }

    /**
     * Generate Rule Effectiveness Report
     */
    public Map<String, Object> generateRuleEffectivenessReport() {
        log.info("Generating rule effectiveness report");

        Map<String, Object> report = new HashMap<>();
        report.put("reportType", "RULE_EFFECTIVENESS");
        report.put("generatedAt", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

        List<DetectionRule> rules = ruleRepository.findAll();
        List<Map<String, Object>> ruleMetrics = new ArrayList<>();

        for (DetectionRule rule : rules) {
            Map<String, Object> metrics = new HashMap<>();
            metrics.put("ruleCode", rule.getRuleCode());
            metrics.put("ruleName", rule.getRuleName());
            metrics.put("type", rule.getType());
            metrics.put("category", rule.getCategory());
            metrics.put("severity", rule.getSeverity());
            metrics.put("enabled", rule.getEnabled());

            // Count alerts generated by this rule
            long alertCount = alertRepository.countByRuleId(rule.getId());
            metrics.put("alertsGenerated", alertCount);

            ruleMetrics.add(metrics);
        }

        report.put("rules", ruleMetrics);

        auditService.logReportGenerated("RULE_EFFECTIVENESS", "All rules");

        return report;
    }

    /**
     * Generate Compliance Metrics Dashboard Data
     */
    public Map<String, Object> generateMetricsDashboard() {
        log.info("Generating compliance metrics dashboard");

        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("generatedAt", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

        // Key Performance Indicators
        Map<String, Object> kpis = new HashMap<>();

        // Alert resolution rate
        long totalAlerts = alertRepository.count();
        long resolvedAlerts = alertRepository.countByStatus(ComplianceAlert.AlertStatus.RESOLVED);
        long falsePositives = alertRepository.countByStatus(ComplianceAlert.AlertStatus.FALSE_POSITIVE);

        kpis.put("totalAlerts", totalAlerts);
        kpis.put("resolutionRate", totalAlerts > 0 ? (double) resolvedAlerts / totalAlerts * 100 : 0);
        kpis.put("falsePositiveRate", totalAlerts > 0 ? (double) falsePositives / totalAlerts * 100 : 0);

        // Case metrics
        long totalCases = caseRepository.count();
        long closedCases = caseRepository.countByStatus(ComplianceCase.CaseStatus.CLOSED);
        kpis.put("totalCases", totalCases);
        kpis.put("caseClosureRate", totalCases > 0 ? (double) closedCases / totalCases * 100 : 0);

        dashboard.put("kpis", kpis);

        // Current queue status
        Map<String, Object> queue = new HashMap<>();
        queue.put("openAlerts", alertRepository.countByStatus(ComplianceAlert.AlertStatus.OPEN));
        queue.put("underReview", alertRepository.countByStatus(ComplianceAlert.AlertStatus.UNDER_REVIEW));
        queue.put("escalated", alertRepository.countByStatus(ComplianceAlert.AlertStatus.ESCALATED));
        queue.put("openCases", caseRepository.countByStatus(ComplianceCase.CaseStatus.OPEN));
        queue.put("investigating", caseRepository.countByStatus(ComplianceCase.CaseStatus.INVESTIGATING));
        dashboard.put("queue", queue);

        // Risk distribution
        Map<String, Object> riskDistribution = new HashMap<>();
        riskDistribution.put("critical", alertRepository.countBySeverity(DetectionRule.Severity.CRITICAL));
        riskDistribution.put("high", alertRepository.countBySeverity(DetectionRule.Severity.HIGH));
        riskDistribution.put("medium", alertRepository.countBySeverity(DetectionRule.Severity.MEDIUM));
        riskDistribution.put("low", alertRepository.countBySeverity(DetectionRule.Severity.LOW));
        dashboard.put("riskDistribution", riskDistribution);

        return dashboard;
    }
}
