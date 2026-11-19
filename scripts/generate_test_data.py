"""
Test Data Generator for Compliance System
Generates realistic test transactions and user data for compliance testing
"""
import random
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any
from faker import Faker
from api_client import client

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

fake = Faker()

# High-risk patterns for generating suspicious data
HIGH_RISK_COUNTRIES = ["IR", "KP", "CU", "SY", "RU", "BY"]
STRUCTURING_AMOUNTS = [9500, 9800, 9900, 9950, 9999]
SUSPICIOUS_KEYWORDS = ["cash", "bearer", "offshore", "shell", "crypto"]


class TestDataGenerator:
    """Generate test data for compliance system testing"""

    def __init__(self):
        self.generated_users = []
        self.generated_transactions = []

    def generate_normal_transaction(self, user_id: int) -> Dict[str, Any]:
        """Generate a normal, low-risk transaction"""
        return {
            "fromAccountId": user_id,
            "toAccountId": random.randint(1, 100),
            "amount": round(random.uniform(10, 5000), 2),
            "type": random.choice(["TRANSFER", "PAYMENT"]),
            "description": fake.sentence(nb_words=5),
            "category": random.choice(["Shopping", "Bills", "Food", "Entertainment"])
        }

    def generate_high_value_transaction(self, user_id: int) -> Dict[str, Any]:
        """Generate a high-value transaction that should trigger CTR"""
        return {
            "fromAccountId": user_id,
            "toAccountId": random.randint(1, 100),
            "amount": round(random.uniform(10001, 100000), 2),
            "type": "TRANSFER",
            "description": f"Large transfer - {fake.company()}",
            "category": "Business"
        }

    def generate_structuring_pattern(self, user_id: int, count: int = 5) -> List[Dict[str, Any]]:
        """Generate a series of transactions that indicate structuring"""
        transactions = []
        base_time = datetime.now()

        for i in range(count):
            transactions.append({
                "fromAccountId": user_id,
                "toAccountId": random.randint(1, 100),
                "amount": random.choice(STRUCTURING_AMOUNTS),
                "type": "DEPOSIT",
                "description": f"Cash deposit #{i+1}",
                "category": "Deposit",
                "timestamp": (base_time - timedelta(hours=random.randint(1, 23))).isoformat()
            })

        return transactions

    def generate_rapid_velocity_pattern(self, user_id: int, count: int = 15) -> List[Dict[str, Any]]:
        """Generate rapid transactions indicating velocity anomaly"""
        transactions = []
        base_time = datetime.now()

        for i in range(count):
            transactions.append({
                "fromAccountId": user_id,
                "toAccountId": random.randint(1, 100),
                "amount": round(random.uniform(50, 500), 2),
                "type": random.choice(["TRANSFER", "PAYMENT"]),
                "description": f"Quick transfer {i+1}",
                "category": "Transfer",
                "timestamp": (base_time - timedelta(minutes=random.randint(1, 60))).isoformat()
            })

        return transactions

    def generate_watchlist_match_user(self) -> Dict[str, Any]:
        """Generate a user that should match watchlist entries"""
        # These names are similar to seeded watchlist entries
        suspicious_names = [
            ("Viktor", "Petroff"),  # Similar to Viktor Petrov
            ("Sergey", "Ivanov"),   # Similar to Sergei Ivanov
            ("Alexander", "Sorokin"),  # Exact match
            ("Carlos", "Rodriguez"),   # Exact match
            ("John", "Smyth"),      # Similar to John Smith
        ]

        first_name, last_name = random.choice(suspicious_names)

        return {
            "email": f"{first_name.lower()}.{last_name.lower()}@example.com",
            "password": "test123",
            "firstName": first_name,
            "lastName": last_name
        }

    def generate_test_scenario(self, scenario: str) -> Dict[str, Any]:
        """Generate a specific test scenario"""
        scenarios = {
            "structuring": self._create_structuring_scenario,
            "high_value": self._create_high_value_scenario,
            "velocity": self._create_velocity_scenario,
            "watchlist": self._create_watchlist_scenario,
            "mixed": self._create_mixed_scenario
        }

        if scenario not in scenarios:
            logger.error(f"Unknown scenario: {scenario}")
            return {}

        return scenarios[scenario]()

    def _create_structuring_scenario(self) -> Dict[str, Any]:
        """Create a complete structuring detection scenario"""
        logger.info("Creating structuring scenario...")
        # This would create users and transactions via API
        return {
            "scenario": "structuring",
            "description": "Multiple deposits just under $10,000 within 24 hours",
            "expected_alerts": ["STRUCTURING"],
            "transactions": self.generate_structuring_pattern(1, 5)
        }

    def _create_high_value_scenario(self) -> Dict[str, Any]:
        """Create a high-value transaction scenario"""
        logger.info("Creating high-value transaction scenario...")
        return {
            "scenario": "high_value",
            "description": "Transaction exceeding CTR threshold",
            "expected_alerts": ["THRESHOLD_BREACH"],
            "transactions": [self.generate_high_value_transaction(1)]
        }

    def _create_velocity_scenario(self) -> Dict[str, Any]:
        """Create a velocity anomaly scenario"""
        logger.info("Creating velocity anomaly scenario...")
        return {
            "scenario": "velocity",
            "description": "Rapid succession of transactions",
            "expected_alerts": ["VELOCITY"],
            "transactions": self.generate_rapid_velocity_pattern(1, 15)
        }

    def _create_watchlist_scenario(self) -> Dict[str, Any]:
        """Create a watchlist match scenario"""
        logger.info("Creating watchlist match scenario...")
        return {
            "scenario": "watchlist",
            "description": "User name matches sanctions watchlist",
            "expected_alerts": ["WATCHLIST_MATCH"],
            "user": self.generate_watchlist_match_user()
        }

    def _create_mixed_scenario(self) -> Dict[str, Any]:
        """Create a scenario with multiple risk indicators"""
        logger.info("Creating mixed risk scenario...")
        return {
            "scenario": "mixed",
            "description": "Multiple risk indicators combined",
            "expected_alerts": ["STRUCTURING", "VELOCITY", "THRESHOLD_BREACH"],
            "transactions": (
                self.generate_structuring_pattern(1, 3) +
                self.generate_rapid_velocity_pattern(1, 10) +
                [self.generate_high_value_transaction(1)]
            )
        }

    def generate_bulk_test_data(self, normal_count: int = 100, suspicious_count: int = 10) -> Dict[str, int]:
        """Generate bulk test data with mix of normal and suspicious activity"""
        logger.info(f"Generating {normal_count} normal and {suspicious_count} suspicious transactions...")

        stats = {
            "normal_transactions": 0,
            "suspicious_transactions": 0,
            "errors": 0
        }

        # Generate normal transactions
        for _ in range(normal_count):
            transaction = self.generate_normal_transaction(random.randint(1, 50))
            self.generated_transactions.append(transaction)
            stats["normal_transactions"] += 1

        # Generate suspicious patterns
        for _ in range(suspicious_count):
            pattern_type = random.choice(["structuring", "velocity", "high_value"])
            if pattern_type == "structuring":
                transactions = self.generate_structuring_pattern(random.randint(1, 50))
            elif pattern_type == "velocity":
                transactions = self.generate_rapid_velocity_pattern(random.randint(1, 50))
            else:
                transactions = [self.generate_high_value_transaction(random.randint(1, 50))]

            self.generated_transactions.extend(transactions)
            stats["suspicious_transactions"] += len(transactions)

        logger.info(f"Generated {stats['normal_transactions']} normal and {stats['suspicious_transactions']} suspicious transactions")
        return stats


