---
name: upstream-redhat-sync
description: Use when the user wants to sync commits from the upstream `main` branch to the `4.x-redhat` branch in the hawtio repository (the periodic "5x sync" / "4x sync", e.g. "Q4-2 sync", "main -> 4.x-redhat sync"). Walks through listing the commits since the last sync merge, reviewing and cherry-picking them one by one, resolving known conflicts, verifying, and opening the PR. Not for backports to `4.*.x-redhat` patch branches.
metadata:
  disable-model-invocation: true
  argument-hint: '[sync-name e.g. 2026Q4-2]'
---

# Hawtio upstream (`main`) -> `4.x-redhat` sync

Periodic sync of commits from `main` (the upstream, next community release) to `4.x-redhat` (the next Red Hat
product release). See "Branch Strategy" in `AGENTS.md`. The sync is done by **cherry-picking**, one commit at a
time, with the user approving each one.

This is only for `main` -> `4.x-redhat`. Backports to `4.*.x-redhat` patch branches are a different, case-by-case
workflow and are out of scope.

## Ground rules

- **Never batch cherry-pick.** Cherry-pick one commit at a time, and always explain the commit (hash, title,
  files, a proposed verdict) before running `git cherry-pick`. After it, report the new hash and show the next
  candidate. The user's approval is required for every cherry-pick, but avoid asking twice (see Step 3).
- Use `git cherry-pick -x` so the original hash is recorded in the message. The final cross-check relies on it.
- Keep the **original author and title**. Do not squash or reword.
- Do not push or open the PR until the user says so.

## Step 1 — Set up

1. Check the remote layout with `git remote -v`. Remote names differ per developer, so this document uses
   the following placeholder names. Map them to the actual remotes in the user's clone (ask if unclear):
   - `upstream` = the remote pointing to `hawtio/hawtio`, which hosts both `main` and `4.x-redhat`.
   - `origin` = the remote pointing to the user's own fork of `hawtio/hawtio`, where the working branch is pushed.

   Other remotes (e.g. internal mirrors) are not used. Run `git fetch upstream`.
2. Make sure both local `main` and `4.x-redhat` are up to date with `upstream/main` and
   `upstream/4.x-redhat` (Step 2 lists commits from local `main`, and the working branch is created from
   local `4.x-redhat`).
3. Create the working branch from `4.x-redhat`, named `5x-sync-<sync-name>`, e.g. `5x-sync-2026Q4-2`.
   Check that `git status` is clean first.

   `<sync-name>` is `<YYYY>Q<quarter>-<n>`, where `<n>` is a sequence number that restarts at 1 each quarter.
   Use `$ARGUMENTS` if given. Otherwise, propose one and let the user confirm or change it:

   - Take `<YYYY>Q<quarter>` from today's date (`date +%Y-%m`; Jan-Mar = Q1, Apr-Jun = Q2, Jul-Sep = Q3,
     Oct-Dec = Q4).
   - Find the previous syncs of that quarter from the merged sync PRs and the existing branches:

     ```bash
     git log --first-parent --merges --grep='sync-' --format='%s' upstream/4.x-redhat -10
     git branch -a --list '*5x-sync-*'
     ```

   - `<n>` = (highest `<n>` already used for that quarter) + 1, or 1 if there is none.

## Step 2 — Find the sync range

`main` and `4.x-redhat` have unrelated histories for most commits, so **`git cherry` does not work**
(it reports hundreds of old commits as missing). Do not use it, and do not compare by commit title over a
long period.

Instead, treat everything up to the **last sync merge** as already synced:

```bash
# last sync PR merges on 4.x-redhat
git log --first-parent --merges --grep='sync-' --format='%h %cI %s' 4.x-redhat -3
```

List the candidates on `main` after that moment, oldest first:

```bash
git log --no-merges --reverse --topo-order --format='%h %cd %an %s' \
  --date=format:'%m-%d %H:%M' --since='<committer date of the last sync merge>' main
```

Notes:

- Use the **committer date of the sync merge commit** as `--since`. Commits from `main` that were taken by the
  previous sync were all older than that moment.
- `--topo-order` keeps follow-up fixes after the commit they fix.
- Save the list (e.g. `/tmp/cand.txt`) for the cross-check in Step 5.
- Tell the user the number of candidates and the range before starting.

## Step 3 — Review and cherry-pick, one by one

For each candidate, in order:

1. Inspect it: `git show --stat <hash>`, and the diff when the title is not enough.
2. Present to the user: `N/total`, hash, title, author/date, changed files, and a verdict with the reason.
3. Then, depending on the verdict:
   - **Take (recommended):** in the same turn, right after the explanation, run `git cherry-pick -x <hash>`
     as a tool call, so the command approval prompt is the user's only confirmation. Do not ask a separate
     "OK to proceed?" question in text first; that forces the user to answer twice.
   - **Skip, or unsure:** do not run any command. Ask the user in text and wait for the answer. Cherry-pick
     only if the user decides to take it, otherwise move on to the next candidate.
4. Report the result and the new hash, then present the next candidate.

If a candidate is closely related to a later one (e.g. a follow-up fix of the previous commit, or a bump that a
later commit overwrites), say so, because the order matters.

### Skip criteria

What to **skip**:

- **Spring Boot / Camel Spring Boot (CSB) and Quarkus / Camel Quarkus (CQ) dependency version updates.**
  The upstream (`main`) and the product (`4.x-redhat`) use different versions and coordinates,
  e.g. `spring-boot4-version`, `spring7-version`, `quarkus-version`, `camel-spring-boot-bom`. Typically
  dependabot bumps, "upgrade to Spring Boot/Quarkus x.y" commits, and the product-side
  `HAWNG-xxxx Update to CSB/CQ` commits that exist only on `4.x-redhat`.
