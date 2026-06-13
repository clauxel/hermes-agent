from __future__ import annotations

import json
import os
import re
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable
from urllib.parse import urljoin, urlparse
from urllib.request import Request, urlopen

from bs4 import BeautifulSoup
from markdownify import markdownify as to_markdown


SOURCE_BASE_URL = "https://hermesagent.studio"
PUBLIC_BASE_URL = "https://hermesagent.studio"
PUBLIC_BRAND = "HermesAgent Studio"
PUBLIC_REPO_URL = "https://github.com/clauxel/Hermes-Agent"
PUBLIC_ISSUES_URL = f"{PUBLIC_REPO_URL}/issues"
PUBLIC_SECURITY_URL = f"{PUBLIC_REPO_URL}/security"
PUBLIC_INSTALL_SCRIPT_URL = "https://raw.githubusercontent.com/clauxel/Hermes-Agent/main/scripts/install.sh"
PUBLIC_NIX_REF = "github:clauxel/Hermes-Agent"
OUTPUT_ROOT = Path("doc") / urlparse(PUBLIC_BASE_URL).netloc
USER_AGENT = "Mozilla/5.0 (compatible; HermesDocsMirror/1.0; +https://hermesagent.studio)"

HASH_MAP_RE = re.compile(
    r'window\.__VP_HASH_MAP__=JSON\.parse\("(?P<json>.*?)"\);',
    re.DOTALL,
)


@dataclass(frozen=True)
class Page:
    route: str
    url: str
    output_path: Path
    title: str


def fetch_text(url: str) -> str:
    request = Request(url, headers={"User-Agent": USER_AGENT})
    with urlopen(request) as response:
        return response.read().decode("utf-8")


def parse_embedded_json(html: str, pattern: re.Pattern[str]) -> dict[str, str]:
    match = pattern.search(html)
    if not match:
        raise RuntimeError("Could not find embedded site metadata in the page HTML.")
    encoded_json = match.group("json")
    return json.loads(json.loads(f'"{encoded_json}"'))


def key_to_route(key: str) -> str:
    if key == "index.md":
        return "/"
    section, slug = key.split("_", 1)
    if not slug.endswith(".md"):
        raise RuntimeError(f"Unexpected VitePress page key: {key}")
    return f"/{section}/{slug[:-3]}"


def route_to_output_path(route: str, output_root: Path) -> Path:
    if route == "/":
        return output_root / "index.md"
    return output_root / f"{route.lstrip('/')}.md"


def normalize_route(path: str) -> str:
    if not path or path == "/":
        return "/"
    clean_path = path
    if clean_path.endswith(".html"):
        clean_path = clean_path[:-5]
    clean_path = clean_path.rstrip("/")
    if not clean_path.startswith("/"):
        clean_path = f"/{clean_path}"
    return clean_path or "/"


def build_relative_link(
    current_route: str,
    target_route: str,
    output_root: Path,
    fragment: str,
) -> str:
    if current_route == target_route and fragment:
        return f"#{fragment}"

    current_file = route_to_output_path(current_route, output_root)
    target_file = route_to_output_path(target_route, output_root)
    relative_path = os.path.relpath(target_file, current_file.parent).replace("\\", "/")
    if fragment:
        return f"{relative_path}#{fragment}"
    return relative_path


def build_slug_aliases(routes: Iterable[str]) -> dict[str, str]:
    alias_map: dict[str, str] = {}
    counts: dict[str, int] = {}
    for route in routes:
        if route == "/":
            continue
        slug = route.rsplit("/", 1)[-1]
        counts[slug] = counts.get(slug, 0) + 1
        alias_map[slug] = route
    return {slug: route for slug, route in alias_map.items() if counts.get(slug) == 1}


def resolve_internal_route(target_route: str, all_routes: set[str], slug_aliases: dict[str, str]) -> str | None:
    if target_route in all_routes:
        return target_route
    slug = target_route.rsplit("/", 1)[-1]
    return slug_aliases.get(slug)


