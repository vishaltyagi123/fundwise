package com.fundwise.api.repository.compliance;

import com.fundwise.api.model.compliance.DetectionRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DetectionRuleRepository extends JpaRepository<DetectionRule, Long> {

    Optional<DetectionRule> findByRuleCode(String ruleCode);

    List<DetectionRule> findByEnabledTrue();

    List<DetectionRule> findByType(DetectionRule.RuleType type);

    List<DetectionRule> findByCategory(DetectionRule.RuleCategory category);

    List<DetectionRule> findBySeverity(DetectionRule.Severity severity);

    List<DetectionRule> findByEnabledTrueAndType(DetectionRule.RuleType type);

    Long countByEnabledTrue();
}
