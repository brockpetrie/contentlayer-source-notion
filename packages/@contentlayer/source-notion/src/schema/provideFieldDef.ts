import type * as core from '@contentlayer/core'
import { OT, pipe, T } from '@contentlayer/utils/effect'

import { getFieldDef, getFieldFunctions } from '../mapping/index.js'
import type { DatabaseProperties, FieldDef } from '../types.js'
import type { DatabaseTypeDef } from './types.js'
import { findDatabaseFieldDef } from './utils/findDatabaseFieldDef.js'
import { normalizeKey } from './utils/normalizeKey.js'

export type ProvideFieldDefArgs = {
  property: DatabaseProperties
  databaseTypeDef: DatabaseTypeDef
  getDocumentTypeDef: (databaseTypeDef: DatabaseTypeDef<false>) => T.Effect<unknown, never, core.DocumentTypeDef>
}

export const provideFieldDef = ({ property, databaseTypeDef, getDocumentTypeDef }: ProvideFieldDefArgs) =>
  pipe(
    T.succeed(findDatabaseFieldDef({ databaseTypeDef, property })),
    T.chain((databaseFieldTypeDef) =>
      T.gen(function* ($) {
        const name = normalizeKey(databaseFieldTypeDef?.key ?? property.name)

        return {
          ...(yield* $(getFieldDef({ property, databaseFieldTypeDef, databaseTypeDef, getDocumentTypeDef }))),
          name,
          propertyKey: property.name,
          isSystemField: false,
          description: databaseFieldTypeDef?.description,
          isRequired: databaseFieldTypeDef?.required ?? false,
        } as FieldDef
      }),
    ),
    T.catchAll(() => T.succeed(undefined)), // TODO : Better error handling
    OT.withSpan('@contentlayer/source-notion/schema:provideFieldDef'),
  )