- **Branding settings and assets.** `4.x-redhat` carries its own Red Hat branding, so do not overwrite it with
  `main`'s. This covers, in `console`, `console-minimal`, `examples/*` and `tests/*`:
  - `hawtconfig.json` (`public/` in the consoles, `src/main/resources/**/hawtio*/` in the examples and tests),
  - logos, background images and favicons (`public/img/*`, `public/favicon.ico`),
  - branding stylesheets (`public/css/branding-*.css`, `css/app.css` of the examples and tests).

  If the commit also contains other changes, take it and keep our side of the branding hunks (see Step 4).
  If it is unclear whether something is branding, show the diff and ask the user.
- Anything that does not apply to `4.x-redhat`:
  - The same change already exists in `4.x-redhat`. Check by diffing the touched files against `HEAD`,
    not by title.
  - The touched file does not exist in `4.x-redhat` (e.g. `.github/workflows/image.yml`, deleted there in 2023).
  - `main`'s release commits (`[maven-release-plugin] prepare release ...`, `prepare for next development
iteration`). `4.x-redhat` has its own versioning (`4.x.y-SNAPSHOT`).
  - A bump whose target is already satisfied in `4.x-redhat` (e.g. a `package.json` range bump for a package
    that `4.x-redhat`'s lock file already resolves to a newer version; taking it would roll the lock file back).

What to **take** — the exclusions are _only_ about dependency versions and coordinates, and branding:

- Java code changes, even in `platforms/springboot*` and `platforms/quarkus`.
- Configuration changes that do not involve versions or POM coordinates, even in Spring Boot / Quarkus
  examples and tests (`application.properties`, `jolokia-access.xml`, etc.).
- Everything else: npm dependency updates, Maven plugin and test-library bumps (jetty, jolokia, caffeine,
  gson, ...), frontend, build, CI, e2e changes.
- A commit that mixes both: take it, and drop only the Spring Boot / Quarkus _version_ hunks if they
  conflict with the product versions.

When unsure, show the diff and ask.

## Step 4 — Resolve conflicts

After a conflict, show the user the conflict and the resolution plan **before** `git add` / `--continue`.
After resolving, show the resulting `git diff HEAD` so the user can review it. Known cases:

- **`yarn.lock`** (`console`, `console-minimal`, `examples/sample-plugin`): do not merge the lock file by hand.
  Resolve `package.json` first (take the intended version bump), then restore our lock file
  (`git checkout --ours yarn.lock`) and regenerate it in that directory with `yarn install --mode=skip-build`.
  Check that `git diff HEAD -- yarn.lock` only contains the packages the commit is about, and that
  `yarn install --mode=skip-build --immutable` passes.
- **Deleted workflow file** (`.github/workflows/image.yml`): modify/delete conflict. Resolve with
  `git rm` and continue; the other workflow files in the commit are kept.
- **Branding files** (see "Skip criteria", e.g. `hawtconfig.json`): `4.x-redhat` carries the Red Hat
  branding. Keep our side (`git checkout --ours <file>`), do not take `main`'s generic branding. Validate
  that `hawtconfig.json` is still valid JSON.
- **Versions in `pom.xml`**: `4.x-redhat` is `4.x.y-SNAPSHOT`; never take `main`'s `5.x` versions.
- Other: resolve by hand and explain what was kept from each side.

Never use `-X theirs` / `-X ours` for a whole cherry-pick.

## Step 5 — Verify

1. **Cross-check the list.** Compare the candidates against the `cherry picked from commit` lines of the
   commits on the branch, and present two bullet lists (taken / not taken) with the reason for each skip:

   ```bash
   git log upstream/4.x-redhat..HEAD --format=%b | grep 'cherry picked from commit'
   ```

   Every candidate must be either taken or explicitly skipped.

2. **Build.** Build everything, with the frontend and the tests, then build again with the `e2e` profile
   (tests skipped):

   ```bash
   mvn clean install && mvn clean install -Pe2e -DskipTests
   ```

   Do not use `-Pfastinstall`: it skips the frontend build, so the modules that depend on it fail to build.
   Builds are long; use a generous timeout or let the user run them and report back.

3. Check that no conflict markers remain: `git grep -n '<<<<<<<\|>>>>>>>'`.

## Step 6 — Push and PR

Only after the user says so.

1. Push the working branch to `origin` (the fork): `git push -u origin <branch>`.
2. Open the PR against `hawtio/hawtio`, base `4.x-redhat`, head `<fork-owner>:<branch>`, titled like
   `5x sync 2026Q4-2`:

   ```bash
   gh pr create --repo hawtio/hawtio --base 4.x-redhat --head <owner>:<branch> \
     --title "5x sync <name>" --body-file /tmp/pr-body.md
   ```

3. The PR body follows the previous ones (see the latest merged sync PR with
   `gh pr view <number> --repo hawtio/hawtio --json body`, e.g. #4779). Sections:
   - `Cherry-picks from main (<name>)` and the sync range.
   - **Skipped**, with a reason per commit. Group them: Spring Boot / Quarkus versions, and
     "not applicable to 4.x-redhat".
   - The taken commits, grouped by theme (security, UI/build, e2e, Java dependencies, npm dependencies).
   - **Conflict resolutions**, one line each.

After the PR is merged, its merge commit date is the starting point of the next sync (Step 2).
