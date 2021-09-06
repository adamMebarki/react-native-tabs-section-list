/* eslint-disable no-console */
import _ from "lodash"
import React, { FC, useCallback, useEffect, useReducer, useRef, useState } from "react"
import {
  Platform,
  RegisteredStyle,
  SectionList as NativeSectionList,
  SectionListData,
  SectionListProps,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native"

import { initListState, reducer } from "./constants"
import TabBar from "./TabBar"

interface IProps extends SectionListProps<any> {
  scrollToLocationOffset?: number
  tabBarStyle?: ViewStyle | RegisteredStyle<ViewStyle>
  renderTab: (section: SectionListData<any>) => React.ReactNode
}

const SectionList: FC<IProps> = ({ tabBarStyle, renderTab, sections, ...props }) => {
  const sectionListRef = useRef<NativeSectionList>(null)
  const tabIndexRef = useRef(0) // uses when scrollToFailed is triggered
  const [androidScrollEnd, setAndroidScrollEnd] = useState(false)
  const [listState, dispatch] = useReducer(reducer, initListState)
  const { isScrolled, currentTabIndex, highestIndex, blockUpdateIndex } = listState
  const currentIndex = isScrolled ? currentTabIndex : tabIndexRef.current
  const prepareSections = _.map(sections, (item, index) => ({ ...item, index }))

  const onPress = useCallback((index: number) => {
    tabIndexRef.current = index
    dispatch({ type: "pressed", index })
    sectionListRef.current?.scrollToLocation?.({
      animated: true,
      itemIndex: 0,
      viewPosition: 0,
      sectionIndex: index,
    })
  }, [])

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }) => {
      if (!blockUpdateIndex && viewableItems[0]) {
        const sectionIndex = viewableItems[0].section.index
        if (currentTabIndex !== sectionIndex) {
          dispatch({ type: "changed", index: sectionIndex })
        }
        setAndroidScrollEnd(true)
      }
    },
    [blockUpdateIndex, currentTabIndex],
  )

  useEffect(() => {
    if (highestIndex && sectionListRef.current) {
      sectionListRef.current?.scrollToLocation({
        animated: true,
        itemIndex: highestIndex,
        sectionIndex: -1,
        viewPosition: 0,
      })
    }
  }, [highestIndex])

  useEffect(() => {
    if (Platform.OS === "android" && androidScrollEnd) {
      setAndroidScrollEnd(false)
      dispatch({ type: "updated" })
      if (tabIndexRef.current !== currentTabIndex && !isScrolled) {
        onPress(tabIndexRef.current)
      }
    }
  }, [androidScrollEnd, currentTabIndex, isScrolled, onPress])

  const onScrollToIndexFailed = useCallback(
    (info: { index: number; highestMeasuredFrameIndex: number; averageItemLength: number }) => {
      dispatch({ type: "failed", index: info.highestMeasuredFrameIndex })
    },
    [],
  )

  const onMomentumScrollEnd = useCallback(() => {
    if (Platform.OS === "ios") {
      dispatch({ type: "updated" })
      if (tabIndexRef.current !== currentTabIndex && !isScrolled) {
        onPress(tabIndexRef.current)
      }
    }
  }, [currentTabIndex, isScrolled, onPress])

  return (
    <View style={styles.view}>
      <TabBar sections={prepareSections} {...{ renderTab, onPress, tabBarStyle, currentIndex }} />
      <NativeSectionList
        ref={sectionListRef}
        sections={prepareSections}
        onScrollBeginDrag={() => dispatch({ type: "scrolled" })}
        {...{ ...props, onViewableItemsChanged, onScrollToIndexFailed }}
        onMomentumScrollEnd={Platform.OS === "ios" ? onMomentumScrollEnd : undefined}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  view: {
    flex: 1,
  },
})

export default SectionList
