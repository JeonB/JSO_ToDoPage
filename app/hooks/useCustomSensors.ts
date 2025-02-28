import { PointerSensor, TouchSensor } from '@dnd-kit/core'
import { PointerEvent, TouchEvent } from 'react'

export default function useCustomSensors() {
  const customHandleEvent = (element: HTMLElement | null) => {
    while (element) {
      if (element.dataset.noDnd) {
        return false
      }
      element = element.parentElement
    }

    return true
  }

  PointerSensor.activators = [
    {
      eventName: 'onPointerDown',
      handler: ({ nativeEvent: event }: PointerEvent) =>
        customHandleEvent(event.target as HTMLElement),
    },
  ]

  TouchSensor.activators = [
    {
      eventName: 'onTouchStart',
      handler: ({ nativeEvent: event }: TouchEvent) =>
        customHandleEvent(event.target as HTMLElement),
    },
  ]

  return { PointerSensor, TouchSensor }
}
