package com.fundwise.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminDashboardDto {

    private Long totalUsers;
    private Long activeUsers;
    private Long totalAccounts;
    private Long totalTransactions;
    private BigDecimal totalVolume;
    private List<UserGrowth> userGrowth;
    private List<TransactionVolume> transactionVolume;
    private List<RecentActivity> recentActivities;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserGrowth {
        private String month;
        private Long newUsers;
        private Long totalUsers;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TransactionVolume {
        private String date;
        private Long count;
        private BigDecimal volume;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RecentActivity {
        private String action;
        private String user;
        private String details;
        private String timestamp;
    }
}
