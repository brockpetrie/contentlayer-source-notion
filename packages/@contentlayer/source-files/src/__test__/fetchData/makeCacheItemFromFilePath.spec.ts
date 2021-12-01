import { E } from '@contentlayer/utils/effect'
import path from 'path'
import t from 'tap'

// Given we're running the tests of the ./dist directory, we need to point the `__dirname` back to the `src` directory
const __dirname = path.dirname(new URL(import.meta.url).pathname).replace('dist', 'src')

const contentDirPath = path.join(__dirname, 'fixtures', 'content')

import { defineDocumentType } from '../../schema/defs/index.js'
import { runTest } from './utils.js'

t.test('makeCacheItemFromFilePath', async (t) => {
  t.test('a.md: hello world should work', async (t) => {
    const TestPost = defineDocumentType(() => ({
      name: 'TestPost',
      filePathPattern: `**/*.md`,
      fields: {},
    }))

    const { result } = await runTest({ documentTypes: [TestPost], contentDirPath, relativeFilePath: 'a.md' })

    t.equal(result._tag, 'Right')
    if (E.isRight(result)) {
      console.log(JSON.stringify(result, null, 2))
      t.ok(result.right.document)
    }
  })

  t.test('b.md: missing required field', async (t) => {
    const TestPost = defineDocumentType(() => ({
      name: 'TestPost',
      filePathPattern: `**/*.md`,
      fields: {
        tags: { type: 'list', of: { type: 'string' }, required: true },
      },
    }))

    const { result } = await runTest({ documentTypes: [TestPost], contentDirPath, relativeFilePath: 'b.md' })

    t.equal(result._tag, 'Left')
    if (E.isLeft(result)) {
      console.log(JSON.stringify(result.left, null, 2))
      t.equal(result.left._tag, 'MissingRequiredFieldsError')
    }
  })

  t.test('c.md: invalid frontmatter', async (t) => {
    const TestPost = defineDocumentType(() => ({
      name: 'TestPost',
      filePathPattern: `**/*.md`,
      fields: {
        tags: { type: 'list', of: { type: 'string' }, required: true },
        categories: { type: 'list', of: { type: 'string' }, required: true },
        // other: { type: 'boolean', required: true },
      },
    }))

    const { result } = await runTest({ documentTypes: [TestPost], contentDirPath, relativeFilePath: 'c.md' })

    t.equal(result._tag, 'Left')
    if (E.isLeft(result)) {
      console.log(JSON.stringify(result.left, null, 2))

      t.equal(result.left._tag, 'IncompatibleFieldDataError')
    }
  })
})
