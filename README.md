# Genial Inc. — site web / website

Site bilingue (français / anglais) de **Genial Inc.**, un collectif d'étudiants pour la plupart en
double licence Mathématiques-Informatique (DLMI) à l'INU Champollion. Construit avec [Hugo](https://gohugo.io/).

*Bilingual (French / English) website of Genial Inc., built with Hugo. English summary at the bottom.*

## Prérequis

- [Hugo](https://gohugo.io/installation/) **0.168 ou plus récent** (la CI utilise la 0.169.0, édition standard)
- Git

```sh
git clone --recurse-submodules https://github.com/Genial-Inc/Genial-Inc.github.io.git
cd Genial-Inc.github.io
# déjà cloné sans les sous-modules ?
git submodule update --init --recursive
```

## Développer en local

```sh
./scripts/fetch-external.sh   # facultatif : formulaire de contact + Genial Bubble
hugo server                   # http://localhost:1313/ (fr) et http://localhost:1313/en/ (en)
```

`scripts/fetch-external.sh` récupère ce qui ne fait **pas** partie de ce dépôt :

| Quoi | Source | Copié dans |
| --- | --- | --- |
| Formulaire de contact | [edemit/lcamapp](https://github.com/edemit/lcamapp/tree/ergonomie), branche `ergonomie`, dossier `contact/` | `static/contact/` |
| Genial Bubble (version web) | release `0.1` de [Genial-Inc/Genial-Bubble](https://github.com/Genial-Inc/Genial-Bubble) | `static/play/genial-bubble/` |

Ces dossiers sont ignorés par Git : ne les committez pas.

## Organisation

```text
config/_default/
  hugo.toml        réglages généraux et langues (fr par défaut à /, en à /en/)
  params.toml      paramètres communs (couleurs, logos, liens)
  params.fr.toml   textes de l'accueil en français (hero, présentation, team)
  params.en.toml   textes de l'accueil en anglais
  menus.toml       menu principal
content/
  _index.fr.md / _index.en.md          accueil
  about-us.fr.md / about-us.en.md      « Qui sommes-nous ? » / « About us »
  projects/<projet>/index.fr.md        un dossier par projet (page bundle)
  projects/<projet>/index.en.md
  projects/<projet>/cover.png          image du projet (convertie en WebP au build)
i18n/fr.toml, i18n/en.toml             libellés du menu
themes/genial-theme/                   thème (sous-module Git, dépôt Genial-Inc/genial-theme)
scripts/fetch-external.sh              récupération des contenus externes
```

## Traduire

- **Pages** : chaque page existe en deux fichiers, `nom.fr.md` et `nom.en.md` (traduction par nom de fichier).
  Une page sans traduction reste accessible ; le sélecteur de langue renvoie alors vers l'accueil de l'autre langue.
- **Accueil** : `config/_default/params.fr.toml` et `params.en.toml` ont la même structure ; modifiez les deux.
- **Menu** : libellés dans `i18n/*.toml` (clé = `identifier` de `menus.toml`).
- **Interface du thème** (boutons, pied de page…) : `themes/genial-theme/i18n/*.toml`. Pour changer un libellé
  sans toucher au thème, redéfinissez la même clé dans `i18n/*.toml`.

Pour repérer les libellés non traduits : `hugo build --printI18nWarnings`.

## Ajouter un projet

```sh
hugo new content projects/mon-projet
```

Crée `content/projects/mon-projet/index.fr.md` et `index.en.md` (en brouillon, `draft: true`).
Remplissez les champs (`description`, `params.event`, `params.play`, `params.source`, `params.link`,
`params.coverAlt`), ajoutez une image `cover.png` ou `cover.jpg` dans le dossier, puis passez `draft` à `false`.
Les projets apparaissent automatiquement sur l'accueil, la page Projets et le pied de page.

## Déploiement

Le workflow `.github/workflows/hugo.yml` :

- sur un **push sur `main`** : récupère les contenus externes, construit le site et le déploie sur GitHub Pages ;
- sur une **pull request** : construit seulement, pour vérifier que rien n'est cassé ;
- via **Actions → Run workflow** : redéploie à la main (par exemple pour publier une nouvelle version du formulaire de contact).

Le thème étant un sous-module, une modification du thème se fait dans `themes/genial-theme` (commit + push
dans le dépôt du thème), puis on committe le nouveau pointeur du sous-module ici.

---

## English summary

- Requirements: Hugo **0.168+** (CI uses 0.169.0, standard edition) and Git; clone with `--recurse-submodules`.
- Local preview: `./scripts/fetch-external.sh` (optional, fetches the contact form from
  `edemit/lcamapp@ergonomie` and the Genial Bubble web build into git-ignored `static/` folders), then `hugo server`.
- French is the default language (served at `/`), English is served at `/en/`.
- Content is translated by file name (`page.fr.md` / `page.en.md`); home page texts live in
  `config/_default/params.<lang>.toml`; menu labels in `i18n/`; theme labels in `themes/genial-theme/i18n/`.
- New project: `hugo new content projects/my-project`, add a `cover.png`, set `draft: false`.
- Deployment: GitHub Actions builds on pull requests and builds + deploys to GitHub Pages on pushes to `main`.
