export interface BoardType {
  id: string
  name: string
  tasks?: TaskType[]
  order: number
}

export interface TaskType {
  id: string
  title: string
  order: number
}

export interface DetailsMenuProps {
  editLabel: string
  deleteLabel: string
  onEdit: () => void
  onDelete: () => void
}
