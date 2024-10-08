import { createSlice } from '@reduxjs/toolkit'
import { isVisible } from '../components/MiniComponents'

const initialState = {
  data: {},
  title: "Loading...",
  status: "nothing",
  search: "",
  rows: {
    items: [],
    visible: {},
    selected: {},
    allSelected: false,
  },
  selected: {},
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
  extraHeaders: {}
}

export const browseSlice = createSlice({
  name: 'browse',
  initialState,
  reducers: {
    reset: () => initialState,
    setData: (state, action) => {
      state.data = { ...action.payload }
    },
    setSearch: (state, action) => {
      state.search = action.payload
      state.rows.items.forEach((row) => {
        state.rows.visible[row.id] = isVisible(state, row)
      })
    },
    addRow: (state, action) => {
      state.rows.items = [
        ...state.rows.items,
        action.payload
      ]
      const newSelected = {}
      newSelected[action.payload.id] = false
      state.rows.selected = {
        ...state.rows.selected,
        ...newSelected
      }
      const newVisible = {}
      newVisible[action.payload.id] = true
      state.rows.visible = {
        ...state.rows.visible,
        ...newVisible
      }
    },
    addRows: (state, action) => {
      state.rows.items = [
        ...state.rows.items,
        ...action.payload.requirements
      ]
      state.rows.selected = {
        ...state.rows.selected,
        ...action.payload.selected
      }
      state.rows.visible = {
        ...state.rows.visible,
        ...action.payload.visible
      }
    },
    setVisibleRow: (state, action) => {
      const newVisible = {}
      newVisible[action.payload.id] = action.payload.visible
      state.rows.visible = {
        ...state.rows.visible,
        ...newVisible
      }
    },
    toggleSelectRow: (state, action) => {
      const newSelected = {}
      newSelected[action.payload] = !state.rows.selected[action.payload]
      state.rows.selected = {
        ...state.rows.selected,
        ...newSelected
      }
      if (Object.values(state.rows.selected).every(r => r === true)) {
        state.rows.allSelected = true;
      } else {
        state.rows.allSelected = false;
      }
    },
    toggleSelectAll: (state, action) => {
      const newSelected = { ...state.rows.selected };
      const selectState = !state.rows.allSelected;
      Object.keys(newSelected).forEach((key) => {
        if (state.rows.visible[key]) {
          newSelected[key] = selectState
        }
      });
      newSelected[action.payload] = !state.rows.selected[action.payload]
      state.rows.selected = {
        ...newSelected
      }
      if (Object.values(state.rows.selected).every(r => r === true)) {
        state.rows.allSelected = true;
      } else {
        state.rows.allSelected = false;
      }
    },
    sortRows: state => {
      let tmp = [...state.rows.items]
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
    setTagFilterItems: (state, action) => {
      state.tags.filterItems = [
        ...action.payload
      ]
      state.tags.filterSelected = [
        ...state.tags.filterItems
      ]
    },
    toggleTagFilterSelected: (state, action) => {
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
      state.tags.allSelected = JSON.stringify([...state.tags.filterSelected].sort()) === JSON.stringify([...state.tags.filterItems].sort());
      state.rows.items.forEach((row) => {
        state.rows.visible[row.id] = isVisible(state, row)
      });
    },
    toggleTagFilterSelectedAll: (state, action) => {
      if (action.payload === true) {
        state.tags.filterSelected = [
          ...state.tags.filterItems
        ]
      } else {
        state.tags.filterSelected = [
        ]
      }
      state.tags.allSelected = JSON.stringify([...state.tags.filterSelected].sort()) === JSON.stringify([...state.tags.filterItems].sort());

      state.rows.items.forEach((row) => {
        state.rows.visible[row.id] = isVisible(state, row)
      });
    },
    addExtraHeader: (state, action) => {
      state.extraHeaders = {
        ...state.extraHeaders,
        ...action.payload
      }
    },
    addTopicFilterItems: (state, action) => {
      state.topics.filterItems = [
        ...state.topics.filterItems,
        action.payload
      ]
      state.topics.filterSelected = [
        ...state.topics.filterSelected,
        action.payload
      ]
    },
    sortTopicFilterItems: (state) => {
      let tmp = [...state.topics.filterItems]
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
    addTopicFilterSelected: (state, action) => {
      state.topics.filterSelected = [
        ...state.topics.filterSelected,
        ...action.payload.filter(n => !state.topics.filterSelected.includes(n)),
      ]

      state.rows.items.forEach((row) => {
        state.rows.visible[row.id] = isVisible(state, row)
      })
    },
    removeTopicFilterSelected: (state, action) => {
      state.topics.filterSelected = [
        ...state.topics.filterSelected.filter(n => !action.payload.includes(n))
      ]

      state.rows.items.forEach((row) => {
        state.rows.visible[row.id] = isVisible(state, row)
      })
    },
    addComment: (state, action) => {
      const tmp = [
        ...state.rows.items
      ]
      tmp[action.payload.index].Comments.push(action.payload.comment)
      state.rows.items = [
        ...tmp
      ]
    },
    removeComment: (state, action) => {
      let tmp = [...state.rows.items]
      tmp[action.payload.index].Comments.splice(action.payload.comment, 1);
      state.rows.items = [...tmp]
    },
    updateComment: (state, action) => {
      let tmp = [...state.rows.items]
      tmp[action.payload.index].Comments[action.payload.commentIndex] = action.payload.comment
      state.comments = [...tmp]
    },
    setTitle: (state, action) => {
      state.title = action.payload
    },
    setStatus: (state, action) => {
      state.status = action.payload
    },
    trace: (state, action) => {
      console.log(action.payload)
    }
  },
})

export const { setVisibleRows, trace, reset, setData, addRow, addRows, sortRows, setTagFilterItems, toggleSelectRow, toggleSelectAll, setVisibleRow, toggleTagFilterSelected, toggleTagFilterSelectedAll, addExtraHeader, setSearch, addTopicFilterItems, sortTopicFilterItems, addTopicFilterSelected, removeTopicFilterSelected, addComment, removeComment, updateComment, setTitle, setStatus } = browseSlice.actions

export default browseSlice.reducer