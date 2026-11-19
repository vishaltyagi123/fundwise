package com.fundwise.api.controller;

import com.fundwise.api.dto.TransactionDto;
import com.fundwise.api.dto.TransferRequest;
import com.fundwise.api.model.Transaction;
import com.fundwise.api.model.User;
import com.fundwise.api.repository.UserRepository;
import com.fundwise.api.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<Page<TransactionDto>> getTransactions(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<TransactionDto> transactions = transactionService.getTransactionsByUserId(user.getId(), pageable)
                .map(TransactionDto::fromEntity);

        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/recent")
    public ResponseEntity<List<TransactionDto>> getRecentTransactions(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "30") int days) {

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<TransactionDto> transactions = transactionService.getRecentTransactions(user.getId(), days)
                .stream()
                .map(TransactionDto::fromEntity)
                .toList();

        return ResponseEntity.ok(transactions);
    }

    @PostMapping("/transfer")
    public ResponseEntity<TransactionDto> createTransfer(
            @Valid @RequestBody TransferRequest request) {

        Transaction transaction = transactionService.createTransfer(request);
        return ResponseEntity.ok(TransactionDto.fromEntity(transaction));
    }
}
