package com.fundwise.api.service;

import com.fundwise.api.exception.ResourceNotFoundException;
import com.fundwise.api.model.Account;
import com.fundwise.api.model.Card;
import com.fundwise.api.repository.AccountRepository;
import com.fundwise.api.repository.CardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class CardService {

    private final CardRepository cardRepository;
    private final AccountRepository accountRepository;

    public List<Card> getCardsByUserId(Long userId) {
        return cardRepository.findByUserId(userId);
    }

    public Card getCardById(Long id) {
        return cardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Card not found with id: " + id));
    }

    @Transactional
    public Card createCard(Long accountId, String cardholderName, Card.CardType type) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with id: " + accountId));

        Card card = Card.builder()
                .cardNumber(generateCardNumber())
                .cardholderName(cardholderName)
                .expiryDate(LocalDate.now().plusYears(5))
                .cvv(generateCvv())
                .type(type)
                .status(Card.CardStatus.ACTIVE)
                .account(account)
                .build();

        return cardRepository.save(card);
    }

    private String generateCardNumber() {
        Random random = new Random();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 16; i++) {
            sb.append(random.nextInt(10));
        }
        return sb.toString();
    }

    private String generateCvv() {
        Random random = new Random();
        return String.format("%03d", random.nextInt(1000));
    }
}
