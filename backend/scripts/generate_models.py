from __future__ import annotations

import re
import sys
from pathlib import Path
from dataclasses import dataclass
from typing import Optional


@dataclass
class Column:
    name: str
    sql_type: str
    nullable: bool
    default: Optional[str] = None


@dataclass
class Table:
    name: str
    columns: list[Column]


CREATE_TABLE_RE = re.compile(
    r"CREATE\s+TABLE\s+IF\s+NOT\s+EXISTS\s+([a-zA-Z0-9_.]+)\s*\((.*?)\);",
    re.IGNORECASE | re.DOTALL,
)


def snake_to_pascal(name: str) -> str:
    return "".join(part.capitalize() for part in name.split("_"))


def strip_sql_comments(sql: str) -> str:
    # remove -- comments
    sql = re.sub(r"--.*?$", "", sql, flags=re.MULTILINE)
    return sql


def split_top_level_commas(block: str) -> list[str]:
    parts = []
    current = []
    depth = 0
    in_single_quote = False

    i = 0
    while i < len(block):
        ch = block[i]

        if ch == "'" and (i == 0 or block[i - 1] != "\\"):
            in_single_quote = not in_single_quote
            current.append(ch)
        elif not in_single_quote:
            if ch == "(":
                depth += 1
                current.append(ch)
            elif ch == ")":
                depth -= 1
                current.append(ch)
            elif ch == "," and depth == 0:
                part = "".join(current).strip()
                if part:
                    parts.append(part)
                current = []
            else:
                current.append(ch)
        else:
            current.append(ch)

        i += 1

    tail = "".join(current).strip()
    if tail:
        parts.append(tail)

    return parts


def is_constraint_line(line: str) -> bool:
    upper = line.strip().upper()
    return (
        upper.startswith("CONSTRAINT ")
        or upper.startswith("PRIMARY KEY")
        or upper.startswith("FOREIGN KEY")
        or upper.startswith("UNIQUE ")
        or upper.startswith("CHECK ")
    )


def normalize_sql_type(sql_type: str) -> str:
    sql_type = re.sub(r"\s+", " ", sql_type.strip().lower())
    return sql_type


def map_sql_type_to_python(sql_type: str) -> tuple[str, set[str]]:
    t = normalize_sql_type(sql_type)
    imports: set[str] = set()

    if t == "uuid":
        imports.add("UUID")
        return "UUID", imports

    if t in {"text", "character varying", "varchar", "character", "char"}:
        return "str", imports

    if t in {"bigint", "integer", "int", "smallint"}:
        return "int", imports

    if t in {"double precision", "real"}:
        return "float", imports

    if t.startswith("numeric") or t.startswith("decimal"):
        imports.add("Decimal")
        return "Decimal", imports

    if t in {"boolean", "bool"}:
        return "bool", imports

    if t in {"date"}:
        imports.add("date")
        return "date", imports

    if t.startswith("timestamp"):
        imports.add("datetime")
        return "datetime", imports

    if t.startswith("time"):
        imports.add("time")
        return "time", imports

    if t in {"json", "jsonb"}:
        imports.add("Any")
        return "dict[str, Any]", imports

    if t == "bytea":
        return "bytes", imports

    # arrays
    if t.endswith("[]"):
        base = t[:-2]
        base_py, base_imports = map_sql_type_to_python(base)
        imports |= base_imports
        return f"list[{base_py}]", imports

    # fallback
    imports.add("Any")
    return "Any", imports


def parse_column(line: str) -> Optional[Column]:
    line = line.strip().rstrip(",")

    if not line or is_constraint_line(line):
        return None

    # first token = column name, then type + modifiers
    m = re.match(r'^"?(?P<name>[a-zA-Z0-9_]+)"?\s+(?P<rest>.+)$', line)
    if not m:
        return None

    name = m.group("name")
    rest = m.group("rest").strip()

    # separate SQL type from modifiers
    # stop before NOT NULL / NULL / DEFAULT / GENERATED / CONSTRAINT / REFERENCES / PRIMARY / UNIQUE / CHECK
    split_re = re.compile(
        r"\s+(?=NOT\s+NULL\b|NULL\b|DEFAULT\b|GENERATED\b|CONSTRAINT\b|REFERENCES\b|PRIMARY\b|UNIQUE\b|CHECK\b)",
        re.IGNORECASE,
    )
    parts = split_re.split(rest, maxsplit=1)
    sql_type = parts[0].strip()
    modifiers = parts[1].strip() if len(parts) > 1 else ""

    nullable = not bool(re.search(r"\bNOT\s+NULL\b", modifiers, re.IGNORECASE))

    default = None
    default_match = re.search(
        r"\bDEFAULT\s+(.+?)(?=\s+(?:NOT\s+NULL|NULL|CONSTRAINT|REFERENCES|PRIMARY|UNIQUE|CHECK)\b|$)",
        modifiers,
        re.IGNORECASE,
    )
    if default_match:
        default = default_match.group(1).strip()

    return Column(name=name, sql_type=sql_type, nullable=nullable, default=default)


