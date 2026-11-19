package com.fundwise.api.repository.compliance;

import com.fundwise.api.model.compliance.ComplianceAlert;
import com.fundwise.api.model.compliance.DetectionRule;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ComplianceAlertRepository extends JpaRepository<ComplianceAlert, Long> {

    Optional<ComplianceAlert> findByAlertNumber(String alertNumber);

    Page<ComplianceAlert> findByStatus(ComplianceAlert.AlertStatus status, Pageable pageable);

    Page<ComplianceAlert> findBySeverity(DetectionRule.Severity severity, Pageable pageable);

    List<ComplianceAlert> findByUserIdAndStatus(Long userId, ComplianceAlert.AlertStatus status);

    @Query("SELECT COUNT(a) FROM ComplianceAlert a WHERE a.status = :status")
    Long countByStatus(@Param("status") ComplianceAlert.AlertStatus status);

    @Query("SELECT COUNT(a) FROM ComplianceAlert a WHERE a.severity = :severity")
    Long countBySeverity(@Param("severity") DetectionRule.Severity severity);

    @Query("SELECT COUNT(a) FROM ComplianceAlert a WHERE a.createdAt >= :startDate")
    Long countByCreatedAtAfter(@Param("startDate") LocalDateTime startDate);

    @Query("SELECT a FROM ComplianceAlert a WHERE a.status IN ('OPEN', 'UNDER_REVIEW') ORDER BY a.severity DESC, a.createdAt DESC")
    List<ComplianceAlert> findOpenAlertsByPriority(Pageable pageable);

    @Query("SELECT a.severity, COUNT(a) FROM ComplianceAlert a WHERE a.createdAt >= :startDate GROUP BY a.severity")
    List<Object[]> countAlertsBySeveritySince(@Param("startDate") LocalDateTime startDate);

    @Query("SELECT COUNT(a) FROM ComplianceAlert a WHERE a.resolvedAt >= :since")
    Long countResolvedSince(@Param("since") LocalDateTime since);

    @Query("SELECT FUNCTION('DATE', a.createdAt), COUNT(a) FROM ComplianceAlert a WHERE a.createdAt >= :startDate GROUP BY FUNCTION('DATE', a.createdAt) ORDER BY FUNCTION('DATE', a.createdAt)")
    List<Object[]> countByDayLast7Days();

    @Query("SELECT a.alertType, COUNT(a) FROM ComplianceAlert a GROUP BY a.alertType")
    List<Object[]> countByAlertType();

    @Query("SELECT COUNT(a) FROM ComplianceAlert a WHERE a.rule.id = :ruleId")
    Long countByRuleId(@Param("ruleId") Long ruleId);
}
