package com.fundwise.api.service;

import com.fundwise.api.exception.ResourceNotFoundException;
import com.fundwise.api.model.Account;
import com.fundwise.api.model.User;
import com.fundwise.api.repository.AccountRepository;
import com.fundwise.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;

    public List<Account> getAccountsByUserId(Long userId) {
        return accountRepository.findByUserId(userId);
    }

    public Account getAccountById(Long id) {
        return accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with id: " + id));
    }

    public Account getAccountByNumber(String accountNumber) {
        return accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with number: " + accountNumber));
    }

    public BigDecimal getTotalBalance(Long userId) {
        return accountRepository.getTotalBalanceByUserId(userId);
    }

    @Transactional
    public Account createAccount(Long userId, Account.AccountType type, String currency) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Account account = Account.builder()
                .accountNumber(generateAccountNumber())
                .user(user)
                .type(type)
                .currency(currency)
                .balance(BigDecimal.ZERO)
                .status(Account.AccountStatus.ACTIVE)
                .build();

        return accountRepository.save(account);
    }

    private String generateAccountNumber() {
        return "ACC" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
