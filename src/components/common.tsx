import type { ReactNode } from 'react'
import type { AlertSeverity, WellStatus } from '../types'

export function statusClass(status: WellStatus): string {
  switch (status) {
    case 'Producing': return 'producing'
    case 'Soaking': return 'soaking'
    case 'Injecting': return 'injecting'
    default: return 'shutin'
  }
}

export function StatusDot({ status }: { status: WellStatus }) {
  return <span className={`status-dot ${statusClass(status)}`} />
}

export function SeverityBadge({ severity }: { severity: AlertSeverity }) {
  return <span className={`badge ${severity.toLowerCase()}`}>{severity}</span>
}

export function Readout({
  label,
  value,
  unit,
  tone,
}: {
  label: string
  value: string | number
  unit?: string
  tone?: 'amber' | 'blue' | 'green' | 'red'
}) {
  return (
    <div className="readout-row">
      <span className="readout-label">{label}</span>
      <span className={`readout-value${tone ? ' ' + tone : ''}`}>
        {value}
        {unit ? <span style={{ color: 'var(--text-faint)', marginLeft: 4 }}>{unit}</span> : null}
      </span>
    </div>
  )
}

export function StatBlock({
  label,
  value,
  unit,
}: {
  label: string
  value: string | number
  unit?: string
}) {
  return (
    <div className="stat-block">
      <div className="stat-label">{label}</div>
      <div className="stat-value">
        {value}
        {unit ? <span className="stat-unit">{unit}</span> : null}
      </div>
    </div>
  )
}

export function SimTag({ children }: { children: ReactNode }) {
  return <span className="sim-tag">{children}</span>
}
