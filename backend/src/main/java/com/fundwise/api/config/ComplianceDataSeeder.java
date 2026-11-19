package com.fundwise.api.config;

import com.fundwise.api.model.compliance.DetectionRule;
import com.fundwise.api.model.compliance.WatchlistEntry;
import com.fundwise.api.repository.compliance.DetectionRuleRepository;
import com.fundwise.api.repository.compliance.WatchlistRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
@Order(2)
public class ComplianceDataSeeder implements CommandLineRunner {

    private final DetectionRuleRepository ruleRepository;
    private final WatchlistRepository watchlistRepository;

    @Override
    public void run(String... args) {
        seedDetectionRules();
        seedWatchlistEntries();
    }

    private void seedDetectionRules() {
        if (ruleRepository.count() > 0) {
            log.info("Detection rules already exist, skipping seeding");
            return;
        }

        log.info("Seeding detection rules...");

        List<DetectionRule> rules = List.of(
            // Threshold Rules
            DetectionRule.builder()
                .ruleCode("CTR_10K")
                .ruleName("Currency Transaction Report")
                .description("Transactions exceeding $10,000 require CTR filing")
                .type(DetectionRule.RuleType.THRESHOLD_BREACH)
                .category(DetectionRule.RuleCategory.AML)
                .thresholdAmount(new BigDecimal("10000"))
                .severity(DetectionRule.Severity.MEDIUM)
                .enabled(true)
                .build(),

            DetectionRule.builder()
                .ruleCode("HIGH_VALUE_50K")
                .ruleName("High Value Transaction")
                .description("Transactions over $50,000 require enhanced review")
                .type(DetectionRule.RuleType.THRESHOLD_BREACH)
                .category(DetectionRule.RuleCategory.AML)
                .thresholdAmount(new BigDecimal("50000"))
                .severity(DetectionRule.Severity.HIGH)
                .enabled(true)
                .build(),

            // Structuring Rules
            DetectionRule.builder()
                .ruleCode("STRUCTURING_9K")
                .ruleName("Structuring Detection")
                .description("Multiple transactions just under $10,000 within 24 hours")
                .type(DetectionRule.RuleType.STRUCTURING)
                .category(DetectionRule.RuleCategory.AML)
                .thresholdAmount(new BigDecimal("10000"))
                .timeWindowHours(24)
                .transactionCount(3)
                .severity(DetectionRule.Severity.HIGH)
                .enabled(true)
                .build(),

            DetectionRule.builder()
                .ruleCode("SMURFING_PATTERN")
                .ruleName("Smurfing Pattern Detection")
                .description("Multiple small deposits below reporting threshold")
                .type(DetectionRule.RuleType.STRUCTURING)
                .category(DetectionRule.RuleCategory.AML)
                .thresholdAmount(new BigDecimal("9500"))
                .timeWindowHours(48)
                .transactionCount(5)
                .severity(DetectionRule.Severity.CRITICAL)
                .enabled(true)
                .build(),

            // Velocity Rules
            DetectionRule.builder()
                .ruleCode("HIGH_VELOCITY_DAY")
                .ruleName("Daily Transaction Velocity")
                .description("More than 10 transactions in 24 hours")
                .type(DetectionRule.RuleType.VELOCITY)
                .category(DetectionRule.RuleCategory.FRAUD)
                .timeWindowHours(24)
                .velocityLimit(10)
                .severity(DetectionRule.Severity.MEDIUM)
                .enabled(true)
                .build(),

            DetectionRule.builder()
                .ruleCode("RAPID_FIRE")
                .ruleName("Rapid-Fire Transactions")
                .description("More than 5 transactions within 1 hour")
                .type(DetectionRule.RuleType.VELOCITY)
                .category(DetectionRule.RuleCategory.FRAUD)
                .timeWindowHours(1)
                .velocityLimit(5)
                .severity(DetectionRule.Severity.HIGH)
                .enabled(true)
                .build(),

            // High Risk Jurisdiction
            DetectionRule.builder()
                .ruleCode("SANCTIONS_COUNTRY")
                .ruleName("Sanctioned Country Detection")
                .description("Transaction involves OFAC sanctioned country")
                .type(DetectionRule.RuleType.HIGH_RISK_JURISDICTION)
                .category(DetectionRule.RuleCategory.SANCTIONS)
                .countryCodes("IR,KP,CU,SY,RU")
                .severity(DetectionRule.Severity.CRITICAL)
                .enabled(true)
                .build(),

            DetectionRule.builder()
                .ruleCode("HIGH_RISK_GEO")
                .ruleName("High Risk Geography")
                .description("Transaction involves high-risk jurisdiction")
                .type(DetectionRule.RuleType.HIGH_RISK_JURISDICTION)
                .category(DetectionRule.RuleCategory.AML)
                .countryCodes("AF,BY,MM,VE,YE,SS")
                .severity(DetectionRule.Severity.HIGH)
                .enabled(true)
                .build(),

            // Watchlist Match
            DetectionRule.builder()
                .ruleCode("WATCHLIST_MATCH")
                .ruleName("Watchlist Match Detection")
                .description("Customer matches sanctions or PEP watchlist")
                .type(DetectionRule.RuleType.WATCHLIST_MATCH)
                .category(DetectionRule.RuleCategory.SANCTIONS)
                .severity(DetectionRule.Severity.CRITICAL)
                .enabled(true)
                .build()
        );

        ruleRepository.saveAll(rules);
        log.info("Seeded {} detection rules", rules.size());
    }

