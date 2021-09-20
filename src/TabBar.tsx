import React, { FC, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  LayoutChangeEvent,
  LayoutRectangle,
  RegisteredStyle,
  ScrollView,
  SectionListData,
  TouchableOpacity,
  useWindowDimensions,
  View,
  ViewStyle,
} from "react-native"

interface IProps {
  currentIndex: number
  onPress: (index: number) => void
  sections: Array<SectionListData<any>>
  tabBarStyle?: ViewStyle | RegisteredStyle<ViewStyle>
  renderTab: (section: SectionListData<any>) => ReactNode
}

interface ITabMeasurements {
  left: number
  right: number
  width: number
  height: number
}

interface ITabsLayoutRectangle {
  [index: number]: ITabMeasurements
}

const TabBar: FC<IProps> = ({ sections, tabBarStyle, currentIndex, renderTab, onPress }) => {
  const scrollViewRef = useRef<ScrollView>(null)
  const localIndex = useRef(0)
  const [tabContainerMeasurements, setTabContainerMeasurements] = useState<LayoutRectangle>()
  const [tabsMeasurements, setTabsMeasurements] = useState<ITabsLayoutRectangle>({})
  const windowDimensions = useWindowDimensions()
  const row: ViewStyle = {
    flexDirection: "row",
  }

  const s = useMemo(
    () => ({
      view: [
        {
          width: windowDimensions.width,
        },
        tabBarStyle,
      ],
    }),
    [tabBarStyle, windowDimensions.width],
  )

  // default method
  const getScrollAmount = useCallback(() => {
    if (!tabContainerMeasurements) {
      return
    }
    const pageOffset = 0
    const position = currentIndex
    const containerWidth = windowDimensions.width
    const tabWidth = tabsMeasurements[position].width
    const nextTabMeasurements = tabsMeasurements[position + 1]
    const nextTabWidth = (nextTabMeasurements && nextTabMeasurements.width) || 0
    const tabOffset = tabsMeasurements[position].left
    const absolutePageOffset = pageOffset * tabWidth
    let newScrollX = tabOffset + absolutePageOffset
    newScrollX -= (containerWidth - (1 - pageOffset) * tabWidth - pageOffset * nextTabWidth) / 2
    newScrollX = newScrollX >= 0 ? newScrollX : 0

    const rightBoundScroll = Math.max(tabContainerMeasurements.width - containerWidth, 0)

    newScrollX = newScrollX > rightBoundScroll ? rightBoundScroll : newScrollX
    return newScrollX
  }, [currentIndex, tabContainerMeasurements, tabsMeasurements, windowDimensions.width])

  useEffect(() => {
    if (currentIndex !== localIndex.current) {
      localIndex.current = currentIndex
      scrollViewRef.current?.scrollTo?.({
        x: getScrollAmount(),
        animated: true,
      })
    }
  }, [currentIndex, getScrollAmount])

  const onLayout = (e: LayoutChangeEvent) => setTabContainerMeasurements(e.nativeEvent.layout)

  const onTabLayout = useCallback(
    (key: number) => ({
      nativeEvent: {
        layout: { width, x, height },
      },
    }: LayoutChangeEvent) => {
      setTabsMeasurements((oldTabsMeasurements) => ({
        ...oldTabsMeasurements,
        [key]: {
          left: x,
          right: x + width,
          width,
          height,
        },
      }))
    },
    [],
  )

  const renderLocalTab = useCallback(
    (section: SectionListData<any>, key: number) => {
      const isActive = currentIndex === key

      return (
        <TouchableOpacity {...{ key }} onPress={() => onPress(key)} onLayout={onTabLayout(key)}>
          {renderTab({ isActive, ...section })}
        </TouchableOpacity>
      )
    },
    [currentIndex, onPress, onTabLayout, renderTab],
  )

  return (
    <View style={s.view}>
      <ScrollView
        horizontal
        ref={scrollViewRef}
        contentContainerStyle={row}
        showsHorizontalScrollIndicator={false}
      >
        <View {...{ onLayout }} style={row}>
          {sections.map(renderLocalTab)}
        </View>
      </ScrollView>
    </View>
  )
}

export default TabBar
