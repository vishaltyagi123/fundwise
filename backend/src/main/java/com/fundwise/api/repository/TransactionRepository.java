package com.fundwise.api.repository;

import com.fundwise.api.model.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    Optional<Transaction> findByReferenceNumber(String referenceNumber);

    @Query("SELECT t FROM Transaction t WHERE t.fromAccount.user.id = :userId OR t.toAccount.user.id = :userId ORDER BY t.createdAt DESC")
    Page<Transaction> findByUserId(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT t FROM Transaction t WHERE (t.fromAccount.user.id = :userId OR t.toAccount.user.id = :userId) AND t.createdAt >= :startDate ORDER BY t.createdAt DESC")
    List<Transaction> findByUserIdAndDateRange(@Param("userId") Long userId, @Param("startDate") LocalDateTime startDate);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.toAccount.user.id = :userId AND t.status = 'COMPLETED' AND t.createdAt >= :startDate")
    BigDecimal getTotalIncomeByUserIdAndDateRange(@Param("userId") Long userId, @Param("startDate") LocalDateTime startDate);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.fromAccount.user.id = :userId AND t.status = 'COMPLETED' AND t.createdAt >= :startDate")
    BigDecimal getTotalSpentByUserIdAndDateRange(@Param("userId") Long userId, @Param("startDate") LocalDateTime startDate);

    @Query("SELECT MONTH(t.createdAt) as month, COALESCE(SUM(t.amount), 0) as total " +
           "FROM Transaction t WHERE t.toAccount.user.id = :userId AND t.status = 'COMPLETED' " +
           "AND YEAR(t.createdAt) = YEAR(CURRENT_DATE) GROUP BY MONTH(t.createdAt)")
    List<Object[]> getMonthlyIncomeByUserId(@Param("userId") Long userId);

    @Query("SELECT MONTH(t.createdAt) as month, COALESCE(SUM(t.amount), 0) as total " +
           "FROM Transaction t WHERE t.fromAccount.user.id = :userId AND t.status = 'COMPLETED' " +
           "AND YEAR(t.createdAt) = YEAR(CURRENT_DATE) GROUP BY MONTH(t.createdAt)")
    List<Object[]> getMonthlySpentByUserId(@Param("userId") Long userId);

    @Query("SELECT t FROM Transaction t WHERE t.screened = false OR t.screened IS NULL ORDER BY t.createdAt DESC")
    List<Transaction> findRecentUnscreened(Pageable pageable);
}
