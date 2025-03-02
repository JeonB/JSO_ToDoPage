import { cloneElement, memo, ReactElement, useMemo } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import clsx from 'clsx'

const MemoContainer = memo(function MemoContainer({
  children,
  id,
}: {
  children: ReactElement
  id: string
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)`, transition }
    : undefined

  const clonedChild = useMemo(
    () =>
      cloneElement(children, {
        ...children,
      }),
    [children],
  )

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={clsx(isDragging && 'opacity-50')}>
      {clonedChild}
    </div>
  )
})

export default MemoContainer