    private void seedWatchlistEntries() {
        if (watchlistRepository.count() > 0) {
            log.info("Watchlist entries already exist, skipping seeding");
            return;
        }

        log.info("Seeding watchlist entries...");

        List<WatchlistEntry> entries = List.of(
            // OFAC SDN List samples
            WatchlistEntry.builder()
                .entryId("OFAC-001")
                .fullName("Viktor Petrov")
                .firstName("Viktor")
                .lastName("Petrov")
                .type(WatchlistEntry.WatchlistType.OFAC_SDN)
                .entityType(WatchlistEntry.EntityType.INDIVIDUAL)
                .country("RU")
                .aliasNames("Victor Petroff,Виктор Петров")
                .reason("Russia-related sanctions")
                .active(true)
                .build(),

            WatchlistEntry.builder()
                .entryId("OFAC-002")
                .fullName("Global Trade Finance Ltd")
                .type(WatchlistEntry.WatchlistType.OFAC_SDN)
                .entityType(WatchlistEntry.EntityType.ORGANIZATION)
                .country("IR")
                .reason("Iran sanctions - financial services")
                .active(true)
                .build(),

            WatchlistEntry.builder()
                .entryId("OFAC-003")
                .fullName("Kim Jong Un")
                .firstName("Jong Un")
                .lastName("Kim")
                .type(WatchlistEntry.WatchlistType.OFAC_SDN)
                .entityType(WatchlistEntry.EntityType.INDIVIDUAL)
                .country("KP")
                .aliasNames("Kim Jong-un,김정은")
                .reason("North Korea sanctions")
                .active(true)
                .build(),

            // UN Sanctions
            WatchlistEntry.builder()
                .entryId("UN-001")
                .fullName("Al-Qaeda Network")
                .type(WatchlistEntry.WatchlistType.UN_SANCTIONS)
                .entityType(WatchlistEntry.EntityType.ORGANIZATION)
                .reason("UN Security Council Resolution 1267")
                .active(true)
                .build(),

            // EU Sanctions
            WatchlistEntry.builder()
                .entryId("EU-001")
                .fullName("Sergei Ivanov")
                .firstName("Sergei")
                .lastName("Ivanov")
                .type(WatchlistEntry.WatchlistType.EU_SANCTIONS)
                .entityType(WatchlistEntry.EntityType.INDIVIDUAL)
                .country("BY")
                .aliasNames("Сергей Иванов")
                .reason("Belarus sanctions")
                .active(true)
                .build(),

            // UK Sanctions
            WatchlistEntry.builder()
                .entryId("UK-001")
                .fullName("Alexander Sorokin")
                .firstName("Alexander")
                .lastName("Sorokin")
                .type(WatchlistEntry.WatchlistType.UK_SANCTIONS)
                .entityType(WatchlistEntry.EntityType.INDIVIDUAL)
                .country("RU")
                .reason("Russia sanctions - oligarch")
                .active(true)
                .build(),

            // PEP List
            WatchlistEntry.builder()
                .entryId("PEP-001")
                .fullName("Carlos Rodriguez")
                .firstName("Carlos")
                .lastName("Rodriguez")
                .type(WatchlistEntry.WatchlistType.PEP)
                .entityType(WatchlistEntry.EntityType.INDIVIDUAL)
                .country("VE")
                .reason("Former government minister")
                .active(true)
                .build(),

            WatchlistEntry.builder()
                .entryId("PEP-002")
                .fullName("Mohammed Al-Rashid")
                .firstName("Mohammed")
                .lastName("Al-Rashid")
                .type(WatchlistEntry.WatchlistType.PEP)
                .entityType(WatchlistEntry.EntityType.INDIVIDUAL)
                .country("SA")
                .aliasNames("Mohamed Al Rasheed")
                .reason("Royal family member")
                .active(true)
                .build(),

            // Internal Watchlist
            WatchlistEntry.builder()
                .entryId("INT-001")
                .fullName("John Smith")
                .firstName("John")
                .lastName("Smith")
                .type(WatchlistEntry.WatchlistType.INTERNAL)
                .entityType(WatchlistEntry.EntityType.INDIVIDUAL)
                .country("US")
                .reason("Previous fraud incident - internal flag")
                .active(true)
                .build(),

            WatchlistEntry.builder()
                .entryId("INT-002")
                .fullName("Shell Corp Holdings LLC")
                .type(WatchlistEntry.WatchlistType.INTERNAL)
                .entityType(WatchlistEntry.EntityType.ORGANIZATION)
                .country("PA")
                .reason("Suspected shell company")
                .active(true)
                .build()
        );

        watchlistRepository.saveAll(entries);
        log.info("Seeded {} watchlist entries", entries.size());
    }
}