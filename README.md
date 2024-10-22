## Wormholescan UI

### Live

https://wormholescan.io/

### Prerequisites

- NodeJS v16+
- NPM v8+
- Visual Studio Code with 'Prettier' and 'SCSS IntelliSense' extensions installed
- Yarn v3

## Commands

### Install

```
yarn install
```

### Run app for development

```
yarn start
```

> **Note**
>
> If you want to point to a different environment than production
> you must create **.env** file with the **WORMSCAN_API_BASE_URL**
> that you want to use in the root project folder

### Build app

```
yarn build
```

### Serve built app

```
npx serve -s dist
```

### Clean build folder and parcel cache

```
yarn clean
```

## Documentation

- [API Doc](https://wormholescan.io/#/developers/api-doc)

## Stack used

- [Wormholescan SDK](https://github.com/XLabs/wormscan-sdk)
- [Parcel](https://parceljs.org/) as the build tool.
- [Typescript](https://www.typescriptlang.org/) as the language.
- [ReactJS](https://reactjs.org/) as the development tool/library.
- [Sass](https://sass-lang.com/) as the CSS processor.
- [Prettier](https://prettier.io/) to enforce a standard code styling.
- [Radix UI](https://www.radix-ui.com/) primitives and [Radix Icons](https://icons.radix-ui.com/) as components library.
- [RecoilJS](https://recoiljs.org/docs/introduction/getting-started) as the state management library.
- [React Router](https://reactrouter.com/en/main) as the routing library.
- [React Query](https://react-query-v3.tanstack.com/) as a server state helper library.
- [Apex Charts](https://apexcharts.com/react-chart-demos/) as the chart generation library.
