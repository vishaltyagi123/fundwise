package com.fundwise.api.repository;

import com.fundwise.api.model.Invoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    Page<Invoice> findByUserId(Long userId, Pageable pageable);

    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);

    @Query("SELECT COUNT(i) FROM Invoice i WHERE i.user.id = :userId AND i.status = :status")
    Long countByUserIdAndStatus(@Param("userId") Long userId, @Param("status") Invoice.InvoiceStatus status);

    @Query("SELECT COALESCE(SUM(i.total), 0) FROM Invoice i WHERE i.user.id = :userId AND i.status = 'PAID'")
    BigDecimal getTotalPaidByUserId(@Param("userId") Long userId);

    @Query("SELECT COALESCE(SUM(i.total), 0) FROM Invoice i WHERE i.user.id = :userId AND i.status IN ('SENT', 'OVERDUE')")
    BigDecimal getTotalPendingByUserId(@Param("userId") Long userId);
}