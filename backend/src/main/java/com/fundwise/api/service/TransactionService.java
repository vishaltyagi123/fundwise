package com.fundwise.api.service;

import com.fundwise.api.dto.TransferRequest;
import com.fundwise.api.exception.InsufficientFundsException;
import com.fundwise.api.exception.ResourceNotFoundException;
import com.fundwise.api.model.Account;
import com.fundwise.api.model.Transaction;
import com.fundwise.api.repository.AccountRepository;
import com.fundwise.api.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;

    public Page<Transaction> getTransactionsByUserId(Long userId, Pageable pageable) {
        return transactionRepository.findByUserId(userId, pageable);
    }

    public List<Transaction> getRecentTransactions(Long userId, int days) {
        LocalDateTime startDate = LocalDateTime.now().minusDays(days);
        return transactionRepository.findByUserIdAndDateRange(userId, startDate);
    }

    public BigDecimal getTotalIncome(Long userId, int days) {
        LocalDateTime startDate = LocalDateTime.now().minusDays(days);
        return transactionRepository.getTotalIncomeByUserIdAndDateRange(userId, startDate);
    }

    public BigDecimal getTotalSpent(Long userId, int days) {
        LocalDateTime startDate = LocalDateTime.now().minusDays(days);
        return transactionRepository.getTotalSpentByUserIdAndDateRange(userId, startDate);
    }

    public List<Object[]> getMonthlyIncome(Long userId) {
        return transactionRepository.getMonthlyIncomeByUserId(userId);
    }

    public List<Object[]> getMonthlySpent(Long userId) {
        return transactionRepository.getMonthlySpentByUserId(userId);
    }

    @Transactional
    public Transaction createTransfer(TransferRequest request) {
        Account fromAccount = accountRepository.findByAccountNumber(request.getFromAccountNumber())
                .orElseThrow(() -> new ResourceNotFoundException("Source account not found"));

        Account toAccount = accountRepository.findByAccountNumber(request.getToAccountNumber())
                .orElseThrow(() -> new ResourceNotFoundException("Destination account not found"));

        if (fromAccount.getBalance().compareTo(request.getAmount()) < 0) {
            throw new InsufficientFundsException("Insufficient funds in source account");
        }

        // Deduct from source account
        fromAccount.setBalance(fromAccount.getBalance().subtract(request.getAmount()));
        accountRepository.save(fromAccount);

        // Add to destination account
        toAccount.setBalance(toAccount.getBalance().add(request.getAmount()));
        accountRepository.save(toAccount);

        // Create transaction record
        Transaction transaction = Transaction.builder()
                .referenceNumber(generateReferenceNumber())
                .fromAccount(fromAccount)
                .toAccount(toAccount)
                .amount(request.getAmount())
                .currency(fromAccount.getCurrency())
                .type(Transaction.TransactionType.TRANSFER)
                .status(Transaction.TransactionStatus.COMPLETED)
                .description(request.getDescription())
                .completedAt(LocalDateTime.now())
                .build();

        return transactionRepository.save(transaction);
    }

    private String generateReferenceNumber() {
        return "TXN" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();
    }
}
