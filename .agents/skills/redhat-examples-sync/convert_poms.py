#!/usr/bin/env python3
"""Copy examples/*/pom.xml of the hawtio repo to the hawtio-examples repo, applying
the conversions that the standalone hawtio-examples project needs.

Usage: convert_poms.py <hawtio-examples-version> [--check]

  <hawtio-examples-version>  e.g. 4.5.0-SNAPSHOT (the version of the hawtio-examples parent)
  --check                    do not write; report which poms differ from the converted source

Paths are resolved relative to this script, assuming the sibling layout:
  <workspace>/hawtio/.agents/skills/redhat-examples-sync/convert_poms.py
  <workspace>/hawtio/examples/
  <workspace>/hawtio-examples/

sample-plugin/pom.xml is NOT handled here: it carries a hawtio-examples-only
`yarn npm audit` execution and must be updated by hand (parent block + version only).
"""
import pathlib
import re
import sys

HERE = pathlib.Path(__file__).resolve()
SRC = HERE.parents[3] / 'examples'
DST = HERE.parents[4] / 'hawtio-examples'
SKIP = {'sample-plugin'}

PARENT_SRC = re.compile(
    r'<parent>\s*<groupId>io\.hawt</groupId>\s*<artifactId>project</artifactId>\s*'
    r'<version>[^<]+</version>\s*<relativePath>[^<]*</relativePath>\s*</parent>')

HAWT_VER = re.compile(
    r'(<groupId>io\.hawt</groupId>\s*<artifactId>[^<]+</artifactId>\s*)'
    r'<version>\$\{project\.version\}</version>')

# Import of spring-framework-bom (needs the spring7-version property, which hawtio-examples lacks)
SPRING_BOM = re.compile(
    r'[ \t]*<dependency>\s*<groupId>org\.springframework</groupId>\s*'
    r'<artifactId>spring-framework-bom</artifactId>.*?</dependency>\n', re.S)

# commons-codec override (needs commons-codec-version), with the optional leading comment
CODEC = re.compile(
    r'[ \t]*<dependency>\s*(?:<!--.*?-->\s*)?<groupId>commons-codec</groupId>\s*'
    r'<artifactId>commons-codec</artifactId>.*?</dependency>\n', re.S)

# hawtio-quarkus-deployment test dependency, only there for the reactor build order in hawtio
QDEPLOY = re.compile(
    r'(?:[ \t]*<!--[^>]*?Minimal test dependencies[^>]*?-->\n)?'
    r'[ \t]*<dependency>\s*<groupId>io\.hawt</groupId>\s*'
    r'<artifactId>hawtio-quarkus-deployment</artifactId>.*?</dependency>\n', re.S)


def convert(text, parent_version):
    parent = ('<parent>\n'
              '    <groupId>io.hawt.examples</groupId>\n'
              '    <artifactId>hawtio-examples</artifactId>\n'
              f'    <version>{parent_version}</version>\n'
              '  </parent>')
    text = PARENT_SRC.sub(parent, text)
    text = SPRING_BOM.sub('', text)
    text = CODEC.sub('', text)
    text = QDEPLOY.sub('', text)
    text = HAWT_VER.sub(r'\1<version>${hawtio-version}</version>', text)
    return text


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    check = '--check' in sys.argv
    if len(args) != 1:
        sys.exit(__doc__)
    version = args[0]
    if not DST.is_dir():
        sys.exit(f'target not found: {DST}')

    for d in sorted(p for p in SRC.iterdir() if (p / 'pom.xml').is_file() and p.name not in SKIP):
        new = convert((d / 'pom.xml').read_text(), version)
        out = DST / d.name / 'pom.xml'
        if check:
            same = out.is_file() and out.read_text() == new
            print(f'{d.name}: {"identical" if same else "DIFFERS"}')
        else:
            out.parent.mkdir(parents=True, exist_ok=True)
            out.write_text(new)
            print(f'{d.name}: written')

        # Properties that exist only in the hawtio root pom must not be referenced
        for prop in re.findall(r'\$\{([a-z0-9.-]+-version)\}', new):
            if prop in ('spring7-version', 'commons-codec-version'):
                print(f'  WARNING: {d.name} still references ${{{prop}}}')


if __name__ == '__main__':
    main()
