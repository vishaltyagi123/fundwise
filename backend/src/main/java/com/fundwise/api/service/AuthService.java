package com.fundwise.api.service;

import com.fundwise.api.dto.AuthRequest;
import com.fundwise.api.dto.AuthResponse;
import com.fundwise.api.dto.RegisterRequest;
import com.fundwise.api.exception.ResourceNotFoundException;
import com.fundwise.api.model.Account;
import com.fundwise.api.model.Card;
import com.fundwise.api.model.User;
import com.fundwise.api.repository.AccountRepository;
import com.fundwise.api.repository.CardRepository;
import com.fundwise.api.repository.UserRepository;
import com.fundwise.api.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final CardRepository cardRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    public AuthResponse login(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        String token = jwtTokenProvider.generateToken(authentication);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return AuthResponse.of(
                token,
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole().name()
        );
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .role(User.Role.USER)
                .enabled(true)
                .build();

        user = userRepository.save(user);

        // Create a default account for the user
        Account account = Account.builder()
                .accountNumber("ACC" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .user(user)
                .balance(BigDecimal.valueOf(1000.00))
                .currency("USD")
                .type(Account.AccountType.CHECKING)
                .status(Account.AccountStatus.ACTIVE)
                .build();

        account = accountRepository.save(account);

        // Create a default card for the account
        Card card = Card.builder()
                .cardNumber(generateCardNumber())
                .cardholderName(user.getFullName())
                .expiryDate(LocalDate.now().plusYears(5))
                .cvv(String.format("%03d", (int)(Math.random() * 1000)))
                .type(Card.CardType.VISA)
                .status(Card.CardStatus.ACTIVE)
                .account(account)
                .build();

        cardRepository.save(card);

        String token = jwtTokenProvider.generateToken(user.getEmail());

        return AuthResponse.of(
                token,
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole().name()
        );
    }

    private String generateCardNumber() {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 16; i++) {
            sb.append((int)(Math.random() * 10));
        }
        return sb.toString();
    }
}
