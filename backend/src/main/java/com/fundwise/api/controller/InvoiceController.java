package com.fundwise.api.controller;

import com.fundwise.api.dto.CreateInvoiceRequest;
import com.fundwise.api.dto.InvoiceDto;
import com.fundwise.api.model.Invoice;
import com.fundwise.api.model.User;
import com.fundwise.api.repository.UserRepository;
import com.fundwise.api.service.InvoiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<Page<InvoiceDto>> getInvoices(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<InvoiceDto> invoices = invoiceService.getInvoicesByUserId(user.getId(), pageable)
                .map(InvoiceDto::fromEntity);

        return ResponseEntity.ok(invoices);
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(invoiceService.getInvoiceStats(user.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<InvoiceDto> getInvoice(@PathVariable Long id) {
        return ResponseEntity.ok(InvoiceDto.fromEntity(invoiceService.getInvoiceById(id)));
    }

    @PostMapping
    public ResponseEntity<InvoiceDto> createInvoice(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CreateInvoiceRequest request) {

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Invoice invoice = invoiceService.createInvoice(user.getId(), request);
        return ResponseEntity.ok(InvoiceDto.fromEntity(invoice));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<InvoiceDto> updateStatus(
            @PathVariable Long id,
            @RequestParam Invoice.InvoiceStatus status) {

        Invoice invoice = invoiceService.updateStatus(id, status);
        return ResponseEntity.ok(InvoiceDto.fromEntity(invoice));
    }
}