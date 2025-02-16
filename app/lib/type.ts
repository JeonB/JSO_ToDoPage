export interface BoardType {
  id: string
  title?: string
  order: number
  tasks?: TaskType[]
  children?: React.ReactNode
}

export interface TaskType {
  id: string
  title?: string
  order: number
}

export interface DetailsMenuProps {
  editLabel: string
  deleteLabel: string
  onEdit: () => void
  onDelete: () => void
}
