package com.fundwise.api.service;

import com.fundwise.api.dto.InsightsDto;
import com.fundwise.api.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InsightsService {

    private final TransactionRepository transactionRepository;

    private static final String[] COLORS = {
        "#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"
    };

    public InsightsDto getInsights(Long userId, int days) {
        LocalDateTime startDate = LocalDateTime.now().minusDays(days);

        BigDecimal totalIncome = transactionRepository.getTotalIncomeByUserIdAndDateRange(userId, startDate);
        BigDecimal totalExpenses = transactionRepository.getTotalSpentByUserIdAndDateRange(userId, startDate);
        BigDecimal netSavings = totalIncome.subtract(totalExpenses);

        Double savingsRate = totalIncome.compareTo(BigDecimal.ZERO) > 0
            ? netSavings.divide(totalIncome, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue()
            : 0.0;

        return InsightsDto.builder()
                .totalIncome(totalIncome)
                .totalExpenses(totalExpenses)
                .netSavings(netSavings)
                .savingsRate(savingsRate)
                .spendingByCategory(getSpendingByCategory(totalExpenses))
                .monthlyTrends(getMonthlyTrends(userId))
                .topMerchants(getTopMerchants())
                .build();
    }

    private List<InsightsDto.CategorySpending> getSpendingByCategory(BigDecimal totalExpenses) {
        // Mock data - in production, aggregate from transactions
        List<InsightsDto.CategorySpending> categories = Arrays.asList(
            InsightsDto.CategorySpending.builder()
                .category("Design Tools")
                .amount(new BigDecimal("256.00"))
                .color(COLORS[0])
                .build(),
            InsightsDto.CategorySpending.builder()
                .category("Communication")
                .amount(new BigDecimal("89.00"))
                .color(COLORS[1])
                .build(),
            InsightsDto.CategorySpending.builder()
                .category("Entertainment")
                .amount(new BigDecimal("150.00"))
                .color(COLORS[2])
                .build(),
            InsightsDto.CategorySpending.builder()
                .category("Food & Dining")
                .amount(new BigDecimal("420.00"))
                .color(COLORS[3])
                .build(),
            InsightsDto.CategorySpending.builder()
                .category("Transportation")
                .amount(new BigDecimal("180.00"))
                .color(COLORS[4])
                .build(),
            InsightsDto.CategorySpending.builder()
                .category("Shopping")
                .amount(new BigDecimal("350.00"))
                .color(COLORS[5])
                .build()
        );

        BigDecimal total = categories.stream()
            .map(InsightsDto.CategorySpending::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        categories.forEach(c -> {
            double pct = c.getAmount().divide(total, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100)).doubleValue();
            c.setPercentage(pct);
        });

        return categories;
    }

    private List<InsightsDto.MonthlyTrend> getMonthlyTrends(Long userId) {
        String[] months = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};

        return Arrays.asList(
            createTrend(months[0], 8500, 6200),
            createTrend(months[1], 9200, 7100),
            createTrend(months[2], 7800, 5900),
            createTrend(months[3], 10500, 8200),
            createTrend(months[4], 11200, 7800),
            createTrend(months[5], 9800, 8500),
            createTrend(months[6], 12500, 9200),
            createTrend(months[7], 11800, 8900),
            createTrend(months[8], 10200, 7600),
            createTrend(months[9], 13500, 9800),
            createTrend(months[10], 12200, 8400),
            createTrend(months[11], 14500, 10200)
        );
    }

    private InsightsDto.MonthlyTrend createTrend(String month, double income, double expenses) {
        BigDecimal inc = BigDecimal.valueOf(income);
        BigDecimal exp = BigDecimal.valueOf(expenses);
        return InsightsDto.MonthlyTrend.builder()
                .month(month)
                .income(inc)
                .expenses(exp)
                .savings(inc.subtract(exp))
                .build();
    }

    private List<InsightsDto.TopMerchant> getTopMerchants() {
        return Arrays.asList(
            InsightsDto.TopMerchant.builder()
                .name("Figma")
                .totalSpent(new BigDecimal("192.00"))
                .transactionCount(3)
                .build(),
            InsightsDto.TopMerchant.builder()
                .name("Dribbble")
                .totalSpent(new BigDecimal("128.00"))
                .transactionCount(2)
                .build(),
            InsightsDto.TopMerchant.builder()
                .name("Slack")
                .totalSpent(new BigDecimal("36.00"))
                .transactionCount(3)
                .build(),
            InsightsDto.TopMerchant.builder()
                .name("YouTube")
                .totalSpent(new BigDecimal("128.00"))
                .transactionCount(2)
                .build(),
            InsightsDto.TopMerchant.builder()
                .name("Netflix")
                .totalSpent(new BigDecimal("45.00"))
                .transactionCount(3)
                .build()
        );
    }
}
