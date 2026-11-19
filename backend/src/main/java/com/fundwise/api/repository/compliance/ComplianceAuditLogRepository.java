package com.fundwise.api.repository.compliance;

import com.fundwise.api.model.compliance.ComplianceAuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ComplianceAuditLogRepository extends JpaRepository<ComplianceAuditLog, Long> {

    Page<ComplianceAuditLog> findByCategory(ComplianceAuditLog.AuditCategory category, Pageable pageable);

    Page<ComplianceAuditLog> findByAction(ComplianceAuditLog.AuditAction action, Pageable pageable);

    Page<ComplianceAuditLog> findByEntityTypeAndEntityId(String entityType, Long entityId, Pageable pageable);

    Page<ComplianceAuditLog> findByPerformedById(Long userId, Pageable pageable);

    @Query("SELECT a FROM ComplianceAuditLog a WHERE a.createdAt >= :startDate ORDER BY a.createdAt DESC")
    List<ComplianceAuditLog> findRecentActivity(@Param("startDate") LocalDateTime startDate, Pageable pageable);

    @Query("SELECT a FROM ComplianceAuditLog a WHERE a.entityType = :entityType AND a.entityId = :entityId ORDER BY a.createdAt DESC")
    List<ComplianceAuditLog> findEntityHistory(@Param("entityType") String entityType, @Param("entityId") Long entityId);

    @Query("SELECT a.action, COUNT(a) FROM ComplianceAuditLog a WHERE a.createdAt >= :startDate GROUP BY a.action")
    List<Object[]> countByActionSince(@Param("startDate") LocalDateTime startDate);

    @Query("SELECT a.category, COUNT(a) FROM ComplianceAuditLog a WHERE a.createdAt >= :startDate GROUP BY a.category")
    List<Object[]> countByCategorySince(@Param("startDate") LocalDateTime startDate);
}
