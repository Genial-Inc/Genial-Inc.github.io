# Genial Inc. website

A bilingual French/English website for Genial Inc., a student collective from the Double Degree in Mathematics and Computer Science (DLMI) at INU Champollion.

## Development

The project uses [Hugo](https://gohugo.io/) and the `genial-theme` Git submodule. Use Hugo Extended **0.169.0** or a compatible newer release.

Clone the repository with its submodules:

```sh
git clone --recurse-submodules https://github.com/Genial-Inc/Genial-Inc.github.io.git
cd Genial-Inc.github.io
```

If you already cloned it without submodules:

```sh
git submodule update --init --recursive
```

Fetch the external project builds before previewing the website, then start the local development server:

```sh
./scripts/fetch-genial-bubble.sh
./scripts/fetch-contact-form.sh
hugo server
```

Build the website:

```sh
hugo --minify
```

French is the default language and is served at `/`. English is served under `/en/`.

## Translations

Content translations use Hugo's filename-based method: matching files such as `about-us.fr.md` and `about-us.en.md` are linked automatically. Interface strings live in `i18n/fr.toml` and `i18n/en.toml`. Keep both translations in sync when adding pages or interface labels.

The contact-form project is maintained separately in [edemit/lcamapp](https://github.com/edemit/lcamapp/tree/ergonomie), on the `ergonomie` branch. The deployment workflow clones that branch and copies its static website into `static/contact/`; generated files are not committed here. Fetch it locally with `./scripts/fetch-contact-form.sh` before running Hugo. The embedded experiment is served in the language provided by the upstream project.

## Deployment

GitHub Actions builds the site and deploys it to GitHub Pages when changes are pushed to `main`. Before running Hugo, it downloads the Genial Bubble web build into `static/play/genial-bubble/` and clones the `ergonomie` branch of `edemit/lcamapp` into `static/contact/`.

---

# Site Genial Inc.

Site bilingue français/anglais du collectif étudiant Genial Inc., composé d'étudiants de la double licence Mathématiques-Informatique (DLMI) de l'INU Champollion.

## Développement

Le projet utilise [Hugo](https://gohugo.io/) et le sous-module Git `genial-theme`. Utilisez Hugo Extended **0.169.0** ou une version compatible plus récente.

Clonez le dépôt avec ses sous-modules :

```sh
git clone --recurse-submodules https://github.com/Genial-Inc/Genial-Inc.github.io.git
cd Genial-Inc.github.io
```

Si le dépôt a déjà été cloné sans ses sous-modules :

```sh
git submodule update --init --recursive
```

Récupérez les versions web des projets externes avant de prévisualiser le site, puis lancez le serveur de développement :

```sh
./scripts/fetch-genial-bubble.sh
./scripts/fetch-contact-form.sh
hugo server
```

Construisez le site :

```sh
hugo --minify
```

Le français est la langue par défaut et est servi à la racine (`/`). L'anglais est servi sous `/en/`.

## Traductions

Les traductions utilisent le mécanisme Hugo fondé sur les noms de fichiers : les fichiers correspondants, comme `about-us.fr.md` et `about-us.en.md`, sont automatiquement associés. Les chaînes de l'interface sont définies dans `i18n/fr.toml` et `i18n/en.toml`. Toute nouvelle page ou chaîne d'interface doit être ajoutée dans les deux langues.

Le projet de formulaire de contact est maintenu séparément dans [edemit/lcamapp](https://github.com/edemit/lcamapp/tree/ergonomie), sur la branche `ergonomie`. Le workflow de déploiement clone cette branche et copie son site statique dans `static/contact/` ; les fichiers générés ne sont pas versionnés ici. Pour le récupérer localement, exécutez `./scripts/fetch-contact-form.sh` avant Hugo. Le formulaire intégré est servi dans la langue fournie par le dépôt source.

## Déploiement

GitHub Actions construit le site et le déploie sur GitHub Pages à chaque push sur `main`. Avant de lancer Hugo, il télécharge la version web de Genial Bubble dans `static/play/genial-bubble/` et clone la branche `ergonomie` de `edemit/lcamapp` dans `static/contact/`.
