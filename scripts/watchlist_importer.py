"""
Watchlist Import Automation Script
Imports and updates watchlist data from various sanctions sources
"""
import csv
import logging
import xml.etree.ElementTree as ET
from io import StringIO
from typing import Dict, Any, List, Optional
from datetime import datetime
import requests
from api_client import client
from config import WATCHLIST_SOURCES

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class WatchlistImporter:
    """Import watchlist entries from official sanctions lists"""

    def __init__(self):
        self.stats = {
            "entries_processed": 0,
            "entries_added": 0,
            "entries_updated": 0,
            "errors": 0
        }

    def import_from_csv(self, csv_content: str, list_type: str) -> List[Dict[str, Any]]:
        """Parse CSV content and extract watchlist entries"""
        entries = []
        reader = csv.DictReader(StringIO(csv_content))

        for row in reader:
            entry = self._map_csv_row_to_entry(row, list_type)
            if entry:
                entries.append(entry)

        return entries

    def _map_csv_row_to_entry(self, row: Dict[str, str], list_type: str) -> Optional[Dict[str, Any]]:
        """Map CSV row to watchlist entry format"""
        try:
            # Common field mappings (adjust based on actual source formats)
            full_name = row.get("Name", row.get("FULL_NAME", row.get("name", "")))
            if not full_name:
                return None

            # Split name into parts
            name_parts = full_name.split(",")
            last_name = name_parts[0].strip() if name_parts else ""
            first_name = name_parts[1].strip() if len(name_parts) > 1 else ""

            return {
                "fullName": full_name,
                "firstName": first_name,
                "lastName": last_name,
                "type": list_type,
                "entityType": row.get("Type", "INDIVIDUAL").upper(),
                "country": row.get("Country", row.get("COUNTRY", "")),
                "aliasNames": row.get("Aliases", row.get("AKA", "")),
                "reason": row.get("Remarks", row.get("REASON", f"Listed on {list_type}")),
                "active": True
            }
        except Exception as e:
            logger.error(f"Error mapping row: {e}")
            return None

    def import_from_xml(self, xml_content: str, list_type: str) -> List[Dict[str, Any]]:
        """Parse XML content (UN Sanctions format)"""
        entries = []
        try:
            root = ET.fromstring(xml_content)

            # UN Sanctions XML namespace
            ns = {'un': 'http://www.un.org/schemas/scsanctions/sanctions/1.0'}

            for entity in root.findall('.//INDIVIDUAL', ns) + root.findall('.//ENTITY', ns):
                entry = self._map_xml_entity(entity, list_type, ns)
                if entry:
                    entries.append(entry)

        except ET.ParseError as e:
            logger.error(f"XML parsing error: {e}")

        return entries

    def _map_xml_entity(self, entity: ET.Element, list_type: str, ns: Dict) -> Optional[Dict[str, Any]]:
        """Map XML entity to watchlist entry"""
        try:
            # Extract name components
            first_name_elem = entity.find('.//FIRST_NAME', ns)
            second_name_elem = entity.find('.//SECOND_NAME', ns)
            third_name_elem = entity.find('.//THIRD_NAME', ns)

            first_name = first_name_elem.text if first_name_elem is not None else ""
            last_name = second_name_elem.text if second_name_elem is not None else ""

            full_name = " ".join(filter(None, [
                first_name,
                last_name,
                third_name_elem.text if third_name_elem is not None else ""
            ]))

            if not full_name:
                return None

            # Get aliases
            aliases = []
            for alias in entity.findall('.//ALIAS', ns):
                alias_name = alias.find('ALIAS_NAME', ns)
                if alias_name is not None and alias_name.text:
                    aliases.append(alias_name.text)

            return {
                "fullName": full_name,
                "firstName": first_name,
                "lastName": last_name,
                "type": list_type,
                "entityType": "INDIVIDUAL" if entity.tag == "INDIVIDUAL" else "ORGANIZATION",
                "country": "",  # Extract from nationality if available
                "aliasNames": ", ".join(aliases),
                "reason": f"UN Security Council sanctions list",
                "active": True
            }
        except Exception as e:
            logger.error(f"Error mapping XML entity: {e}")
            return None

    def fetch_and_import(self, source_url: str, list_type: str) -> Dict[str, int]:
        """Fetch watchlist from URL and import entries"""
        logger.info(f"Fetching watchlist from {source_url}")

        try:
            response = requests.get(source_url, timeout=60)
            response.raise_for_status()
            content = response.text

            # Determine format and parse
            if source_url.endswith('.xml'):
                entries = self.import_from_xml(content, list_type)
            else:
                entries = self.import_from_csv(content, list_type)

            logger.info(f"Parsed {len(entries)} entries from {list_type}")

            # Import to API
            return self._import_entries(entries)

        except requests.RequestException as e:
            logger.error(f"Failed to fetch watchlist: {e}")
            return {"error": str(e)}

    def _import_entries(self, entries: List[Dict[str, Any]]) -> Dict[str, int]:
        """Import entries via API"""
        added = 0
        errors = 0

        for entry in entries:
            self.stats["entries_processed"] += 1
            result = client.add_watchlist_entry(entry)

            if result:
                added += 1
                self.stats["entries_added"] += 1
            else:
                errors += 1
                self.stats["errors"] += 1

        return {"added": added, "errors": errors}

    def import_from_file(self, file_path: str, list_type: str) -> Dict[str, int]:
        """Import watchlist from local file"""
        logger.info(f"Importing watchlist from file: {file_path}")

        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()

            if file_path.endswith('.xml'):
                entries = self.import_from_xml(content, list_type)
            else:
                entries = self.import_from_csv(content, list_type)

            logger.info(f"Parsed {len(entries)} entries from file")
            return self._import_entries(entries)

        except Exception as e:
            logger.error(f"Failed to import from file: {e}")
            return {"error": str(e)}

    def run_full_update(self) -> Dict[str, Any]:
        """Run full watchlist update from all sources"""
        logger.info("Starting full watchlist update...")
        results = {}

        for list_type, url in WATCHLIST_SOURCES.items():
            logger.info(f"Processing {list_type}...")
            result = self.fetch_and_import(url, list_type)
            results[list_type] = result

        logger.info(f"Watchlist update complete. Stats: {self.stats}")
        return {
            "results": results,
            "stats": self.stats,
            "timestamp": datetime.now().isoformat()
        }

    def get_statistics(self) -> Dict[str, Any]:
        """Get import statistics"""
        return self.stats


def main():
    """Main entry point for watchlist import"""
    import argparse

    parser = argparse.ArgumentParser(description="Watchlist Import Automation")
    parser.add_argument("--file", type=str, help="Import from local file")
    parser.add_argument("--type", type=str, default="INTERNAL",
                        choices=["OFAC_SDN", "UN_SANCTIONS", "EU_SANCTIONS", "UK_SANCTIONS", "PEP", "INTERNAL"],
                        help="Watchlist type")
    parser.add_argument("--full-update", action="store_true", help="Run full update from all sources")
    args = parser.parse_args()

    importer = WatchlistImporter()

    if args.full_update:
        results = importer.run_full_update()
        print(f"\nUpdate Results: {results}")
    elif args.file:
        result = importer.import_from_file(args.file, args.type)
        print(f"\nImport Result: {result}")
        print(f"Statistics: {importer.get_statistics()}")
    else:
        print("Please specify --file or --full-update")


if __name__ == "__main__":
    main()
