import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { isVisible, resolvePathAndSetElement } from '../components/MiniComponents'
import { Item as Comment } from '../types/API/Comments';
import { Row } from '../types/Generics';
import { BrowseState } from '../types/Generics';



const initialState: BrowseState = {
  data: null,
  title: "Loading...",
  description: "",
  status: "nothing",
  search: "",
  rows: {
    items: [],
    selectedCount: 0,
  },
  tags: {
    filterItems: [],
    filterSelected: [],
    allSelected: true
  },
  topics: {
    filterItems: [],
    filterSelected: [],
    allSelected: true
  },
  extraHeaders: {},
  comments: {}
}

export const browseSlice = createSlice({
  name: 'browse',
  initialState,
  reducers: {
    reset: () => initialState,
    setData: (state, action) => {
      state.data = { ...action.payload }
    },
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload
      state.rows.items.forEach((row, index) => {
        state.rows.items[index].visible = isVisible(state, row)
      })
    },
    addRow: (state, action: PayloadAction<Row>) => {
      action.payload.selected = false
      action.payload.visible = true
      state.rows.items = [
        ...state.rows.items,
        action.payload
      ]
    },
    addRows: (state, action: PayloadAction<Array<Row>>) => {
      action.payload.forEach((item, index) => {
        action.payload[index].selected = false
        action.payload[index].visible = true
      });
      state.rows.items = [
        ...state.rows.items,
        ...action.payload
      ]
    },
    toggleSelectRow: (state, action: PayloadAction<number>) => {
      const tmp = [...state.rows.items]
      tmp[action.payload].selected = !tmp[action.payload].selected
      state.rows.items = [...tmp]
      if (state.data) resolvePathAndSetElement(state.data, tmp[action.payload].path, "selected", tmp[action.payload].selected)

      if (tmp[action.payload].selected) {
        state.rows.selectedCount++
      } else {
        state.rows.selectedCount--
      }
    },
    toggleSelectAll: state => {
      const tmp = [...state.rows.items]
      const action = !(state.rows.selectedCount == state.rows.items.length)

      tmp.forEach((item, index) => {
        tmp[index].selected = action
        if (state.data) resolvePathAndSetElement(state.data, tmp[index].path, "selected", tmp[index].selected)
      });

      if (action) {
        state.rows.selectedCount = state.rows.items.length
      } else {
        state.rows.selectedCount = 0
      }
      state.rows.items = [...tmp]
    },
    sortRows: state => {
      const tmp = [...state.rows.items]
      tmp.sort((a, b) => {
        const nameA = a.Key.toUpperCase();
        const nameB = b.Key.toUpperCase();
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        return 0;
      });
      state.rows.items = [...tmp]
    },
    setTagFilterItems: (state, action: PayloadAction<Array<string>>) => {
      state.tags.filterItems = [
        ...action.payload
      ]
      state.tags.filterSelected = [
        ...state.tags.filterItems
      ]
    },
    toggleTagFilterSelected: (state, action: PayloadAction<string>) => {
      if (state.tags.filterSelected.indexOf(action.payload) >= 0) {
        const tmp = state.tags.filterSelected.filter(function (v) { return v !== action.payload; });
        state.tags.filterSelected = [
          ...tmp
        ]
      } else {
        state.tags.filterSelected = [
          ...state.tags.filterSelected,
          action.payload
        ]
      }
      state.tags.allSelected = state.tags.filterSelected.length == state.tags.filterItems.length
      state.rows.items.forEach((row, index) => {
        state.rows.items[index].visible = isVisible(state, row)
      });
    },
    toggleTagFilterSelectedAll: (state, action: PayloadAction<boolean>) => {
      if (action.payload === true) {
        state.tags.filterSelected = [
          ...state.tags.filterItems
        ]
      } else {
        state.tags.filterSelected = [
        ]
      }
      state.tags.allSelected = state.tags.filterSelected.length == state.tags.filterItems.length
      state.rows.items.forEach((row, index) => {
        state.rows.items[index].visible = isVisible(state, row)
      });
    },
    addExtraHeader: (state, action: PayloadAction<{ [key: string]: 1 | 2 | 3 }>) => {
      state.extraHeaders = {
        ...state.extraHeaders,
        ...action.payload
      }
    },
    addTopicFilterItems: (state, action: PayloadAction<string>) => {
      state.topics.filterItems = [
        ...state.topics.filterItems,
        action.payload
      ]
      state.topics.filterSelected = [
        ...state.topics.filterSelected,
        action.payload
      ]
    },
    sortTopicFilterItems: state => {
      const tmp = [...state.topics.filterItems]
      tmp.sort((a, b) => {
        const nameA = a.toUpperCase();
        const nameB = b.toUpperCase();
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        return 0;
      });
      state.topics.filterItems = [...tmp]
    },
    addTopicFilterSelected: (state, action: PayloadAction<Array<string>>) => {
      state.topics.filterSelected = [
        ...state.topics.filterSelected,
        ...action.payload.filter(n => !state.topics.filterSelected.includes(n)),
      ]

      state.rows.items.forEach((row, index) => {
        state.rows.items[index].visible = isVisible(state, row)
      });
    },
    removeTopicFilterSelected: (state, action: PayloadAction<Array<string>>) => {
      state.topics.filterSelected = [
        ...state.topics.filterSelected.filter(n => !action.payload.includes(n))
      ]

      state.rows.items.forEach((row, index) => {
        state.rows.items[index].visible = isVisible(state, row)
      });
    },
    setComments: (state, action: PayloadAction<{ index: number, comments: Comment[] }>) => {
      const tmp = [
        ...state.rows.items
      ]
      tmp[action.payload.index].Comments = [...action.payload.comments]
      state.rows.items = [
        ...tmp
      ]
    },
    setTitle: (state, action: PayloadAction<string>) => {
      state.title = action.payload
    },
    setStatus: (state, action: PayloadAction<string>) => {
      state.status = action.payload
    },
    setDescription: (state, action: PayloadAction<string>) => {
      state.description = action.payload
    },
  },
})

export const { reset, setData, setDescription, addRow, addRows, sortRows, setTagFilterItems, toggleSelectRow, toggleSelectAll, toggleTagFilterSelected, toggleTagFilterSelectedAll, addExtraHeader, setSearch, addTopicFilterItems, sortTopicFilterItems, addTopicFilterSelected, removeTopicFilterSelected, setComments, setTitle, setStatus } = browseSlice.actions

export default browseSlice.reducer