def rewrite_links(
    fragment: BeautifulSoup,
    current_route: str,
    all_routes: set[str],
    slug_aliases: dict[str, str],
    output_root: Path,
) -> None:
    base_netloc = urlparse(SOURCE_BASE_URL).netloc
    for anchor in fragment.find_all("a", href=True):
        href = anchor["href"].strip()
        if not href or href.startswith("#") or href.startswith("mailto:") or href.startswith("tel:"):
            continue

        absolute_url = urljoin(SOURCE_BASE_URL, href)
        parsed = urlparse(absolute_url)
        if parsed.netloc and parsed.netloc != base_netloc:
            continue

        target_route = resolve_internal_route(
            target_route=normalize_route(parsed.path),
            all_routes=all_routes,
            slug_aliases=slug_aliases,
        )
        if target_route:
            anchor["href"] = build_relative_link(
                current_route=current_route,
                target_route=target_route,
                output_root=output_root,
                fragment=parsed.fragment,
            )
        else:
            anchor["href"] = absolute_url


def extract_fragment(route: str, html: str) -> BeautifulSoup:
    soup = BeautifulSoup(html, "html.parser")
    if route == "/":
        fragment = soup.select_one("#VPContent .VPHome")
    else:
        fragment = soup.select_one("#VPContent main.main div.vp-doc")

    if fragment is None:
        raise RuntimeError(f"Could not find main content for route {route}")

    isolated_fragment = BeautifulSoup(str(fragment), "html.parser")
    for header_anchor in isolated_fragment.select("a.header-anchor"):
        header_anchor.decompose()
    return isolated_fragment


def detect_title(fragment: BeautifulSoup, route: str) -> str:
    heading = fragment.find("h1")
    if heading:
        text = " ".join(part.strip() for part in heading.stripped_strings if part.strip())
        if text:
            return text
    return "Hermes Agent" if route == "/" else route.rsplit("/", 1)[-1]


def cleanup_markdown(markdown: str) -> str:
    cleaned = markdown.replace("\r\n", "\n").replace("\u200b", "")
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
    return cleaned.strip()


def customize_markdown(route: str, markdown: str) -> str:
    route_specific_replacements: dict[str, list[tuple[str, str]]] = {
        "/": [
            (
                "由 Nous Research 打造 · 自我进化 · 跨平台 · 开源免费",
                f"由 {PUBLIC_BRAND} 维护 · 自我进化 · 跨平台 · 开源免费",
            ),
            (
                "Hermes Agent 是由 [Nous Research](https://nousresearch.com) 开发的开源自托管 AI 智能体框架，采用 MIT 协议授权，GitHub 已获得 28,000+ Star。",
                f"Hermes Agent 是一个开源自托管 AI 智能体框架，目前由 [{PUBLIC_BRAND}]({PUBLIC_BASE_URL}/) 维护，采用 MIT 协议授权，代码仓库位于 [GitHub]({PUBLIC_REPO_URL})。",
            ),
        ],
        "/guide/introduction": [
            (
                "Hermes Agent 是由 [Nous Research](https://nousresearch.com) 开发的开源自托管 AI 智能体框架。项目采用 **MIT 许可证**，当前版本为 **v0.2.0**，在 GitHub 上已获得 **28,000+ Star**，是目前最受关注的自托管智能体项目之一。",
                f"Hermes Agent 是一个开源自托管 AI 智能体框架，目前由 [{PUBLIC_BRAND}]({PUBLIC_BASE_URL}/) 维护。项目采用 **MIT 许可证**，当前文档基于 **v0.2.0** 内容整理，代码仓库位于 [GitHub]({PUBLIC_REPO_URL})。",
            ),
            (
                "- **GitHub Stars**：28,000+",
                f"- **代码仓库**：[{PUBLIC_REPO_URL.removeprefix('https://github.com/')}]({PUBLIC_REPO_URL})",
            ),
        ],
        "/guide/installation": [
            (
                "git clone --recurse-submodules https://github.com/NousResearch/hermes-agent.git\ncd hermes-agent",
                f"git clone --recurse-submodules {PUBLIC_REPO_URL}.git hermes-agent\ncd hermes-agent",
            ),
        ],
        "/guide/configuration": [
            (
                "你是 Hermes，一个由 Nous Research 开发的 AI 助手。",
                f"你是 Hermes，一个由 {PUBLIC_BRAND} 维护的 AI 助手。",
            ),
        ],
        "/guide/security": [
            (
                "- **邮件**：security@nousresearch.com",
                "- **邮件**：请使用你自己的安全响应邮箱",
            ),
            (
                "- **GitHub Security Advisories**：在项目仓库的 Security 标签页提交私密报告",
                f"- **GitHub Security Advisories**：在 [项目仓库的 Security 页面]({PUBLIC_SECURITY_URL}) 提交私密报告",
            ),
        ],
        "/developer/adding-tools": [
            (
                "git clone https://github.com/NousResearch/hermes.git\ncd hermes",
                f"git clone {PUBLIC_REPO_URL}.git hermes-agent\ncd hermes-agent",
            ),
        ],
    }
    shared_replacements = [
        ("https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh", PUBLIC_INSTALL_SCRIPT_URL),
        ("https://github.com/NousResearch/hermes-agent/issues", PUBLIC_ISSUES_URL),
        ("https://github.com/NousResearch/hermes-agent.git", f"{PUBLIC_REPO_URL}.git"),
        ("https://github.com/NousResearch/hermes-agent", PUBLIC_REPO_URL),
        ("https://github.com/NousResearch/hermes.git", f"{PUBLIC_REPO_URL}.git"),
        ("https://github.com/NousResearch/hermes", PUBLIC_REPO_URL),
        ("github:NousResearch/hermes-agent", PUBLIC_NIX_REF),
        ("[Nous Research](https://nousresearch.com)", f"[{PUBLIC_BRAND}]({PUBLIC_BASE_URL}/)"),
        ("Nous Research 官方发布的技能", "项目官方发布的技能"),
    ]

    for old, new in route_specific_replacements.get(route, []):
        markdown = markdown.replace(old, new)
    for old, new in shared_replacements:
        markdown = markdown.replace(old, new)
    return markdown


