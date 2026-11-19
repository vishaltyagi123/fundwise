package com.fundwise.api.dto;

import com.fundwise.api.model.Transaction;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionDto {

    private Long id;
    private String referenceNumber;
    private String fromAccountNumber;
    private String toAccountNumber;
    private BigDecimal amount;
    private String currency;
    private String type;
    private String status;
    private String description;
    private String merchantName;
    private String merchantLogo;
    private String category;
    private LocalDateTime createdAt;

    public static TransactionDto fromEntity(Transaction transaction) {
        return TransactionDto.builder()
                .id(transaction.getId())
                .referenceNumber(transaction.getReferenceNumber())
                .fromAccountNumber(transaction.getFromAccount() != null ? transaction.getFromAccount().getAccountNumber() : null)
                .toAccountNumber(transaction.getToAccount() != null ? transaction.getToAccount().getAccountNumber() : null)
                .amount(transaction.getAmount())
                .currency(transaction.getCurrency())
                .type(transaction.getType().name())
                .status(transaction.getStatus().name())
                .description(transaction.getDescription())
                .merchantName(transaction.getMerchantName())
                .merchantLogo(transaction.getMerchantLogo())
                .category(transaction.getCategory())
                .createdAt(transaction.getCreatedAt())
                .build();
    }
}
