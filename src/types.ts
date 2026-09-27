export type CueStatus = 'draft' | 'reviewed' | 'issue'
export type Locale = 'zh-CN' | 'en-US' | 'ja-JP'

export interface Cue {
  id: string
  start: number
  end: number
  source: string
  target: string
  actorId: string
  speed: number
  termIds: string[]
  status: CueStatus
  locked: boolean
}

export interface Actor {
  id: string
  name: string
  color: string
  localeHint: string
}

export interface Term {
  id: string
  source: string
  target: string
  note: string
}

export interface Snapshot {
  id: string
  name: string
  createdAt: number
  cues: Cue[]
}

export interface DeliveryBatchItem {
  cueId: string
  start: number
  end: number
  target: string
  speed: number
  termIds: string[]
}

export interface DeliveryBatch {
  id: string
  actorId: string
  createdAt: number
  items: DeliveryBatchItem[]
  totalDuration: number
}

export interface DeliveryDiffEntry {
  cueId: string
  type: 'added' | 'changed' | 'removed'
  before?: DeliveryBatchItem
  after?: DeliveryBatchItem
}

export interface EditorDocument {
  id: string
  title: string
  language: Locale
  cues: Cue[]
  actors: Actor[]
  terms: Term[]
  snapshots: Snapshot[]
  deliveryBatches: DeliveryBatch[]
  updatedAt: number
  revision: number
  lastWriter: string
}

export interface CueConflict {
  cueId: string
  type: 'actor' | 'tone' | 'address'
  message: string
}

export interface HistoryEntry {
  label: string
  cues: Cue[]
  selectedCueId: string | null
}