def convert_fragment_to_markdown(fragment: BeautifulSoup) -> str:
    return cleanup_markdown(
        to_markdown(
            str(fragment),
            heading_style="ATX",
            bullets="-",
            strong_em_symbol="*",
            wrap=False,
        )
    )


def build_front_matter(title: str, url: str, mirrored_at: str) -> str:
    return "\n".join(
        [
            "---",
            f"title: {json.dumps(title, ensure_ascii=False)}",
            f"source: {url}",
            f"mirrored_at: {mirrored_at}",
            "---",
            "",
        ]
    )


def build_readme(pages: list[Page], mirrored_at: str) -> str:
    ordered_pages = sorted(pages, key=lambda page: (page.route != "/", page.route))
    public_host = urlparse(PUBLIC_BASE_URL).netloc
    lines = [
        f"# {public_host} Docs Mirror",
        "",
        f"- Source: {PUBLIC_BASE_URL}",
        f"- Mirrored at: {mirrored_at}",
        f"- Page count: {len(ordered_pages)}",
        "- Generated by: `python scripts/mirror_hermesagent_studio_docs.py`",
        "",
        "## Pages",
        "",
    ]

    for page in ordered_pages:
        relative_path = page.output_path.relative_to(OUTPUT_ROOT).as_posix()
        lines.append(f"- [{page.title}]({relative_path})")

    lines.append("")
    return "\n".join(lines)


def main() -> None:
    root_html = fetch_text(f"{SOURCE_BASE_URL}/")
    hash_map = parse_embedded_json(root_html, HASH_MAP_RE)
    routes = [key_to_route(key) for key in hash_map]
    route_set = set(routes)
    slug_aliases = build_slug_aliases(routes)

    mirrored_at = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    output_root = OUTPUT_ROOT
    output_root.mkdir(parents=True, exist_ok=True)

    pages: list[Page] = []
    for route in routes:
        source_url = urljoin(f"{SOURCE_BASE_URL}/", route.lstrip("/"))
        public_url = urljoin(f"{PUBLIC_BASE_URL}/", route.lstrip("/"))
        html = fetch_text(source_url)
        fragment = extract_fragment(route, html)
        rewrite_links(fragment, route, route_set, slug_aliases, output_root)
        title = detect_title(fragment, route)
        markdown = convert_fragment_to_markdown(fragment)
        markdown = customize_markdown(route, markdown)
        output_path = route_to_output_path(route, output_root)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(
            build_front_matter(title=title, url=public_url, mirrored_at=mirrored_at) + markdown + "\n",
            encoding="utf-8",
        )
        pages.append(Page(route=route, url=public_url, output_path=output_path, title=title))

    readme_path = output_root / "README.md"
    readme_path.write_text(build_readme(pages, mirrored_at), encoding="utf-8")
    print(f"Mirrored {len(pages)} pages into {output_root}")


if __name__ == "__main__":
    main()




