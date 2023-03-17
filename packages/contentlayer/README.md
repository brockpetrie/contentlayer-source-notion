# <img src="https://i.imgur.com/fdY8IX2.png" height="30" />&nbsp;&nbsp;Contentlayer Source Notion [![Discord](https://badgen.net/badge/icon/discord?icon=discord&label)](https://discord.gg/fk83HNECYJ)

[⚠️ Alpha test](#⚠️-alpha-test) •
[🎲 Features](#🎲-features) •
[🚀 Get started](#🚀-getting-started) •
[🔧 Configure](#🔧-configure) •
[✍ Contribute](#✍-contribute)

Contentlayer Source Notion is a [Contentlayer](https://www.contentlayer.dev/) plugin to use [Notion.so](https://notion.so) as a content source.

## ⚠️ Alpha test

**This plugin is actually under heavy-development, use it at your own risks or for testing purposes only.**

You can contribute to this project by listing bugs and giving ideas on the [issues of this repository](https://github.com/kerwanp/contentlayer-source-notion/issues).

> Do not report bugs related to `contentlayer-source-notion` in the official repository.

## 🎲 Features

- [x] Generate your content from Notion Databases
- [x] Automatically infer the type of your properties
- [x] Render HTML from your Rich Text properties and pages content ([@notion-render/client](https://github.com/kerwanp/notion-render))
- [x] Filter and sorts pages queried from your databases
- [ ] Use Rollup and Relation properties with ease
- [ ] Recompute values to create new fields (computed fields)
- [ ] Iteration and cache system to work safely with ton of pages

## 🚀 Getting started

### 1. Install Contentlayer, Notion source plugin and dependencies

```bash
$ npm install contentlayer contentlayer-source-notion @notionhq/client
$ yarn add contentlayer contentlayer-source-notion @notionhq/client
```

### 2. Create a database

Save your database ID, it should be available in the url: **/myworkspace/<ins>fe26b972ec3f4b32a1882230915fe111</ins>?v=b56e97ee99a74f3f8c3ee80543fe22c6**

![My integrations](docs/table.png)

### 3. Get a Notion Token

To interact with [Notion](https://notion.so) you need to create an integration and give it the correct permissions.
Create a new integration by heading to the [following link](https://www.notion.so/my-integrations).

You should then have your Notion Token, also called **Internal Integration Token**.

![My integrations](docs/integration_granular_permissions.gif)

### 4. Add the integration to your databases

By default, your integration does not have any permissions.
On each databases you want to query, click on the `•••` in the top right corner.

Click on **Add connection** and select your Integration. Your token should now have access to your database.

### 5. Configure Contentlayer

```typescript
import { makeSource, defineDatabase } from 'contentlayer-source-notion'
import * as notion from '@notionhq/client'

const client = new notion.Client({
  auth: '<notion_token>',
})

const Category = defineDatabase(() => ({
  name: 'Category',
  databaseId: '<database_id>',
  importContent: false,
}))

const Post = defineDatabase(() => ({
  name: 'Post',
  databaseId: '<database_id>',
  importContent: false,
  fields: {
    category: {
      type: 'relation',
      single: true,
      of: Category,
    },
  },
}))

export default makeSource({
  client,
  databaseTypes: [Category, Post],
})
```

> Read more on how to configure `contentlayer-source-notion` [here](#-configure)

## 🔧 Configure

### Source plugin options

```typescript
import { makeSource } from 'contentlayer-source-notion'

export default makeSource({
  client,
  renderer,
  databaseTypes: [],
})
```

The `PluginOptions` supports the following parameters. Thoses options are defined when using `makeSource`.

| Option          | Default value | Type                                             | Description                                            |
| --------------- | ------------- | ------------------------------------------------ | ------------------------------------------------------ |
| `client`        |               | `Client`                                         | The Notion Client used to query the Notion API.        |
| `renderer`      | `undefined`   | `NotionRenderer`                                 | The renderer used to transform Notion Blocks into HTML |
| `databaseTypes` |               | `DatabaseType[] \| Record<string, DatabaseType>` | The databases definitions.                             |

### Database definition options

```typescript
import { defineDatabase } from 'contentlayer-source-notion'

const Post = defineDatabase(() => ({
  name: 'Post',
  databaseId: '<database_id>',
  importContent: false,
  automaticImport: true,
  fields: {
    email: {
      name: 'Email',
      description: 'The author email',
      isRequired: true,
    },
  },
}))
```

The `DatabaseTypeDef` supports the following parameters. Thoses options are defined when using `defineDatabase`.

| Option            | Default value | Type                                                             | Description                                                                                                                                                                                       |
| ----------------- | ------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`            |               | `string`                                                         | The name of this content used to generate types and constants names.                                                                                                                              |
| `description`     | `undefined`   | `string`                                                         | The description of this content used to generate comments                                                                                                                                         |
| `databaseId`      |               | `string`                                                         | The database ID where your pages will be queried from                                                                                                                                             |
| `automaticImport` | `undefined`   | `bool`                                                           | By default, all your properties will be generated. By disabling automatic import you can whitelist the properties you want to use. Useful when you have sensitive content in your page properties |
| `importContent`   | `undefined`   | `bool`                                                           | By default, your page content will be generated. Disable it if you only want to use the properties.                                                                                               |
| `query`           | `undefined`   | `QueryDatabaseParameters`                                        | Filter and sorts the page queried from the Notion API. More information on the [@notionhq/client repository](https://github.com/makenotion/notion-sdk-js)                                         |
| `fields`          | `undefined`   | `Record<string, DatabaseFieldTypeDef> \| DatabaseFieldTypeDef[]` | The fields definitions. When using `Record<string, DatabaseFieldTypeDef>` the key will be used as the `key` option.                                                                               |

#### Field definition options

The `DatabaseFieldTypeDef` supports the following parameters. Thoses options are defined when using `defineDatabase`.

| Option        | Default value | Type     | Description                                                               |
| ------------- | ------------- | -------- | ------------------------------------------------------------------------- |
| `id\|name`    |               | `string` | The id or name of the property you want to configure.                     |
| `key`         | `undefined`   | `string` | Map this property to a specific key. Defaults to the property name.       |
| `description` | `undefined`   | `string` | Field description used to generate comments.                              |
| `isRequired`  | `false`       | `bool`   | When required, pages without this property defined will not be generated. |

### Configure the Notion Client

This plugin depends on the official Notion JS SDK, you can find more information on how to configure it on the [following repository](https://github.com/makenotion/notion-sdk-js).

```typescript
import { makeSource, defineDatabase } from 'contentlayer-source-notion'
import * as notion from '@notionhq/client'

const client = new notion.Client({
  auth: '<notion_token>',
})

export default makeSource({
  client,
  renderer,
  databaseTypes: [],
})
```

### Configure the Notion Renderer

Rich text properties and your pages content must be renderer, you can find more information on how to configure it on the [following repository](https://github.com/kerwanp/notion-render).

```typescript
import { makeSource, defineDatabase } from 'contentlayer-source-notion'
import { NotionRenderer } from '@notion-render/client'
import * as notion from '@notionhq/client'

const client = new notion.Client({
  auth: '<notion_token>',
})

const renderer = new NotionRenderer({ client })

export default makeSource({
  client,
  renderer,
  databaseTypes: [],
})
```

## ✍ Contribute
