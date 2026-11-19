package com.fundwise.api.service;

import com.fundwise.api.dto.AdminDashboardDto;
import com.fundwise.api.dto.UserDto;
import com.fundwise.api.model.AuditLog;
import com.fundwise.api.model.User;
import com.fundwise.api.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final AuditLogRepository auditLogRepository;

    public AdminDashboardDto getDashboardStats() {
        long totalUsers = userRepository.count();
        long totalAccounts = accountRepository.count();
        long totalTransactions = transactionRepository.count();

        return AdminDashboardDto.builder()
                .totalUsers(totalUsers)
                .activeUsers(totalUsers) // In real app, filter by last login
                .totalAccounts(totalAccounts)
                .totalTransactions(totalTransactions)
                .totalVolume(new BigDecimal("1250000.00"))
                .userGrowth(getUserGrowthData())
                .transactionVolume(getTransactionVolumeData())
                .recentActivities(getRecentActivities())
                .build();
    }

    public Page<UserDto> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(UserDto::fromEntity);
    }

    public Page<AuditLog> getAuditLogs(Pageable pageable) {
        return auditLogRepository.findAll(pageable);
    }

    @Transactional
    public User toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setEnabled(!user.getEnabled());
        return userRepository.save(user);
    }

    @Transactional
    public User updateUserRole(Long userId, User.Role role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(role);
        return userRepository.save(user);
    }

    private List<AdminDashboardDto.UserGrowth> getUserGrowthData() {
        return Arrays.asList(
            AdminDashboardDto.UserGrowth.builder().month("Jan").newUsers(45L).totalUsers(245L).build(),
            AdminDashboardDto.UserGrowth.builder().month("Feb").newUsers(52L).totalUsers(297L).build(),
            AdminDashboardDto.UserGrowth.builder().month("Mar").newUsers(38L).totalUsers(335L).build(),
            AdminDashboardDto.UserGrowth.builder().month("Apr").newUsers(65L).totalUsers(400L).build(),
            AdminDashboardDto.UserGrowth.builder().month("May").newUsers(78L).totalUsers(478L).build(),
            AdminDashboardDto.UserGrowth.builder().month("Jun").newUsers(89L).totalUsers(567L).build()
        );
    }

    private List<AdminDashboardDto.TransactionVolume> getTransactionVolumeData() {
        return Arrays.asList(
            AdminDashboardDto.TransactionVolume.builder().date("Mon").count(125L).volume(new BigDecimal("45000")).build(),
            AdminDashboardDto.TransactionVolume.builder().date("Tue").count(189L).volume(new BigDecimal("67000")).build(),
            AdminDashboardDto.TransactionVolume.builder().date("Wed").count(156L).volume(new BigDecimal("52000")).build(),
            AdminDashboardDto.TransactionVolume.builder().date("Thu").count(203L).volume(new BigDecimal("78000")).build(),
            AdminDashboardDto.TransactionVolume.builder().date("Fri").count(178L).volume(new BigDecimal("61000")).build(),
            AdminDashboardDto.TransactionVolume.builder().date("Sat").count(95L).volume(new BigDecimal("32000")).build(),
            AdminDashboardDto.TransactionVolume.builder().date("Sun").count(67L).volume(new BigDecimal("24000")).build()
        );
    }

    private List<AdminDashboardDto.RecentActivity> getRecentActivities() {
        return Arrays.asList(
            AdminDashboardDto.RecentActivity.builder()
                .action("User Registration")
                .user("john@example.com")
                .details("New user registered")
                .timestamp("2 minutes ago")
                .build(),
            AdminDashboardDto.RecentActivity.builder()
                .action("Transaction")
                .user("thomas@fundwise.com")
                .details("Transfer of $500 completed")
                .timestamp("5 minutes ago")
                .build(),
            AdminDashboardDto.RecentActivity.builder()
                .action("Login")
                .user("admin@fundwise.com")
                .details("Admin logged in from new device")
                .timestamp("10 minutes ago")
                .build(),
            AdminDashboardDto.RecentActivity.builder()
                .action("Invoice Created")
                .user("watson@example.com")
                .details("Invoice INV-2023-ABC123 created")
                .timestamp("15 minutes ago")
                .build()
        );
    }
}
