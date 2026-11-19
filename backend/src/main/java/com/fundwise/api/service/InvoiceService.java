package com.fundwise.api.service;

import com.fundwise.api.dto.CreateInvoiceRequest;
import com.fundwise.api.exception.ResourceNotFoundException;
import com.fundwise.api.model.Invoice;
import com.fundwise.api.model.InvoiceItem;
import com.fundwise.api.model.User;
import com.fundwise.api.repository.InvoiceRepository;
import com.fundwise.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final UserRepository userRepository;

    public Page<Invoice> getInvoicesByUserId(Long userId, Pageable pageable) {
        return invoiceRepository.findByUserId(userId, pageable);
    }

    public Invoice getInvoiceById(Long id) {
        return invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));
    }

    public Map<String, Object> getInvoiceStats(Long userId) {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalPaid", invoiceRepository.getTotalPaidByUserId(userId));
        stats.put("totalPending", invoiceRepository.getTotalPendingByUserId(userId));
        stats.put("draftCount", invoiceRepository.countByUserIdAndStatus(userId, Invoice.InvoiceStatus.DRAFT));
        stats.put("sentCount", invoiceRepository.countByUserIdAndStatus(userId, Invoice.InvoiceStatus.SENT));
        stats.put("paidCount", invoiceRepository.countByUserIdAndStatus(userId, Invoice.InvoiceStatus.PAID));
        stats.put("overdueCount", invoiceRepository.countByUserIdAndStatus(userId, Invoice.InvoiceStatus.OVERDUE));
        return stats;
    }

    @Transactional
    public Invoice createInvoice(Long userId, CreateInvoiceRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Invoice invoice = Invoice.builder()
                .invoiceNumber(generateInvoiceNumber())
                .user(user)
                .clientName(request.getClientName())
                .clientEmail(request.getClientEmail())
                .clientAddress(request.getClientAddress())
                .issueDate(request.getIssueDate())
                .dueDate(request.getDueDate())
                .tax(request.getTax() != null ? request.getTax() : BigDecimal.ZERO)
                .notes(request.getNotes())
                .status(Invoice.InvoiceStatus.DRAFT)
                .build();

        BigDecimal subtotal = BigDecimal.ZERO;

        for (CreateInvoiceRequest.ItemRequest itemReq : request.getItems()) {
            BigDecimal amount = itemReq.getUnitPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            subtotal = subtotal.add(amount);

            InvoiceItem item = InvoiceItem.builder()
                    .invoice(invoice)
                    .description(itemReq.getDescription())
                    .quantity(itemReq.getQuantity())
                    .unitPrice(itemReq.getUnitPrice())
                    .amount(amount)
                    .build();

            invoice.getItems().add(item);
        }

        invoice.setSubtotal(subtotal);
        invoice.setTotal(subtotal.add(invoice.getTax()));

        return invoiceRepository.save(invoice);
    }

    @Transactional
    public Invoice updateStatus(Long id, Invoice.InvoiceStatus status) {
        Invoice invoice = getInvoiceById(id);
        invoice.setStatus(status);
        return invoiceRepository.save(invoice);
    }

    private String generateInvoiceNumber() {
        return "INV-" + LocalDate.now().getYear() + "-" +
               UUID.randomUUID().toString().substring(0, 6).toUpperCase();
    }
}