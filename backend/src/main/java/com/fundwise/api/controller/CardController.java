package com.fundwise.api.controller;

import com.fundwise.api.dto.CardDto;
import com.fundwise.api.model.Card;
import com.fundwise.api.model.User;
import com.fundwise.api.repository.UserRepository;
import com.fundwise.api.service.CardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cards")
@RequiredArgsConstructor
public class CardController {

    private final CardService cardService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<CardDto>> getCards(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<CardDto> cards = cardService.getCardsByUserId(user.getId())
                .stream()
                .map(CardDto::fromEntity)
                .toList();

        return ResponseEntity.ok(cards);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CardDto> getCard(@PathVariable Long id) {
        return ResponseEntity.ok(CardDto.fromEntity(cardService.getCardById(id)));
    }

    @PostMapping
    public ResponseEntity<CardDto> createCard(
            @RequestParam Long accountId,
            @RequestParam String cardholderName,
            @RequestParam(defaultValue = "VISA") Card.CardType type) {

        Card card = cardService.createCard(accountId, cardholderName, type);
        return ResponseEntity.ok(CardDto.fromEntity(card));
    }
}
