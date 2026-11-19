package com.fundwise.api.repository.compliance;

import com.fundwise.api.model.compliance.ComplianceCase;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ComplianceCaseRepository extends JpaRepository<ComplianceCase, Long> {

    Optional<ComplianceCase> findByCaseNumber(String caseNumber);

    Page<ComplianceCase> findByStatus(ComplianceCase.CaseStatus status, Pageable pageable);

    Page<ComplianceCase> findByPriority(ComplianceCase.CasePriority priority, Pageable pageable);

    List<ComplianceCase> findByUserId(Long userId);

    List<ComplianceCase> findByAssignedToId(Long userId);

    @Query("SELECT COUNT(c) FROM ComplianceCase c WHERE c.status = :status")
    Long countByStatus(@Param("status") ComplianceCase.CaseStatus status);

    @Query("SELECT c FROM ComplianceCase c WHERE c.status IN ('OPEN', 'INVESTIGATING') ORDER BY c.priority DESC, c.createdAt ASC")
    List<ComplianceCase> findOpenCasesByPriority(Pageable pageable);
}
