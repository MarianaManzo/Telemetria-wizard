
  # Reglas y eventos (telemetría) (V1)

  This is a code bundle for Reglas y eventos (telemetría) (V1). The original project is available at https://www.figma.com/design/uMK263v296PQAo6ZZ9nBMO/Reglas-y-eventos--telemetr%C3%ADa---V1-.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.
  # Telemetria-wizard

## Deploying to GitHub Pages (CI)

This repository includes a GitHub Actions workflow that builds the project and deploys the `dist/` output to GitHub Pages when you push to the `main` branch.

Steps to enable:

1. In your repository settings on GitHub, go to "Pages" and make sure Pages is enabled. The action will publish to the repository `gh-pages` deployment automatically.
2. The workflow runs on pushes to `main` and uses `npm ci` + `npm run build` to generate `dist/` and then deploy it.

If you prefer a different provider (Netlify, Vercel, S3/CloudFront), see the deploy section in this README.
# Telemetria-wizard-xvisual
