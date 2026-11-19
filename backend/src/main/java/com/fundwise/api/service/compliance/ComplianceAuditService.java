package com.fundwise.api.service.compliance;

import com.fundwise.api.model.User;
import com.fundwise.api.model.compliance.ComplianceAuditLog;
import com.fundwise.api.model.compliance.ComplianceAuditLog.AuditAction;
import com.fundwise.api.model.compliance.ComplianceAuditLog.AuditCategory;
import com.fundwise.api.repository.compliance.ComplianceAuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ComplianceAuditService {

    private final ComplianceAuditLogRepository auditLogRepository;

    /**
     * Log an audit event
     */
    @Transactional
    public ComplianceAuditLog logAction(AuditAction action, AuditCategory category,
                                         String entityType, Long entityId, String entityReference,
                                         String description) {
        return logAction(action, category, entityType, entityId, entityReference, description, null, null);
    }

    /**
     * Log an audit event with old/new values
     */
    @Transactional
    public ComplianceAuditLog logAction(AuditAction action, AuditCategory category,
                                         String entityType, Long entityId, String entityReference,
                                         String description, String oldValue, String newValue) {

        User currentUser = getCurrentUser();
        String ipAddress = getClientIpAddress();
        String userAgent = getUserAgent();

        ComplianceAuditLog auditLog = ComplianceAuditLog.builder()
            .action(action)
            .category(category)
            .entityType(entityType)
            .entityId(entityId)
            .entityReference(entityReference)
            .performedBy(currentUser)
            .performedByName(currentUser != null ? currentUser.getFullName() : "SYSTEM")
            .description(description)
            .oldValue(oldValue)
            .newValue(newValue)
            .ipAddress(ipAddress)
            .userAgent(userAgent)
            .build();

        auditLog = auditLogRepository.save(auditLog);
        log.info("Audit log created: {} - {} - {}", action, entityType, description);

        return auditLog;
    }

    // ==================== Alert Audit Methods ====================

    public void logAlertCreated(Long alertId, String alertNumber, String description) {
        logAction(AuditAction.ALERT_CREATED, AuditCategory.ALERT_MANAGEMENT,
            "ComplianceAlert", alertId, alertNumber, description);
    }

    public void logAlertViewed(Long alertId, String alertNumber) {
        logAction(AuditAction.ALERT_VIEWED, AuditCategory.ALERT_MANAGEMENT,
            "ComplianceAlert", alertId, alertNumber, "Alert viewed");
    }

    public void logAlertStatusChanged(Long alertId, String alertNumber, String oldStatus, String newStatus) {
        logAction(AuditAction.ALERT_STATUS_CHANGED, AuditCategory.ALERT_MANAGEMENT,
            "ComplianceAlert", alertId, alertNumber,
            String.format("Alert status changed from %s to %s", oldStatus, newStatus),
            oldStatus, newStatus);
    }

    public void logAlertEscalated(Long alertId, String alertNumber, String caseNumber) {
        logAction(AuditAction.ALERT_ESCALATED, AuditCategory.ALERT_MANAGEMENT,
            "ComplianceAlert", alertId, alertNumber,
            String.format("Alert escalated to case %s", caseNumber));
    }

    // ==================== Case Audit Methods ====================

    public void logCaseCreated(Long caseId, String caseNumber, String description) {
        logAction(AuditAction.CASE_CREATED, AuditCategory.CASE_MANAGEMENT,
            "ComplianceCase", caseId, caseNumber, description);
    }

    public void logCaseStatusChanged(Long caseId, String caseNumber, String oldStatus, String newStatus) {
        logAction(AuditAction.CASE_STATUS_CHANGED, AuditCategory.CASE_MANAGEMENT,
            "ComplianceCase", caseId, caseNumber,
            String.format("Case status changed from %s to %s", oldStatus, newStatus),
            oldStatus, newStatus);
    }

    public void logCaseDecision(Long caseId, String caseNumber, String decision) {
        logAction(AuditAction.CASE_DECISION_MADE, AuditCategory.CASE_MANAGEMENT,
            "ComplianceCase", caseId, caseNumber,
            String.format("Case decision made: %s", decision));
    }

    // ==================== Rule Audit Methods ====================

    public void logRuleCreated(Long ruleId, String ruleCode, String ruleName) {
        logAction(AuditAction.RULE_CREATED, AuditCategory.RULE_CONFIGURATION,
            "DetectionRule", ruleId, ruleCode,
            String.format("Detection rule created: %s", ruleName));
    }

    public void logRuleToggled(Long ruleId, String ruleCode, boolean enabled) {
        AuditAction action = enabled ? AuditAction.RULE_ENABLED : AuditAction.RULE_DISABLED;
        logAction(action, AuditCategory.RULE_CONFIGURATION,
            "DetectionRule", ruleId, ruleCode,
            String.format("Detection rule %s", enabled ? "enabled" : "disabled"));
    }

    // ==================== Watchlist Audit Methods ====================

    public void logWatchlistEntryAdded(Long entryId, String entryCode, String name) {
        logAction(AuditAction.WATCHLIST_ENTRY_ADDED, AuditCategory.WATCHLIST_MANAGEMENT,
            "WatchlistEntry", entryId, entryCode,
            String.format("Watchlist entry added: %s", name));
    }

    public void logWatchlistScreeningRun(int usersScreened, int matchesFound) {
        logAction(AuditAction.WATCHLIST_SCREENING_RUN, AuditCategory.SCREENING,
            "WatchlistScreening", null, null,
            String.format("Watchlist screening completed: %d users screened, %d matches found",
                usersScreened, matchesFound));
    }

    public void logWatchlistMatchFound(Long userId, String userName, String matchedEntry, double score) {
        logAction(AuditAction.WATCHLIST_MATCH_FOUND, AuditCategory.SCREENING,
            "WatchlistMatch", userId, null,
            String.format("Watchlist match found: %s matches %s (%.0f%% confidence)",
                userName, matchedEntry, score * 100));
    }

    // ==================== Monitoring Audit Methods ====================

    public void logBatchMonitoringRun(int transactionsProcessed, int alertsGenerated) {
        logAction(AuditAction.BATCH_MONITORING_RUN, AuditCategory.TRANSACTION_MONITORING,
            "TransactionMonitoring", null, null,
            String.format("Batch monitoring completed: %d transactions processed, %d alerts generated",
                transactionsProcessed, alertsGenerated));
    }

    // ==================== Report Audit Methods ====================

    public void logReportGenerated(String reportType, String reportParameters) {
        logAction(AuditAction.REPORT_GENERATED, AuditCategory.REPORTING,
            "ComplianceReport", null, reportType,
            String.format("Compliance report generated: %s", reportType));
    }

    // ==================== Query Methods ====================

    public Page<ComplianceAuditLog> getAuditLogs(int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return auditLogRepository.findAll(pageRequest);
    }

    public Page<ComplianceAuditLog> getAuditLogsByCategory(AuditCategory category, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return auditLogRepository.findByCategory(category, pageRequest);
    }

    public List<ComplianceAuditLog> getEntityHistory(String entityType, Long entityId) {
        return auditLogRepository.findEntityHistory(entityType, entityId);
    }

    public Map<String, Object> getAuditStatistics(int days) {
        LocalDateTime startDate = LocalDateTime.now().minusDays(days);

        Map<String, Object> stats = new HashMap<>();
        stats.put("actionCounts", auditLogRepository.countByActionSince(startDate));
        stats.put("categoryCounts", auditLogRepository.countByCategorySince(startDate));

        return stats;
    }

    // ==================== Helper Methods ====================

    private User getCurrentUser() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof User) {
                return (User) authentication.getPrincipal();
            }
        } catch (Exception e) {
            log.debug("Could not get current user: {}", e.getMessage());
        }
        return null;
    }

    private String getClientIpAddress() {
        try {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                HttpServletRequest request = attrs.getRequest();
                String xForwardedFor = request.getHeader("X-Forwarded-For");
                if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
                    return xForwardedFor.split(",")[0].trim();
                }
                return request.getRemoteAddr();
            }
        } catch (Exception e) {
            log.debug("Could not get client IP: {}", e.getMessage());
        }
        return "unknown";
    }

    private String getUserAgent() {
        try {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                return attrs.getRequest().getHeader("User-Agent");
            }
        } catch (Exception e) {
            log.debug("Could not get user agent: {}", e.getMessage());
        }
        return "unknown";
    }
}
