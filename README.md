# Irene & Alberto - Lista Regalo Viaggio di Nozze# Irene & Alberto - Lista Regalo Viaggio di Nozze# Supabase CLI



Website for Irene & Alberto's wedding gift list for their honeymoon trip to South America.



## Project StructureWebsite for Irene & Alberto's wedding gift list for their honeymoon trip to South America.[![Coverage Status](https://coveralls.io/repos/github/supabase/cli/badge.svg?branch=main)](https://coveralls.io/github/supabase/cli?branch=main) [![Bitbucket Pipelines](https://img.shields.io/bitbucket/pipelines/supabase-cli/setup-cli/master?style=flat-square&label=Bitbucket%20Canary)](https://bitbucket.org/supabase-cli/setup-cli/pipelines) [![Gitlab Pipeline Status](https://img.shields.io/gitlab/pipeline-status/sweatybridge%2Fsetup-cli?label=Gitlab%20Canary)



```](https://gitlab.com/sweatybridge/setup-cli/-/pipelines)

├── index.html              # Main wedding gift list page

├── script.js               # Frontend logic and Supabase integration## Project Structure

├── styles.css              # Styling

├── supabase-client.js      # Supabase client configuration[Supabase](https://supabase.io) is an open source Firebase alternative. We're building the features of Firebase using enterprise-grade open source tools.

├── favicon.svg             # Site favicon

├── CITTA.png              # City illustration```

├── NOMI.png               # Names illustration

├── experience-images/      # Images for experiences├── index.html              # Main wedding gift list pageThis repository contains all the functionality for Supabase CLI.

├── requirements/           # Original requirements and data

├── build.sh               # Build script for deployment├── script.js               # Frontend logic and Supabase integration

└── supabase/              # Supabase configuration and functions

    ├── schema.sql          # Database schema├── styles.css              # Styling- [x] Running Supabase locally

    ├── seed.sql            # Initial data

    └── functions/├── supabase-client.js      # Supabase client configuration- [x] Managing database migrations

        └── send-order-emails/  # Edge function for sending emails

```├── favicon.svg             # Site favicon- [x] Creating and deploying Supabase Functions



## Tech Stack├── CITTA.png              # City illustration- [x] Generating types directly from your database schema



- **Frontend**: Vanilla HTML, CSS, JavaScript├── NOMI.png               # Names illustration- [x] Making authenticated HTTP requests to [Management API](https://supabase.com/docs/reference/api/introduction)

- **Backend**: Supabase (PostgreSQL database, Edge Functions)

- **Email**: Resend API├── experience-images/      # Images for experiences

- **Hosting**: Static site (Netlify recommended)

├── requirements/           # Original requirements and data## Getting started

## Features

└── supabase/              # Supabase configuration and functions

- Browse wedding gift experiences

- Add experiences to cart    ├── schema.sql          # Database schema### Install the CLI

- Generate unique session codes

- Email notifications (admin + guest)    ├── seed.sql            # Initial data

- Bank transfer payment instructions

- Responsive design    └── functions/Available via [NPM](https://www.npmjs.com) as dev dependency. To install:



## Development        └── send-order-emails/  # Edge function for sending emails



1. Open `index.html` in a browser or use a local server``````bash

2. The site connects directly to Supabase (no build step required)

npm i supabase --save-dev

## Deployment

## Tech Stack```

### Build for Production



Run the build script to create a `dist/` folder with all production files:

- **Frontend**: Vanilla HTML, CSS, JavaScriptTo install the beta release channel:

```bash

./build.sh- **Backend**: Supabase (PostgreSQL database, Edge Functions)

```

- **Email**: Resend API```bash

This will copy all necessary files to the `dist/` folder, ready for deployment.

- **Hosting**: Static site (can be hosted on any static hosting service)npm i supabase@beta --save-dev

### Deploy to Netlify

```

1. Run `./build.sh` to create the `dist/` folder

