import { useEffect } from 'react'

export default function useClickOutside(
  ref: React.RefObject<HTMLTextAreaElement | null>,
  callback: () => void,
  active: boolean,
) {
  useEffect(() => {
    if (!active) return

    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        callback()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [ref, callback, active])
}
