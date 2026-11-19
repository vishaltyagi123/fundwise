package com.fundwise.api.service;

import com.fundwise.api.model.Notification;
import com.fundwise.api.model.User;
import com.fundwise.api.repository.NotificationRepository;
import com.fundwise.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public Page<Notification> getNotifications(Long userId, Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }

    public List<Notification> getUnreadNotifications(Long userId) {
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
    }

    public Long getUnreadCount(Long userId) {
        return notificationRepository.countUnreadByUserId(userId);
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        notificationRepository.markAsRead(notificationId);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsReadByUserId(userId);
    }

    @Transactional
    public Notification createNotification(Long userId, String title, String message,
                                           Notification.NotificationType type, String actionUrl) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .actionUrl(actionUrl)
                .isRead(false)
                .build();

        return notificationRepository.save(notification);
    }

    // Helper methods for common notification types
    public void notifyTransactionComplete(Long userId, String amount, String description) {
        createNotification(userId,
                "Transaction Completed",
                "Your transaction of " + amount + " for " + description + " has been completed.",
                Notification.NotificationType.TRANSACTION,
                "/transactions");
    }

    public void notifyLowBalance(Long userId, String balance) {
        createNotification(userId,
                "Low Balance Alert",
                "Your account balance is low: " + balance + ". Consider adding funds.",
                Notification.NotificationType.PAYMENT,
                "/accounts");
    }

    public void notifyInvoicePaid(Long userId, String invoiceNumber) {
        createNotification(userId,
                "Invoice Paid",
                "Invoice " + invoiceNumber + " has been paid.",
                Notification.NotificationType.INVOICE,
                "/invoices");
    }

    public void notifySecurityAlert(Long userId, String message) {
        createNotification(userId,
                "Security Alert",
                message,
                Notification.NotificationType.SECURITY,
                "/settings/security");
    }
}