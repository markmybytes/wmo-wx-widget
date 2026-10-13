<a id="readme-top"></a>

<!-- PROJECT SHIELDS -->
<div align="center">

[![Tag][tag-shield]][tag-url]
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![License][license-shield]][license-url]

</div>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/markmybytes/wmo-wx-widget">
    <img src="public/icon.svg" alt="logo" width="80" height="80">
  </a>

  <h3 align="center">wmo-wx-widget</h3>

  <p align="center">
    A responsive, self-hostable weather widget that provides official weather information around the world.
    <br />
    <a href="https://github.com/markmybytes/wmo-wx-widget/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    ·
    <a href="https://github.com/markmybytes/wmo-wx-widget/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>
</div>

<!-- ABOUT THE PROJECT -->

## About The Project

<p align="center">
  <img src="https://github.com/user-attachments/assets/2226ee69-0553-4e17-be31-86db0c82ada7" alt="project screenshot">
<p align="right">

Yet another weather widget — the kind every programmer builds at least once. The difference: the data is actually official, and the design got some real thought.

_wmo-wx-widget_ is a self-hostable weather widget built on data from the
[World Meteorological Organization](http://wmo.int/about-wmo/overview), which
aggregates the official forecasts of local weather agencies worldwide. Style it
in the customiser, grab the URL, and embed it anywhere — Notion, notes,
dashboards.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

[<img src="https://img.shields.io/badge/Iconify-026C9C?logo=iconify&logoColor=fff&style=for-the-badge">](https://iconify.design/)
[<img src="https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white">](https://nextjs.org/)
[<img src="https://img.shields.io/badge/tailwindcss-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white">](https://tailwindcss.com/)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->

## Getting Started

### Prerequisites

- Volta

### Setup

#### Install dependencies

- Install NPM packages
  ```sh
  npm install
  ```

#### Commands

- Development
  ```sh
  npm run dev
  ```
- Preview
  ```sh
  npm run build && npm run start
  ```
- Lint and format
  ```sh
  npm run lint && npm run format:check
  ```
- Docker Build
  ```sh
  docker build -t wmo-wx-widget .
  ```
- Docker Run
  ```sh
  docker run -p 3000:3000 wmo-wx-widget
  ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->

## Usage

### Responsive Widget

One widget, every size — phone sidebar to full-width dashboard, it just fits.

<img src="https://github.com/user-attachments/assets/b4df8493-99ff-455d-acd4-e62296369276" alt="responsive demo">

### Embedding

Paste the widget URL into Notion, a note, or a dashboard — your forecast lives where your plans do.

<img src="https://github.com/user-attachments/assets/77e54ac9-de75-40d0-85b5-0d3a8672a290" alt="notion embedding screenshot" style="height: 650px">

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[tag-url]: https://github.com/markmybytes/wmo-wx-widget/releases
[tag-shield]: https://img.shields.io/github/v/tag/markmybytes/wmo-wx-widget?style=for-the-badge&label=LATEST&color=%23B1B1B1
[contributors-shield]: https://img.shields.io/github/contributors/markmybytes/wmo-wx-widget.svg?style=for-the-badge
[contributors-url]: https://github.com/markmybytes/wmo-wx-widget/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/markmybytes/wmo-wx-widget.svg?style=for-the-badge
[forks-url]: https://github.com/markmybytes/wmo-wx-widget/network/members
[stars-shield]: https://img.shields.io/github/stars/markmybytes/wmo-wx-widget.svg?style=for-the-badge
[stars-url]: https://github.com/markmybytes/wmo-wx-widget/stargazers
[issues-shield]: https://img.shields.io/github/issues/markmybytes/wmo-wx-widget.svg?style=for-the-badge
[issues-url]: https://github.com/markmybytes/wmo-wx-widget/issues
[license-shield]: https://img.shields.io/github/license/markmybytes/wmo-wx-widget?style=for-the-badge
[license-url]: https://github.com/markmybytes/wmo-wx-widget/blob/master/LICENSE
[product-screenshot]: https://github.com/markmybytes/wmo-wx-widget/assets/71750702/e605d36b-e0a0-46ba-adec-f65fa260679b
