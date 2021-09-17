import _ from "lodash"
import React, { FC, useCallback, useRef, useState } from "react"
import {
  RegisteredStyle,
  SectionList as NativeSectionList,
  SectionListData,
  SectionListProps,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native"

import TabBar from "./TabBar"

interface IProps extends SectionListProps<any> {
  scrollToLocationOffset?: number
  tabBarStyle?: ViewStyle | RegisteredStyle<ViewStyle>
  renderTab: (section: SectionListData<any>) => React.ReactNode
}

const SectionList: FC<IProps> = ({
  scrollToLocationOffset,
  tabBarStyle,
  renderTab,
  sections,
  ...props
}) => {
  const sectionListRef = useRef<NativeSectionList>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [blockUpdateIndex, setBlockUpdateIndex] = useState(false)
  const prepareSections = _.map(sections, (item, index) => ({ ...item, index }))

  const onPress = useCallback(
    (index: number) => {
      setCurrentIndex(index)
      setBlockUpdateIndex(true)
      sectionListRef.current?.scrollToLocation?.({
        animated: true,
        itemIndex: 0,
        viewOffset: scrollToLocationOffset || 0,
        sectionIndex: index,
      })
    },
    [scrollToLocationOffset],
  )

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }) => {
      if (!blockUpdateIndex && viewableItems[0]) {
        const sectionIndex = viewableItems[0].section.index
        if (currentIndex !== sectionIndex) {
          setCurrentIndex(sectionIndex)
        }
      }
    },
    [blockUpdateIndex, currentIndex],
  )

  return (
    <View style={styles.view}>
      <TabBar {...{ renderTab, onPress, currentIndex, tabBarStyle }} sections={prepareSections} />
      <NativeSectionList
        ref={sectionListRef}
        sections={prepareSections}
        {...{ ...props, onViewableItemsChanged }}
        onMomentumScrollEnd={() => setBlockUpdateIndex(false)}
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
