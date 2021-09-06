type ActionName = "scrolled" | "pressed" | "failed" | "updated" | "changed"

interface ListState {
  isScrolled: boolean // when user is scrolling
  highestIndex?: number // take the last possible item index to reach
  currentTabIndex: number
  blockUpdateIndex: boolean
}

export interface ListAction {
  type: ActionName
  index?: number
}

export function reducer(state: ListState, action: ListAction): ListState {
  switch (action.type) {
    case "scrolled":
      return {
        ...state,
        isScrolled: true,
        blockUpdateIndex: false,
      }
    case "pressed":
      return {
        ...state,
        isScrolled: false,
        blockUpdateIndex: true,
        currentTabIndex: action.index!,
      }
    case "failed":
      return {
        ...state,
        blockUpdateIndex: false,
        highestIndex: action.index!,
      }
    case "updated":
      return {
        ...state,
        blockUpdateIndex: false,
      }
    case "changed":
      return {
        ...state,
        currentTabIndex: action.index!,
      }
    default:
      return initListState
  }
}

export const initListState: ListState = {
  isScrolled: false,
  currentTabIndex: 0,
  blockUpdateIndex: false,
}
