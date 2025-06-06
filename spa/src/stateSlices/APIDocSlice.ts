import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import { OpenAPIV3_1 } from 'openapi-types';


interface APIDocSlice {
  spec: OpenAPIV3_1.Document | undefined
  schemas: Record<string, OpenAPIV3_1.SchemaObject>
}


const initialState: APIDocSlice = {
  spec: undefined,
  schemas: {}
}

export const apiDocSlice = createSlice({
  name: 'apiDoc',
  initialState,
  reducers: {
    reset: () => initialState,
    setSpec: (state, action: PayloadAction<OpenAPIV3_1.Document>) => {
      state.spec = { ...action.payload }
    },
  },
})

export const { setSpec } = apiDocSlice.actions

export const action = (state: RootState) => state.audit.action

export default apiDocSlice.reducer