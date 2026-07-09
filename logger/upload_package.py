from pathlib import Path


class UploadPackage:
    def __init__(self, csv_file: Path, manifest_file: Path) -> None:
        self.csv_file = csv_file
        self.manifest_file = manifest_file

    def validate(self) -> None:
        if not self.csv_file.exists():
            raise FileNotFoundError(f"CSV file not found: {self.csv_file}")

        if not self.manifest_file.exists():
            raise FileNotFoundError(f"Manifest file not found: {self.manifest_file}")

    def print_summary(self) -> str:
        csv_size_kb = self.csv_file.stat().st_size / 1024
        manifest_size_kb = self.manifest_file.stat().st_size / 1024

        return (
            "\nUpload package ready:\n"
            f"- CSV: {self.csv_file.name} ({csv_size_kb:.2f} KB)\n"
            f"- Manifest: {self.manifest_file.name} ({manifest_size_kb:.2f} KB)"
        )