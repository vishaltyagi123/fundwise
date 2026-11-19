package com.fundwise.api.config;

import com.fundwise.api.model.*;
import com.fundwise.api.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final CardRepository cardRepository;
    private final TransactionRepository transactionRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            seedData();
        }
    }

    private void seedData() {
        log.info("Seeding initial data...");

        // Create main user - Thomas Fletcher
        User thomas = User.builder()
                .email("thomas@fundwise.com")
                .password(passwordEncoder.encode("password123"))
                .firstName("Thomas")
                .lastName("Fletcher")
                .role(User.Role.USER)
                .enabled(true)
                .build();
        thomas = userRepository.save(thomas);

        // Create account for Thomas with balance matching the UI
        Account thomasAccount = Account.builder()
                .accountNumber("ACC" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .user(thomas)
                .balance(new BigDecimal("32352.00"))
                .currency("USD")
                .type(Account.AccountType.CHECKING)
                .status(Account.AccountStatus.ACTIVE)
                .build();
        thomasAccount = accountRepository.save(thomasAccount);

        // Create card for Thomas matching the UI
        Card thomasCard = Card.builder()
                .cardNumber("1253543236213090")
                .cardholderName("Thomas Fletcher")
                .expiryDate(LocalDate.of(2029, 9, 1))
                .cvv("341")
                .type(Card.CardType.VISA)
                .status(Card.CardStatus.ACTIVE)
                .account(thomasAccount)
                .build();
        cardRepository.save(thomasCard);

        // Create other users for quick transfer
        List<String[]> otherUsers = List.of(
                new String[]{"Watson", "watson@example.com", "#65135"},
                new String[]{"Nathan", "nathan@example.com", "#87441"},
                new String[]{"Angelina", "angelina@example.com", "#63518"},
                new String[]{"Robert", "robert@example.com", "#56142"}
        );

        for (String[] userData : otherUsers) {
            User user = User.builder()
                    .email(userData[1])
                    .password(passwordEncoder.encode("password123"))
                    .firstName(userData[0])
                    .lastName("User")
                    .role(User.Role.USER)
                    .enabled(true)
                    .build();
            user = userRepository.save(user);

            Account account = Account.builder()
                    .accountNumber("ACC" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                    .user(user)
                    .balance(new BigDecimal("5000.00"))
                    .currency("USD")
                    .type(Account.AccountType.CHECKING)
                    .status(Account.AccountStatus.ACTIVE)
                    .build();
            accountRepository.save(account);
        }

        // Create sample transactions matching the UI
        createTransaction(thomasAccount, "Figma Pro Plan", "Design Tools", new BigDecimal("-64.00"),
                Transaction.TransactionStatus.COMPLETED, LocalDateTime.of(2023, 11, 11, 10, 0));

        createTransaction(thomasAccount, "Internal Payment", "billing@acme.com", new BigDecimal("200.00"),
                Transaction.TransactionStatus.ON_PROGRESS, LocalDateTime.of(2023, 11, 11, 9, 0));

        createTransaction(thomasAccount, "Dribbble Premium", "Design Tools", new BigDecimal("-64.00"),
                Transaction.TransactionStatus.COMPLETED, LocalDateTime.of(2023, 11, 11, 8, 0));

        createTransaction(thomasAccount, "YouTube Premium", "Design Tools", new BigDecimal("-64.00"),
                Transaction.TransactionStatus.ON_PROGRESS, LocalDateTime.of(2023, 11, 11, 7, 0));

        createTransaction(thomasAccount, "Slack Subscription", "Communication", new BigDecimal("-12.00"),
                Transaction.TransactionStatus.COMPLETED, LocalDateTime.of(2023, 11, 10, 10, 0));

        log.info("Data seeding completed!");
    }

    private void createTransaction(Account account, String merchantName, String category,
                                   BigDecimal amount, Transaction.TransactionStatus status,
                                   LocalDateTime createdAt) {
        Transaction transaction = Transaction.builder()
                .referenceNumber("INV_" + String.format("%08d", (int)(Math.random() * 100000000)))
                .fromAccount(amount.compareTo(BigDecimal.ZERO) < 0 ? account : null)
                .toAccount(amount.compareTo(BigDecimal.ZERO) > 0 ? account : null)
                .amount(amount.abs())
                .currency("USD")
                .type(amount.compareTo(BigDecimal.ZERO) < 0 ? Transaction.TransactionType.PAYMENT : Transaction.TransactionType.DEPOSIT)
                .status(status)
                .merchantName(merchantName)
                .category(category)
                .description(merchantName)
                .build();

        transactionRepository.save(transaction);
    }
}
