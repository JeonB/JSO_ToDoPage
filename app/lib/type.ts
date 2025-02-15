export interface BoardType {
  id: string
  name: string
  tasks?: TaskType[]
}

export interface TaskType {
  id: string
  title: string
}

export interface DetailsMenuProps {
  editLabel: string
  deleteLabel: string
  onEdit: () => void
  onDelete: () => void
}
