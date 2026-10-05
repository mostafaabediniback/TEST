# Base Dashboard Template

A general-purpose React template for developing new projects while preserving the look and feel of the original project.

## Features

- Two separate pages, “Test Menu 1” and “Test Menu 2,” plus a “Settings” page.
- Persian and English language support, with the selected language persisted and automatic RTL/LTR direction switching.
- Sidebar that expands on mouse hover, with a pin button to keep it open and a mobile menu.
- `Ctrl+B` or `Cmd+B` keyboard shortcut to toggle the sidebar.
- General profile menu with access to settings and language selection.
- General search box with the placeholder text “Search” and a clear button.
- Local Sahel and Inter fonts, along with reusable components in `src/components/ui`.

Project-specific code, data, styles, and dependencies related to maps and vehicles, as well as test files and tools, have been removed. The template does not require an API, `.env` file, or any external service to run.

## Running the Project

Prerequisite: Node.js version `20.19+` from the Node 20 branch, or `22.12+`.

```bash
pnpm install --frozen-lockfile
pnpm dev
```

If you are using npm:

```bash
npm install
npm run dev
```

Use only one package manager for each installation.

## Building for Production

```bash
pnpm build
pnpm preview
```

The production output is generated in the `dist` directory. When deploying, route application path requests to `index.html` so that pages also work when opened directly.

## Routes

| Path | Page |
| --- | --- |
| `/` | Test Menu 1 |
| `/test-2` | Test Menu 2 |
| `/settings` | Settings |

Unknown routes are redirected to the first page.

## Development

- Create new pages inside `src/pages` and add their routes to `src/App.jsx`.
- Menu titles, icons, and links are defined in the `items` array inside `src/components/layout/Sidebar.jsx`.
- The overall page layout, header, and page rendering area are defined in `src/components/layout/DashboardLayout.jsx`.
- Persian translations are stored in `src/i18n/messages.js`. Translation keys are used as the English text.
- Colors and fonts are defined in `src/index.css`, while Tailwind configuration is located in `tailwind.config.js`.
- `SettingsPanel.jsx` is the place to add new settings options.
- To display real user information, pass a `user` prop containing `name`, `email`, and `avatar` to `SidebarProfile`.

Search in this template only maintains the input state; the sample pages do not contain any data to filter. To connect project data, use the following hook in any page rendered inside the layout:

```jsx
import { useSearch } from "@/context/SearchContext";

const { search, setSearch, debouncedSearch } = useSearch();
```

`debouncedSearch` is updated after 400 milliseconds. As in the original structure, the search box is not displayed on the Settings page.

For compatibility with both languages, use `useLocale()` and direction-aware classes such as `start`, `end`, `ps`, `pe`, and `text-start`.

Font licenses are stored in `public/licenses`.