2. Go to [app.netlify.com](https://app.netlify.com)## Features

3. Drag & drop the `dist/` folder to deploy

4. Your site will be live in seconds!When installing with yarn 4, you need to disable experimental fetch with the following nodejs config.



Alternatively, you can connect your Git repository to Netlify for automatic deployments.- Browse wedding gift experiences



## Supabase Setup- Add experiences to cart```



The database schema and edge functions are managed in the `supabase/` directory.- Generate unique session codesNODE_OPTIONS=--no-experimental-fetch yarn add supabase



### Deploy Edge Function- Email notifications (admin + guest)```



```bash- Bank transfer payment instructions

supabase functions deploy send-order-emails

```- Responsive design> **Note**



### Environment Variables (Supabase Secrets)For Bun versions below v1.0.17, you must add `supabase` as a [trusted dependency](https://bun.sh/guides/install/trusted) before running `bun add -D supabase`.



Required secrets for the edge function:## Supabase Setup



```bash<details>

supabase secrets set RESEND_API_KEY=your_resend_api_key

supabase secrets set ADMIN_EMAIL=your_admin_emailThe database schema and edge functions are managed in the `supabase/` directory.  <summary><b>macOS</b></summary>

supabase secrets set FROM_EMAIL=your_from_email

```



- `RESEND_API_KEY` - Resend API key for sending emails### Deploy Edge Function  Available via [Homebrew](https://brew.sh). To install:

- `ADMIN_EMAIL` - Admin email address to receive notifications

- `FROM_EMAIL` - Sender email address for outgoing emails```bash



## Wedding Detailssupabase functions deploy send-order-emails  ```sh



**Date**: December 6, 2025  ```  brew install supabase/tap/supabase

**Destination**: South America (Chile, Argentina, Brazil)

  ```

### Environment Variables (Supabase Secrets)

- `RESEND_API_KEY` - Resend API key for sending emails  To install the beta release channel:

- `ADMIN_EMAIL` - Admin email address  

- `FROM_EMAIL` - Sender email address  ```sh

  brew install supabase/tap/supabase-beta

## Development  brew link --overwrite supabase-beta

  ```

1. Open `index.html` in a browser or use a local server  

2. The site connects directly to Supabase (no build step required)  To upgrade:



## License  ```sh

  brew upgrade supabase

See [LICENSE](LICENSE) file.  ```

</details>

## Wedding Details

<details>

**Date**: December 6, 2025    <summary><b>Windows</b></summary>

**Destination**: South America (Chile, Argentina, Brazil)

  Available via [Scoop](https://scoop.sh). To install:

  ```powershell
  scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
  scoop install supabase
  ```

  To upgrade:

  ```powershell
  scoop update supabase
  ```
</details>

<details>
  <summary><b>Linux</b></summary>

  Available via [Homebrew](https://brew.sh) and Linux packages.

  #### via Homebrew

  To install:

  ```sh
  brew install supabase/tap/supabase
  ```

  To upgrade:

  ```sh
  brew upgrade supabase
  ```

  #### via Linux packages

  Linux packages are provided in [Releases](https://github.com/supabase/cli/releases). To install, download the `.apk`/`.deb`/`.rpm`/`.pkg.tar.zst` file depending on your package manager and run the respective commands.

  ```sh
  sudo apk add --allow-untrusted <...>.apk
  ```

  ```sh
  sudo dpkg -i <...>.deb
  ```

  ```sh
  sudo rpm -i <...>.rpm
  ```

  ```sh
  sudo pacman -U <...>.pkg.tar.zst
  ```
</details>

<details>
  <summary><b>Other Platforms</b></summary>

  You can also install the CLI via [go modules](https://go.dev/ref/mod#go-install) without the help of package managers.

  ```sh
  go install github.com/supabase/cli@latest
  ```

  Add a symlink to the binary in `$PATH` for easier access:

  ```sh
  ln -s "$(go env GOPATH)/bin/cli" /usr/bin/supabase
  ```

  This works on other non-standard Linux distros.
</details>

<details>
  <summary><b>Community Maintained Packages</b></summary>

  Available via [pkgx](https://pkgx.sh/). Package script [here](https://github.com/pkgxdev/pantry/blob/main/projects/supabase.com/cli/package.yml).
  To install in your working directory:

  ```bash
  pkgx install supabase
  ```

  Available via [Nixpkgs](https://nixos.org/). Package script [here](https://github.com/NixOS/nixpkgs/blob/master/pkgs/development/tools/supabase-cli/default.nix).
</details>

### Run the CLI

```bash
supabase bootstrap
```

Or using npx:

```bash
npx supabase bootstrap
```

The bootstrap command will guide you through the process of setting up a Supabase project using one of the [starter](https://github.com/supabase-community/supabase-samples/blob/main/samples.json) templates.

## Docs

Command & config reference can be found [here](https://supabase.com/docs/reference/cli/about).

## Breaking changes

We follow semantic versioning for changes that directly impact CLI commands, flags, and configurations.

However, due to dependencies on other service images, we cannot guarantee that schema migrations, seed.sql, and generated types will always work for the same CLI major version. If you need such guarantees, we encourage you to pin a specific version of CLI in package.json.

## Developing

To run from source:

```sh
# Go >= 1.22
go run . help
```
