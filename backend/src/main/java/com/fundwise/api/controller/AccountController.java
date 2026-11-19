package com.fundwise.api.controller;

import com.fundwise.api.model.Account;
import com.fundwise.api.model.User;
import com.fundwise.api.repository.UserRepository;
import com.fundwise.api.service.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Account>> getAccounts(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(accountService.getAccountsByUserId(user.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Account> getAccount(@PathVariable Long id) {
        return ResponseEntity.ok(accountService.getAccountById(id));
    }

    @GetMapping("/balance")
    public ResponseEntity<BigDecimal> getTotalBalance(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(accountService.getTotalBalance(user.getId()));
    }

    @PostMapping
    public ResponseEntity<Account> createAccount(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "CHECKING") Account.AccountType type,
            @RequestParam(defaultValue = "USD") String currency) {

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(accountService.createAccount(user.getId(), type, currency));
    }
}