def parse_tables(sql: str) -> list[Table]:
    sql = strip_sql_comments(sql)
    tables: list[Table] = []

    for match in CREATE_TABLE_RE.finditer(sql):
        full_name = match.group(1)
        body = match.group(2)

        table_name = full_name.split(".")[-1]
        lines = split_top_level_commas(body)

        columns: list[Column] = []
        for line in lines:
            col = parse_column(line)
            if col:
                columns.append(col)

        tables.append(Table(name=table_name, columns=columns))

    return tables


def sql_default_to_python(default: str, py_type: str) -> Optional[str]:
    if default is None:
        return None

    d = default.strip()

    # remove postgres casts like '0'::double precision
    d = re.sub(r"::[a-zA-Z0-9_ ]+", "", d).strip()

    if d.lower() == "null":
        return "None"

    if d.lower() in {"true", "false"}:
        return d.capitalize()

    if d.lower() == "now()":
        return None

    if d.lower() == "gen_random_uuid()":
        return None

    if re.fullmatch(r"-?\d+", d):
        return d

    if re.fullmatch(r"-?\d+\.\d+", d):
        return d

    if d.startswith("'") and d.endswith("'"):
        return repr(d[1:-1])

    return None


def render_model(table: Table) -> tuple[str, set[str]]:
    class_name = snake_to_pascal(table.name)
    lines = [f"class {class_name}(BaseModel):"]
    needed_imports: set[str] = set()

    if not table.columns:
        lines.append("    pass")
        return "\n".join(lines), needed_imports

    for col in table.columns:
        py_type, imports = map_sql_type_to_python(col.sql_type)
        needed_imports |= imports

        default_value = sql_default_to_python(col.default, py_type)

        if col.nullable:
            needed_imports.add("Optional")
            annotation = f"Optional[{py_type}]"
            assignment = " = None"
        else:
            annotation = py_type
            assignment = ""

            if default_value is not None:
                assignment = f" = {default_value}"

        lines.append(f"    {col.name}: {annotation}{assignment}")

    return "\n".join(lines), needed_imports


def render_output(tables: list[Table]) -> str:
    all_imports: set[str] = set()
    rendered_models: list[str] = []

    for table in tables:
        model_text, imports = render_model(table)
        rendered_models.append(model_text)
        all_imports |= imports

    import_lines = [
        "from __future__ import annotations",
        "",
        "from pydantic import BaseModel",
    ]

    typing_imports = []
    std_imports = []

    if "Optional" in all_imports:
        typing_imports.append("Optional")
        all_imports.remove("Optional")

    if "Any" in all_imports:
        typing_imports.append("Any")
        all_imports.remove("Any")

    for item in sorted(all_imports):
        if item in {"UUID", "datetime", "date", "time", "Decimal"}:
            std_imports.append(item)

    if typing_imports:
        import_lines.append(f"from typing import {', '.join(sorted(typing_imports))}")

    datetime_items = [x for x in std_imports if x in {"datetime", "date", "time"}]
    if datetime_items:
        import_lines.append(f"from datetime import {', '.join(sorted(datetime_items))}")

    if "UUID" in std_imports:
        import_lines.append("from uuid import UUID")

    if "Decimal" in std_imports:
        import_lines.append("from decimal import Decimal")

    return "\n".join(import_lines) + "\n\n\n" + "\n\n\n".join(rendered_models) + "\n"


def main() -> None:
    if len(sys.argv) != 3:
        print("Usage: python sql_to_pydantic.py <input.sql> <output.py>")
        sys.exit(1)

    input_path = Path(sys.argv[1])
    output_path = Path(sys.argv[2])

    if not input_path.exists():
        print(f"Input file not found: {input_path}")
        sys.exit(1)

    sql = input_path.read_text(encoding="utf-8")
    tables = parse_tables(sql)

    if not tables:
        print("No CREATE TABLE statements found.")
        sys.exit(1)

    output = render_output(tables)
    output_path.write_text(output, encoding="utf-8")

    print(f"Generated {len(tables)} models into {output_path}")


if __name__ == "__main__":
    main()
