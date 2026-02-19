# GitHub Pages Configuration

This repository is configured for GitHub Pages deployment.

## Deployment Status

- **Source**: `main` branch, `/docs` folder
- **URL**: https://hsph-bst236-2026.github.io/homework-1-nuoding123/

## Manual Configuration Steps

If the Pages setting is not visible in the GitHub web interface, follow these steps:

### Option 1: Contact Repository Owner
Since this is an organization repository, the organization owner or administrator needs to:
1. Go to: https://github.com/hsph-bst236-2026/homework-1-nuoding123
2. Click Settings → Pages
3. Set Source to: Deploy from a branch
4. Select Branch: main
5. Select Folder: /docs
6. Click Save

### Option 2: Check Your Permissions
- Verify you are a member of the `hsph-bst236-2026` organization
- Request Administrator access if needed
- Then follow Option 1

### Option 3: Use Alternative Method
If the web interface is not accessible:
1. Ensure all files are committed and pushed to `main` branch
2. Create a `.github/workflows/pages-deploy.yml` file for automatic deployment
3. The pages should deploy automatically

## Verification

Once configured, test the deployment at:
- Homepage: https://hsph-bst236-2026.github.io/homework-1-nuoding123/
- Game: https://hsph-bst236-2026.github.io/homework-1-nuoding123/game/
- Papers: https://hsph-bst236-2026.github.io/homework-1-nuoding123/papers/

## Troubleshooting

**Pages settings page shows 404:**
- This usually means the repository is private or you don't have permission
- Contact the repository owner to enable Pages for the organization

**Website doesn't load after configuration:**
- Wait 1-2 minutes for GitHub to build and deploy
- Check that `/docs` folder contains `index.html`
- Verify all files were pushed to the `main` branch

**CNAME or custom domain issues:**
- This repository uses the default GitHub Pages URL
- No custom CNAME configuration is needed
