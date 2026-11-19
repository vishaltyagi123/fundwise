package com.fundwise.api.dto;

import com.fundwise.api.model.Card;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CardDto {

    private Long id;
    private String cardNumber;
    private String maskedCardNumber;
    private String formattedCardNumber;
    private String cardholderName;
    private String expiryDate;
    private String cvv;
    private String type;
    private String status;

    public static CardDto fromEntity(Card card) {
        return CardDto.builder()
                .id(card.getId())
                .cardNumber(card.getCardNumber())
                .maskedCardNumber(card.getMaskedCardNumber())
                .formattedCardNumber(card.getFormattedCardNumber())
                .cardholderName(card.getCardholderName())
                .expiryDate(card.getFormattedExpiry())
                .cvv(card.getCvv())
                .type(card.getType().name())
                .status(card.getStatus().name())
                .build();
    }
}
