package com.fundwise.api.service;

import com.fundwise.api.dto.DashboardSummary;
import com.fundwise.api.repository.AccountRepository;
import com.fundwise.api.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.Month;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;

    private static final String[] MONTHS = {
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    };

    public DashboardSummary getDashboardSummary(Long userId) {
        BigDecimal totalBalance = accountRepository.getTotalBalanceByUserId(userId);

        LocalDateTime last30Days = LocalDateTime.now().minusDays(30);
        LocalDateTime last60Days = LocalDateTime.now().minusDays(60);

        BigDecimal currentIncome = transactionRepository.getTotalIncomeByUserIdAndDateRange(userId, last30Days);
        BigDecimal previousIncome = transactionRepository.getTotalIncomeByUserIdAndDateRange(userId, last60Days)
                .subtract(currentIncome);

        BigDecimal currentSpent = transactionRepository.getTotalSpentByUserIdAndDateRange(userId, last30Days);
        BigDecimal previousSpent = transactionRepository.getTotalSpentByUserIdAndDateRange(userId, last60Days)
                .subtract(currentSpent);

        Double incomeChangePercent = calculatePercentChange(previousIncome, currentIncome);
        Double spentChangePercent = calculatePercentChange(previousSpent, currentSpent);

        List<DashboardSummary.MonthlyData> monthlyIncome = getMonthlyData(
                transactionRepository.getMonthlyIncomeByUserId(userId));
        List<DashboardSummary.MonthlyData> monthlySpent = getMonthlyData(
                transactionRepository.getMonthlySpentByUserId(userId));

        return DashboardSummary.builder()
                .totalBalance(totalBalance)
                .totalIncome(currentIncome)
                .totalSpent(currentSpent)
                .incomeChangePercent(incomeChangePercent)
                .spentChangePercent(spentChangePercent)
                .monthlyIncome(monthlyIncome)
                .monthlySpent(monthlySpent)
                .build();
    }

    private Double calculatePercentChange(BigDecimal previous, BigDecimal current) {
        if (previous == null || previous.compareTo(BigDecimal.ZERO) == 0) {
            return current != null && current.compareTo(BigDecimal.ZERO) > 0 ? 100.0 : 0.0;
        }
        return current.subtract(previous)
                .divide(previous, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .doubleValue();
    }

    private List<DashboardSummary.MonthlyData> getMonthlyData(List<Object[]> rawData) {
        Map<Integer, BigDecimal> dataMap = rawData.stream()
                .collect(Collectors.toMap(
                        row -> (Integer) row[0],
                        row -> (BigDecimal) row[1]
                ));

        List<DashboardSummary.MonthlyData> result = new ArrayList<>();
        for (int i = 1; i <= 12; i++) {
            result.add(DashboardSummary.MonthlyData.builder()
                    .month(MONTHS[i - 1])
                    .amount(dataMap.getOrDefault(i, BigDecimal.ZERO))
                    .build());
        }
        return result;
    }
}
