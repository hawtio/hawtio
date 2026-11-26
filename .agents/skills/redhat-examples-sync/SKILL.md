---
name: redhat-examples-sync
description: Use when the user wants to sync the `examples/` directory of the hawtio repository (`4.x-redhat` branch) to the standalone `hawtio-examples` repository before or after a HawtIO product release (e.g. "sync examples", "examples -> hawtio-examples sync", "Apply changes to examples from HawtIO 4.5"). Walks through the file-level diff, the pom.xml conversions, sample-plugin and yarn handling, README version updates, and verification.
metadata:
  disable-model-invocation: true
  argument-hint: '[release e.g. 4.5]'
---

# Hawtio `examples/` -> `hawtio-examples` sync

[`hawtio-examples`](https://github.com/jboss-fuse/hawtio-examples) is the repository that is provided to users.
`examples/` in the `hawtio` repository (`4.x-redhat` branch) is the intermediate source: it is maintained there so that
fixes from upstream `main` can be cherry-picked easily. The two git histories are completely independent, so the sync
is done **at file level**: diff the files and copy from the source to the target. Do it before and/or after each HawtIO
product release.

- Source: `examples/` of the `hawtio` repository (each sample directly under `examples/`).
- Target: the `hawtio-examples` repository (each sample at the top level).

The commands below assume that the target is cloned as a sibling directory of the `hawtio` clone (i.e. `../hawtio-examples`
from the `hawtio` root) and are run from the **parent directory of both clones**, written as `hawtio/` and
`hawtio-examples/`. If the target is cloned elsewhere, ask the user for its location and adjust the paths. Likewise,
`convert_poms.py` locates the target as `../hawtio-examples` relative to the `hawtio` root. If the user's clone has a
different name or location, ask first.

Maven needs to resolve the product BOM and plugins (`hawtio-bom`, Quarkus, Camel Spring Boot). Use the default
Maven settings (`~/.m2/settings.xml`), which are expected to be configured with the required repositories. Pass a
different settings file (`mvn -s <file>`) only if the user tells you to. If resolution fails, report the error to
the user.

Differences are essentially the folder layout and the paths that follow from it. The known intentional differences
are listed under "Known intentional differences"; everything else must be identical after the sync.

## Ground rules

- Do not add version properties to the target root `pom.xml` that it does not already have. Sync the values of the
  properties that exist in both; adapt the sample poms instead (Step 3).
- Do not commit or push unless the user says so. Never bypass commit hooks (`--no-verify` etc.); if a hook blocks the
  commit, report the reason to the user and let them resolve it.
- Treat staged changes that the user prepared in `hawtio-examples` before the sync (e.g. `hawtio-version`, yarn
  upgrade) as intentional. Run `git status` and `git diff --cached` first, and keep them.

## Step 1 — Survey

1. Check that both repos are on the intended branches and note the target's staged changes:

   ```bash
   git -C hawtio branch --show-current       # 4.x-redhat
   git -C hawtio-examples status --short
   git -C hawtio-examples diff --cached --stat
   ```

2. Read how the previous sync was done: `git -C hawtio-examples log --oneline -15` and
   `git -C hawtio-examples show --stat <hash of "Apply changes to examples from HawtIO <prev>">`. Follow the same
   conventions (commit message style, which files are touched).
3. Get the file-level overview. Compare **tracked source files**, which avoids `target/`, `node_modules/` and IDE files:

   ```bash
   git -C hawtio ls-files examples | sed 's#^examples/##' | grep -v '/pom.xml$' | while read f; do
     if [ -f "hawtio-examples/$f" ]; then cmp -s "hawtio/examples/$f" "hawtio-examples/$f" || echo "DIFF $f"
     else echo "NEW  $f"; fi; done
   ```

   Do not run a plain `diff -r` / `grep -r` over the whole tree: `node_modules` and `target` make it time out.
4. List new and removed samples: compare directories that contain a `pom.xml` in the source with the `<modules>` of the
   target root `pom.xml`.
5. Create a todo list for the steps below.

## Step 2 — Root `pom.xml` of the target

Edit `hawtio-examples/pom.xml` by hand (it differs structurally from the source root `pom.xml`):

- Version: set to `<release>.0-SNAPSHOT`, e.g. `4.5.0-SNAPSHOT`. Do it for all modules in one go, see Step 4.
- Properties: compare each `<...-version>` key of the target with the source `hawtio/pom.xml`
  (the loop below) and update the values of keys that exist in both. Edit the file by hand (`apply_diff` etc.).

  ```bash
  for k in $(grep -oE '<[a-z0-9.-]+-version>' hawtio-examples/pom.xml | tr -d '<>' | sort -u); do
    t=$(grep -m1 "<$k>" hawtio-examples/pom.xml | sed -E 's/.*>([^<]*)<.*/\1/')
    s=$(grep -m1 "<$k>" hawtio/pom.xml | sed -E 's/.*>([^<]*)<.*/\1/')
    [ "$t" != "$s" ] && echo "$k: target=$t source=${s:-<none>}"; done
  ```

  - `spring-boot4-version`: the name is **`spring-boot4-version`** in both (not `spring-boot-version`).
  - Do not touch the product values: `hawtio-version`, `jolokia-integration-version`, `quarkus-version`,
    `camel-spring-boot-version`. These are decided for the product release, not by the source.
  - If a value differs but the history suggests a stale leftover, check before changing it:
    `git log -G'<key>' -- pom.xml` in both repos (e.g. `junit5-version` was once 6.0.0 in the source, was reverted to
    5.14.x there, and was left behind in the target).
  - Keys that exist only in the source (e.g. `spring7-version`, `commons-codec-version`) are **not added**.
- Modules: add the new samples to `<modules>` (alphabetical), remove deleted ones.

## Step 3 — Sample poms

`convert_poms.py` in this skill directory copies each `examples/*/pom.xml` with the conversions applied, and can
verify the result with `--check`:

```bash
python3 hawtio/.agents/skills/redhat-examples-sync/convert_poms.py <release>.0-SNAPSHOT          # write
python3 hawtio/.agents/skills/redhat-examples-sync/convert_poms.py <release>.0-SNAPSHOT --check  # verify
```

Conversions it applies (source -> target):

- `<parent>`: `io.hawt:project:<snapshot>` with `relativePath` -> `io.hawt.examples:hawtio-examples:<release>.0-SNAPSHOT`.
- `${project.version}` of `io.hawt` artifacts -> `${hawtio-version}`.
- Remove the `spring-framework-bom` import and the `commons-codec` override (they need properties that the target
  root pom does not have).
- Remove the `hawtio-quarkus-deployment` test dependency (it only exists for the reactor build order in `hawtio`).

It skips `sample-plugin`. Update `sample-plugin/pom.xml` by hand: only the parent version (and anything else that
changed in the source). Keep the target-only `yarn npm audit` execution.

After the script, check the output has no warnings and that no `${spring7-version}` / `${commons-codec-version}` /
`${spring-boot-version}` reference is left. If the source pom got a **new kind of difference** (a new property, a new
dependency that only exists in the product BOM...), do not guess: show the diff to the user and extend the script.

## Step 4 — Version bump of the modules

Bump the project version of the parent and all modules with Maven, not by hand:

```bash
cd hawtio-examples
mvn -B -q org.codehaus.mojo:versions-maven-plugin:2.18.0:set \
  -DnewVersion=<release>.0-SNAPSHOT -DgenerateBackupPoms=false -DprocessAllModules=true
```

The reactor must be resolvable for this (the target root pom already has the new modules and `hawtio-version`). If it
cannot be resolved, fall back to editing the version in the root pom and the `sample-plugin` parent only, since the
other samples inherit it.

## Step 5 — Other files

Copy every other changed file from the source (Java, resources, `jolokia-access.xml`, `hawtconfig.json`, `app.css`,
banners, `application.properties`, READMEs, and the whole directory of a new sample). Use `rsync`, which preserves the
layout and skips build outputs:

```bash
rsync -a --checksum \
  --exclude=pom.xml --exclude='*.iml' --exclude=.project --exclude=.classpath --exclude=.settings \
  --exclude=target --exclude=node_modules --exclude=build --exclude=.yarn --exclude=node --exclude=.idea \
  --exclude=.DS_Store --exclude='sample-plugin/' --exclude=camel-jbang/README.md \
  hawtio/examples/ hawtio-examples/
```

Notes:

- `sample-plugin/` and `camel-jbang/README.md` are excluded because they have intentional differences (below).
  Handle them as described in the `sample-plugin` section and "README versions".
- Run the rsync **without `-n` only after** a dry run (`-avn`) that the user can review when something looks
  unexpected. Remove untracked build output that slipped in (`git status --short -uall`).
- Deleted files in the source are not removed by rsync. Detect them with the file-level loop of Step 1 (reverse
  direction) and remove them in the target.

### `sample-plugin`

- Copy `package.json`, `tsconfig.json`, `webpack.config.cjs`, `yarn.lock` from the source.
- Keep the target's `.yarnrc.yml` intentional differences (see below), but take any other new setting from the source.
- `packageManager` in `package.json` must equal the yarn version of the target's `.yarn/releases` (see "yarn").
- Verify the lock file with the target's yarn: `cd sample-plugin && node ../.yarn/releases/yarn-<ver>.cjs install --immutable`.
  Remove `node_modules` first if a previous install was interrupted.

### yarn

- The source keeps `.yarn/releases` at the root of the `hawtio` repository (`yarnPath: ../../.yarn/releases/...` in
  `sample-plugin`); the target has it at the root of `hawtio-examples` (`yarnPath: ../.yarn/releases/...`). The yarn
  versions of the two can differ.
- To upgrade yarn in the target, do it the standard way (do not copy the 3.7 MB `.cjs` by hand):
  `cd hawtio-examples/sample-plugin && node ../.yarn/releases/yarn-<current>.cjs set version stable`.
  The command writes the release into `sample-plugin/.yarn/releases/` and sets `yarnPath: .yarn/releases/...`. Move the
  file to `hawtio-examples/.yarn/releases/`, delete the old release (`git rm`), and fix `yarnPath` back to
  `../.yarn/releases/...`. Then re-run `yarn install --immutable`.

### README versions

- `camel-jbang/README.md`: `camel hawtio --version=<product version>`, e.g. `4.5.0.redhat-00005` (the target uses the
  product version, the source the community version).
- `quarkus/README.md` image tag: `quay.io/hawtio/hawtio-example-quarkus:<release>`; the sources already carry it.
- Root `README.md` of the target: the list of samples. Add new samples (name, link, one-line description that equals the
  sample README's intro) and keep the Spring Boot major version wording in sync with the sample READMEs.

## Step 6 — Source-side fixes first

If the sync reveals something that is wrong **in the source** (e.g. READMEs still saying "Spring Boot 3"), fix it in
`hawtio/examples` first, commit it on `4.x-redhat` (with the Jira key the user gives), then copy it again to the
target. The two sides must not diverge by hand edits on the target.

## Step 7 — Verify

1. `convert_poms.py ... --check` -> all `identical`.
2. File-level loop of Step 1 -> only the "Known intentional differences" remain.
3. Build everything, including the frontend of `sample-plugin` (do not use `-Pfastinstall`):

   ```bash
   cd hawtio-examples && mvn -B install -DskipTests
   ```

   The first run may take minutes (yarn install, Quarkus builds); run it in the background and poll the log.
   If `clean` fails on `sample-plugin/node_modules` or `yarn install` fails with a `While cloning ... ENOENT`, delete
   `sample-plugin/node_modules`, `build` and `target` and run again without `clean`.
4. Check that no build output is staged: `git diff --cached --name-only | grep -E '/target/|node_modules|\.iml$|/build/'`.
5. Report the result: what was synced, what was converted, what was left, open questions.

## Step 8 — Commit (only when the user says so)

- Message: follow the previous sync, `fix: HAWNG-xxxx Apply changes to examples from HawtIO <release>` (ask for the
  Jira key). The product-version-only commit style (`... Update HawtIO version to <ver>`) is used for `hawtio-version`
  bumps.
- Do not push.

## Known intentional differences (target vs source)

- Root `pom.xml`: the whole file is target-specific. `hawtio-version` and `jolokia-integration-version` carry product
  versions; version properties that only exist in the source are absent.
- Sample poms: the conversions of Step 3. `sample-plugin/pom.xml`: parent and the target-only `yarn npm audit` execution.
- `camel-jbang/README.md`: product version in `--version=`.
- `sample-plugin/.yarnrc.yml`: `cacheFolder: ../.yarn/cache`, `yarnPath: ../.yarn/releases/...`, and
  `npmMinimalAgeGate: 0` (the source uses `2d`).
- `sample-plugin/package.json`: `packageManager` follows the yarn release in the target (may be newer than the source).
- Target-only files: `.github/`, `.editorconfig`, `.gitignore`, `LICENSE`, root `README.md`, root `pom.xml`, `.yarn/`.
- IDE files (`.idea`, `*.iml`, `.project`, `.classpath`) are not synced.
