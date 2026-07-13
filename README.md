# Northstar Study Studio

A configurable summer study planner for a student entering Grade 9. It includes:

- a weighted subject spinner;
- six editable workstreams with block-sized starter lessons;
- 30- and 45-minute focus timers;
- local completion tracking; and
- a responsive layout for computers, tablets, and phones.

Planner changes are stored in the browser using `localStorage`. No account or database is required. Clearing the browser's site data will also clear customized subjects and progress.

The public source and starter content are intentionally school-neutral and contain no student profile. Users should not put names, school names, addresses, contact information, account details, or other sensitive information into task titles. Browser data is not committed to GitHub automatically, but it can still be seen by anyone using the same browser profile.

## Run locally

This project uses Node.js 22 and pnpm.

```bash
pnpm install
pnpm run dev
```

## Publish with GitHub Pages

The workflow in `.github/workflows/deploy-pages.yml` builds and publishes the site whenever the `main` branch is updated.

1. Create a GitHub repository and push this project to its `main` branch.
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, choose **GitHub Actions** as the source.
4. Run the workflow or push another change to `main`.

The build automatically handles both project URLs such as `username.github.io/repository-name` and root URLs such as `username.github.io`.
