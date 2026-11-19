package com.fundwise.api.dto;

import com.fundwise.api.model.Invoice;
import com.fundwise.api.model.InvoiceItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceDto {

    private Long id;
    private String invoiceNumber;
    private String clientName;
    private String clientEmail;
    private String clientAddress;
    private LocalDate issueDate;
    private LocalDate dueDate;
    private BigDecimal subtotal;
    private BigDecimal tax;
    private BigDecimal total;
    private String status;
    private String notes;
    private List<ItemDto> items;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ItemDto {
        private Long id;
        private String description;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal amount;

        public static ItemDto fromEntity(InvoiceItem item) {
            return ItemDto.builder()
                    .id(item.getId())
                    .description(item.getDescription())
                    .quantity(item.getQuantity())
                    .unitPrice(item.getUnitPrice())
                    .amount(item.getAmount())
                    .build();
        }
    }

    public static InvoiceDto fromEntity(Invoice invoice) {
        return InvoiceDto.builder()
                .id(invoice.getId())
                .invoiceNumber(invoice.getInvoiceNumber())
                .clientName(invoice.getClientName())
                .clientEmail(invoice.getClientEmail())
                .clientAddress(invoice.getClientAddress())
                .issueDate(invoice.getIssueDate())
                .dueDate(invoice.getDueDate())
                .subtotal(invoice.getSubtotal())
                .tax(invoice.getTax())
                .total(invoice.getTotal())
                .status(invoice.getStatus().name())
                .notes(invoice.getNotes())
                .items(invoice.getItems().stream().map(ItemDto::fromEntity).toList())
                .build();
    }
}