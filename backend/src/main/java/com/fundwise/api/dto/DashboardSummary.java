package com.fundwise.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardSummary {

    private BigDecimal totalBalance;
    private BigDecimal totalIncome;
    private BigDecimal totalSpent;
    private Double incomeChangePercent;
    private Double spentChangePercent;
    private List<MonthlyData> monthlyIncome;
    private List<MonthlyData> monthlySpent;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MonthlyData {
        private String month;
        private BigDecimal amount;
    }
}
