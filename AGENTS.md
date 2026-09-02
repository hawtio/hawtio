# AGENTS.md

Guidelines for AI coding agents working on this repository.

## Project Info

- Primary language: Java (backend), TypeScript + React (frontend)
- Build tool: Maven (backend), Yarn v4 + Webpack (frontend)
- Java version: 17 / 21 / 25 (all supported; CI tests against each)
- Node.js version: v22 (managed by `frontend-maven-plugin`)
- UI framework: [PatternFly v6](https://www.patternfly.org/)
- Commit style: [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) (`feat:`, `fix:`, `chore:`, etc.)

## Project Structure

This repository assembles the standalone Hawtio distribution by combining the React frontend from [hawtio/hawtio-react](https://github.com/hawtio/hawtio-react) with a Java backend. Changes to the UI must be made in that repo and published as a new `@hawtio/react` npm package before being consumed here.

```text
.
├── console/              # full console assembly — bundles @hawtio/react into static assets for hawtio-war
├── console-minimal/      # minimal variant for hawtio-war-minimal
├── hawtio-system/        # core Java backend (servlet filters, proxy, auth, JVM utilities)
├── hawtio-war/           # final WAR (full)
├── hawtio-war-minimal/   # final WAR (minimal)
├── platforms/            # Spring Boot 3/4, Quarkus, Jetty security integrations
├── plugins/              # optional Java-side plugins (connect, local-jvm-mbean, log)
├── deploy/               # WAR overlays (hawtio-default, hawtio-embedded)
├── hawtio-jbang/         # JBang launcher
├── bom/                  # Bill of Materials
├── examples/             # runnable Spring Boot / Quarkus examples
└── tests/                # E2E test suite
```

## Documentation Index

Read these documents **only when the task requires it** — do not load them all upfront.

| Document | When to read |
| --- | --- |
| [`README.md`](README.md) | Project overview, get-started guide |
| [`RELEASING.md`](RELEASING.md) | Release procedure and versioning policy |
| [`console/README.md`](console/README.md) | Frontend build setup, local `@hawtio/react` development via `yarn link` |
| [`tests/README.md`](tests/README.md) | E2E test suite overview |
| [`tests/README-test.md`](tests/README-test.md) | Running E2E tests locally |

## Essential Commands

```bash
# Build and test the main code
mvn install

# Faster build (skip frontend build and tests)
mvn install -Pfastinstall
```

## Testing

- Unit tests: run automatically with `mvn install`.
- E2E tests: see [`tests/README.md`](tests/README.md) and [`tests/README-test.md`](tests/README-test.md) — setup is non-trivial; read those documents before attempting to run them.

## Code Style

See [`.editorconfig`](.editorconfig).
