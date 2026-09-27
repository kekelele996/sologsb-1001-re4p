import type { BatchDiffEntry, BatchField, BatchImpact, Cue, DeliveryBatch, DeliveryBatchItem, Term } from '../types'

export const freezeBatchItem = (cue: Cue, terms: Term[]): DeliveryBatchItem => ({
  cueId: cue.id,
  start: cue.start,
  end: cue.end,
  target: cue.target,
  speed: cue.speed,
  termIds: [...cue.termIds],
  termLabels: cue.termIds.map((id) => {
    const term = terms.find((item) => item.id === id)
    return term ? `${term.source} → ${term.target}` : id
  }),
})

export const freezeBatchItems = (cues: Cue[], terms: Term[]): DeliveryBatchItem[] =>
  [...cues]
    .sort((a, b) => a.start - b.start || a.id.localeCompare(b.id))
    .map((cue) => freezeBatchItem(cue, terms))

export const changedBatchFields = (before: DeliveryBatchItem, after: DeliveryBatchItem): BatchField[] => {
  const fields: BatchField[] = []
  if (before.start !== after.start || before.end !== after.end) fields.push('timecode')
  if (before.target !== after.target) fields.push('target')
  if (before.speed !== after.speed) fields.push('speed')
  if (before.termIds.join('|') !== after.termIds.join('|')) fields.push('terms')
  return fields
}

export const diffBatchItems = (previous: DeliveryBatchItem[], next: DeliveryBatchItem[]): BatchDiffEntry[] => {
  const entries: BatchDiffEntry[] = []
  const previousById = new Map(previous.map((item) => [item.cueId, item]))
  const nextIds = new Set(next.map((item) => item.cueId))
  for (const after of next) {
    const before = previousById.get(after.cueId)
    if (!before) {
      entries.push({ cueId: after.cueId, kind: 'added', after, fields: [] })
      continue
    }
    const fields = changedBatchFields(before, after)
    if (fields.length) entries.push({ cueId: after.cueId, kind: 'changed', before, after, fields })
  }
  for (const before of previous) {
    if (!nextIds.has(before.cueId)) entries.push({ cueId: before.cueId, kind: 'removed', before, fields: [] })
  }
  return entries
}

export const computeBatchImpact = (batch: DeliveryBatch, cues: Cue[], terms: Term[]): BatchImpact[] => {
  const impacts: BatchImpact[] = []
  for (const item of batch.items) {
    const cue = cues.find((entry) => entry.id === item.cueId)
    if (!cue) {
      impacts.push({ cueId: item.cueId, kind: 'missing', fields: [] })
      continue
    }
    const fields = changedBatchFields(item, freezeBatchItem(cue, terms))
    if (fields.length) impacts.push({ cueId: item.cueId, kind: 'changed', fields })
  }
  return impacts
}
