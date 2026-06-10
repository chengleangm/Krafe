# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Krafe Coffee** — a static single-page coffee shop website. No build tool, no framework, no package manager. Open `index.html` directly in a browser.

## Structure

Currently one file: `index.html` — inline `<style>`, HTML body, and inline `<script>`. The user intends to split this into separate `style.css` and `script.js` files.

## Architecture

- **CSS custom properties** defined in `:root` drive the entire color/typography system (`--coffee`, `--caramel`, `--cream`, etc.).
- **Menu filtering** is client-side: `PRODUCTS` array → `renderGrid()` re-renders `#grid` based on `currentFilter`. Filter buttons, category tiles, and nav links all write to the same `currentFilter` variable.
- **Cart** is a plain in-memory array. `renderCart()` does a full re-render of `#cartItems` on every mutation. No persistence.
- **Drawer/overlay** pattern: `#drawer` + `#overlay` toggled with `.open` class.
- **Toast** is a single `#toast` element reused for all messages.
