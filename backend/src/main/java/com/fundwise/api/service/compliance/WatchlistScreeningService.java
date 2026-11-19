package com.fundwise.api.service.compliance;

import com.fundwise.api.model.User;
import com.fundwise.api.model.compliance.*;
import com.fundwise.api.repository.UserRepository;
import com.fundwise.api.repository.compliance.ComplianceAlertRepository;
import com.fundwise.api.repository.compliance.DetectionRuleRepository;
import com.fundwise.api.repository.compliance.WatchlistRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class WatchlistScreeningService {

    private final WatchlistRepository watchlistRepository;
    private final UserRepository userRepository;
    private final ComplianceAlertRepository alertRepository;
    private final DetectionRuleRepository ruleRepository;

    private static final double FUZZY_MATCH_THRESHOLD = 0.80; // 80% similarity

    /**
     * Screen a user against all active watchlists
     */
    @Transactional
    public List<WatchlistMatch> screenUser(User user) {
        List<WatchlistMatch> matches = new ArrayList<>();
        List<WatchlistEntry> activeEntries = watchlistRepository.findByActiveTrue();

        String userFullName = user.getFullName();
        String userFirstName = user.getFirstName();
        String userLastName = user.getLastName();

        for (WatchlistEntry entry : activeEntries) {
            Optional<WatchlistMatch> match = checkMatch(user, entry, userFullName, userFirstName, userLastName);
            match.ifPresent(matches::add);
        }

        // Generate alerts for high-confidence matches
        for (WatchlistMatch match : matches) {
            if (match.getMatchScore() >= 0.90) {
                generateWatchlistAlert(match);
            }
        }

        log.info("Screened user {} against {} watchlist entries, found {} potential matches",
            user.getEmail(), activeEntries.size(), matches.size());

        return matches;
    }

    /**
     * Screen all users (batch screening)
     */
    @Transactional
    public Map<Long, List<WatchlistMatch>> screenAllUsers() {
        Map<Long, List<WatchlistMatch>> results = new HashMap<>();
        List<User> users = userRepository.findAll();

        for (User user : users) {
            List<WatchlistMatch> matches = screenUser(user);
            if (!matches.isEmpty()) {
                results.put(user.getId(), matches);
            }
        }

        return results;
    }

    private Optional<WatchlistMatch> checkMatch(User user, WatchlistEntry entry,
                                                 String userFullName, String userFirstName, String userLastName) {
        double maxScore = 0.0;
        List<String> matchedFields = new ArrayList<>();
        String matchType = "NONE";

        // Check full name match
        double fullNameScore = calculateSimilarity(userFullName, entry.getFullName());
        if (fullNameScore > maxScore) {
            maxScore = fullNameScore;
            matchedFields.add("fullName");
            matchType = fullNameScore == 1.0 ? "EXACT" : "FUZZY";
        }

        // Check first + last name combination
        if (entry.getFirstName() != null && entry.getLastName() != null) {
            double firstNameScore = calculateSimilarity(userFirstName, entry.getFirstName());
            double lastNameScore = calculateSimilarity(userLastName, entry.getLastName());
            double combinedScore = (firstNameScore + lastNameScore) / 2;

            if (combinedScore > maxScore) {
                maxScore = combinedScore;
                matchedFields.clear();
                if (firstNameScore > FUZZY_MATCH_THRESHOLD) matchedFields.add("firstName");
                if (lastNameScore > FUZZY_MATCH_THRESHOLD) matchedFields.add("lastName");
                matchType = combinedScore == 1.0 ? "EXACT" : "FUZZY";
            }
        }

        // Check aliases
        if (entry.getAliasNames() != null) {
            for (String alias : entry.getAliasNames().split(",")) {
                double aliasScore = calculateSimilarity(userFullName, alias.trim());
                if (aliasScore > maxScore) {
                    maxScore = aliasScore;
                    matchedFields.add("alias:" + alias.trim());
                    matchType = aliasScore == 1.0 ? "EXACT" : "PARTIAL";
                }
            }
        }

        // Only return if above threshold
        if (maxScore >= FUZZY_MATCH_THRESHOLD) {
            return Optional.of(WatchlistMatch.builder()
                .matchId(generateMatchId())
                .user(user)
                .watchlistEntry(entry)
                .matchScore(maxScore)
                .matchType(matchType)
                .matchedFields(String.join(",", matchedFields))
                .status(WatchlistMatch.MatchStatus.PENDING_REVIEW)
                .build());
        }

        return Optional.empty();
    }

    /**
     * Calculate string similarity using Levenshtein distance
     */
    public double calculateSimilarity(String s1, String s2) {
        if (s1 == null || s2 == null) return 0.0;

        s1 = s1.toLowerCase().trim();
        s2 = s2.toLowerCase().trim();

        if (s1.equals(s2)) return 1.0;
        if (s1.isEmpty() || s2.isEmpty()) return 0.0;

        int distance = levenshteinDistance(s1, s2);
        int maxLength = Math.max(s1.length(), s2.length());

        return 1.0 - ((double) distance / maxLength);
    }

    /**
     * Levenshtein distance algorithm
     */
    private int levenshteinDistance(String s1, String s2) {
        int[][] dp = new int[s1.length() + 1][s2.length() + 1];

        for (int i = 0; i <= s1.length(); i++) {
            dp[i][0] = i;
        }
        for (int j = 0; j <= s2.length(); j++) {
            dp[0][j] = j;
        }

        for (int i = 1; i <= s1.length(); i++) {
            for (int j = 1; j <= s2.length(); j++) {
                int cost = s1.charAt(i - 1) == s2.charAt(j - 1) ? 0 : 1;
                dp[i][j] = Math.min(Math.min(
                    dp[i - 1][j] + 1,      // deletion
                    dp[i][j - 1] + 1),     // insertion
                    dp[i - 1][j - 1] + cost // substitution
                );
            }
        }

        return dp[s1.length()][s2.length()];
    }

    private void generateWatchlistAlert(WatchlistMatch match) {
        // Find or create watchlist rule
        DetectionRule rule = ruleRepository.findByRuleCode("WATCHLIST_MATCH")
            .orElseGet(() -> ruleRepository.save(DetectionRule.builder()
                .ruleCode("WATCHLIST_MATCH")
                .ruleName("Watchlist Match Detection")
                .description("Detects potential matches against sanctions and PEP watchlists")
                .type(DetectionRule.RuleType.WATCHLIST_MATCH)
                .category(DetectionRule.RuleCategory.SANCTIONS)
                .severity(DetectionRule.Severity.HIGH)
                .enabled(true)
                .build()));

        ComplianceAlert alert = ComplianceAlert.builder()
            .alertNumber(generateAlertNumber())
            .rule(rule)
            .user(match.getUser())
            .alertType("WATCHLIST_MATCH")
            .severity(DetectionRule.Severity.HIGH)
            .description(String.format("Potential watchlist match (%.0f%% confidence): %s matches %s (%s)",
                match.getMatchScore() * 100,
                match.getUser().getFullName(),
                match.getWatchlistEntry().getFullName(),
                match.getWatchlistEntry().getType()))
            .riskScore((int)(match.getMatchScore() * 100))
            .status(ComplianceAlert.AlertStatus.OPEN)
            .build();

        alertRepository.save(alert);
        log.info("Generated watchlist alert: {}", alert.getAlertNumber());
    }

    private String generateMatchId() {
        return "WLM-" + System.currentTimeMillis() + "-" +
               UUID.randomUUID().toString().substring(0, 4).toUpperCase();
    }

    private String generateAlertNumber() {
        return "ALT-" + System.currentTimeMillis() + "-" +
               UUID.randomUUID().toString().substring(0, 4).toUpperCase();
    }

    /**
     * Search watchlist entries
     */
    public List<WatchlistEntry> searchWatchlist(String query) {
        return watchlistRepository.searchByName(query);
    }

    /**
     * Get watchlist statistics
     */
    public Map<String, Object> getWatchlistStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalEntries", watchlistRepository.countActive());
        stats.put("byType", watchlistRepository.countByType());
        return stats;
    }
}