def main():
    """Main entry point for test data generation"""
    import argparse
    import json

    parser = argparse.ArgumentParser(description="Compliance Test Data Generator")
    parser.add_argument("--scenario", type=str,
                        choices=["structuring", "high_value", "velocity", "watchlist", "mixed"],
                        help="Generate specific test scenario")
    parser.add_argument("--bulk", action="store_true", help="Generate bulk test data")
    parser.add_argument("--normal", type=int, default=100, help="Number of normal transactions")
    parser.add_argument("--suspicious", type=int, default=10, help="Number of suspicious patterns")
    parser.add_argument("--output", type=str, help="Output file for generated data")
    args = parser.parse_args()

    generator = TestDataGenerator()

    if args.scenario:
        result = generator.generate_test_scenario(args.scenario)
        print(f"\nGenerated Scenario: {args.scenario}")
        print(json.dumps(result, indent=2, default=str))

        if args.output:
            with open(args.output, 'w') as f:
                json.dump(result, f, indent=2, default=str)
            print(f"Saved to: {args.output}")

    elif args.bulk:
        stats = generator.generate_bulk_test_data(args.normal, args.suspicious)
        print(f"\nBulk Generation Stats: {stats}")

        if args.output:
            with open(args.output, 'w') as f:
                json.dump({
                    "stats": stats,
                    "transactions": generator.generated_transactions
                }, f, indent=2, default=str)
            print(f"Saved to: {args.output}")
    else:
        print("Please specify --scenario or --bulk")


if __name__ == "__main__":
    main()
