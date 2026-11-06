'use client'
import React, { useState } from 'react'
import { Download, FileBarChart, Printer } from 'lucide-react'
import Skeleton from 'react-loading-skeleton'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useSurveillanceReport } from '@/hooks/monitoring'
import { useMosquitoFilterOptions } from '@/hooks/mosquito'
import { downloadCsv, type CsvColumn } from '@/lib/csv'
import { formatTimestamp, parseApiDate } from '@/lib/date'
import type { ReportPeriod, SurveillanceReport } from '@/queries/monitoring/monitoringQueries'

const NO_DATA = 'No data for this period.'
const today = () => new Date().toISOString().slice(0, 10)
const day = (iso: string) =>
  parseApiDate(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })
// period_end is exclusive — show the last day actually covered.
const lastDay = (iso: string) => day(new Date(parseApiDate(iso).getTime() - 1).toISOString())
const fmt = (v: number | null, unit = '') => (v === null ? '—' : `${v}${unit}`)

type Row = { section: string; item: string; metric: string; value: string | number }
const COLUMNS: CsvColumn<Row>[] = [
  { header: 'Section', accessor: (r) => r.section },
  { header: 'Item', accessor: (r) => r.item },
  { header: 'Metric', accessor: (r) => r.metric },
  { header: 'Value', accessor: (r) => r.value },
]

// Long format, one row per measured figure; nulls are left out, not written as 0.
function csvRows(r: SurveillanceReport): Row[] {
  const rows: Row[] = []
  const push = (section: string, item: string, metric: string, value: string | number | null) => {
    if (value !== null) rows.push({ section, item, metric, value })
  }
  const s = r.summary
  push('Report', '', 'Period', `${day(r.period_start)} – ${lastDay(r.period_end)} (UTC)`)
  push('Report', '', 'Period complete', r.period_complete ? 'yes' : 'no')
  push('Report', '', 'Previous period', `${day(r.previous_start)} – ${lastDay(r.previous_end)} (UTC)`)
  push('Report', '', 'Scope', r.scope)
  push('Report', '', 'Alerts / data quality scope', r.management_scope)
  push('Report', '', 'Generated at (UTC)', r.generated_at)
  push('Summary', '', 'Detections', s.no_device_reported ? 'No device reported' : s.detections)
  push('Summary', '', 'Detection events', s.no_device_reported ? null : s.detection_events)
  push('Summary', '', 'Top species', s.top_species)
  push('Summary', '', 'Unclassified detections', r.detections.unclassified)
  push('Summary', '', 'Previous period detections', s.previous_detections)
  push('Summary', '', 'Previous period devices reporting', s.previous_devices_reporting)
  push('Summary', '', 'Change', s.change)
  push('Summary', '', 'Change (%)', s.change_pct)
  push('Summary', '', 'Devices reporting', s.devices_reporting)
  push('Summary', '', 'Devices in scope', s.devices_total)
  push('Summary', '', 'Regions covered', s.regions_covered.join('; ') || null)
  for (const g of r.detections.by_genus) push('Detections by genus', g.name, 'Count', g.count)
  for (const g of r.detections.by_sex) push('Detections by sex', g.name, 'Count', g.count)
  for (const g of r.detections.by_species) push('Detections by species', g.name, 'Count', g.count)
  for (const g of r.detections.by_region) {
    push('Detections by region', g.region, 'Count', g.count)
    for (const c of g.communities) push('Detections by community', `${g.region} / ${c.community}`, 'Count', c.count)
  }
  // A day nobody reported on keeps an empty Count cell — not 0.
  for (const p of r.detections.daily) {
    rows.push({ section: 'Daily detections', item: p.date, metric: 'Count', value: p.count ?? '' })
    push('Daily detections', p.date, 'Devices reporting', p.devices_reporting)
  }
  for (const [name, m] of [['Temperature (°C)', r.environment.temperature], ['Humidity (%)', r.environment.humidity]] as const) {
    push('Environment', name, 'Readings', m.readings)
    push('Environment', name, 'Mean', m.mean)
    push('Environment', name, 'Min', m.min)
    push('Environment', name, 'Max', m.max)
  }
  push('Delivered alerts', '', 'Total', r.alerts.total)
  push('Delivered alerts', '', 'Handled', r.alerts.handled)
  for (const a of r.alerts.by_type) {
    push('Delivered alerts', a.type, 'Count', a.count)
    push('Delivered alerts', a.type, 'Handled', a.handled)
  }
  push('Data quality', '', 'Devices checked', r.data_quality.devices_checked)
  for (const d of r.data_quality.no_readings) push('Data quality', d.name, 'No readings', 'yes')
  for (const d of r.data_quality.long_silences)
    push('Data quality', d.name, `Silences > ${r.data_quality.offline_threshold_min} min`, d.silences_over_threshold)
  const m = r.manual_vs_ai
  if (m.collections) {
    push('Manual vs AI', '', 'Collections', m.collections)
    push('Manual vs AI', '', 'Collections compared', m.collections_compared)
    push('Manual vs AI', '', 'Collections not reporting (excluded)', m.collections_not_reporting)
    push('Manual vs AI', '', 'Manual total (compared collections only)', m.manual_total)
    push('Manual vs AI', '', 'AI total (compared collections only)', m.ai_total)
    push('Manual vs AI', '', 'Total |AI − manual| (compared collections only)', m.abs_difference)
  }
  return rows
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 break-inside-avoid">
      <h2 className="text-base font-semibold text-gray-900 border-b border-gray-200 pb-1">{title}</h2>
      {children}
    </section>
  )
}

const Empty = ({ text = NO_DATA }: { text?: string }) => <p className="text-sm text-gray-500 italic">{text}</p>

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="border border-gray-200 rounded-lg p-3">
      <div className="text-xs font-semibold text-gray-500">{label}</div>
      <div className="text-xl font-semibold text-gray-900 mt-1">{value}</div>
      {note && <div className="text-xs text-gray-500 mt-1">{note}</div>}
    </div>
  )
}

const th = 'px-3 py-2 text-left text-xs font-semibold text-gray-500'
const td = 'px-3 py-2 text-sm text-gray-700'

function Table({ head, rows }: { head: string[]; rows: (string | number)[][] }) {
  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      <table className="min-w-full divide-y divide-gray-100">
        <thead className="bg-gray-50">
          <tr>{head.map((h) => <th key={h} className={th}>{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((r, i) => (
            <tr key={i}>{r.map((c, j) => <td key={j} className={td}>{typeof c === 'number' ? c.toLocaleString() : c}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Report({ r }: { r: SurveillanceReport }) {
  const s = r.summary
  const d = r.detections
  const env = r.environment
  const dq = r.data_quality
  const m = r.manual_vs_ai
  const sign = (v: number) => (v >= 0 ? '+' : '')
  const prev = `${s.previous_detections.toLocaleString()} in the previous period (${s.previous_devices_reporting} device(s) reporting)`
  const change = s.change === null
    ? `Comparison available once the period ends. Previous period: ${prev}.`
    : s.change_pct === null
      ? `${sign(s.change)}${s.change.toLocaleString()} vs ${prev}; no % change (previous period had 0).`
      : `${sign(s.change)}${s.change.toLocaleString()} (${sign(s.change_pct)}${s.change_pct}%) vs ${prev}.`

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-gray-900">
          {r.period === 'weekly' ? 'Weekly' : 'Monthly'} surveillance report
        </h1>
        <p className="text-sm text-gray-600">
          {day(r.period_start)} – {lastDay(r.period_end)} (UTC) · {r.scope}
        </p>
        <p className="text-xs text-gray-500">
          Generated {formatTimestamp(r.generated_at)}. Live data only: test-mode data is excluded and nothing is
          estimated or filled in. Previous period: {day(r.previous_start)} – {lastDay(r.previous_end)}.
        </p>
        {!r.period_complete && (
          <p className="text-xs text-amber-700">This period is still in progress; figures cover it up to now.</p>
        )}
      </header>

      <Section title="1. Summary">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat label="Mosquitoes detected"
            value={s.no_device_reported ? 'No device reported' : s.detections.toLocaleString()} note={change} />
          <Stat label="Detection events" value={s.no_device_reported ? '—' : s.detection_events.toLocaleString()} />
          <Stat label="Devices reporting" value={`${s.devices_reporting} / ${s.devices_total}`}
            note="Sent at least one live reading or detection in the period (CSV-imported data counts; test-mode data does not)." />
          <Stat label="Regions covered" value={String(s.regions_covered.length)}
            note={s.regions_covered.join(', ') || 'No reporting device has a region.'} />
        </div>
        {s.top_species && <p className="text-sm text-gray-600">Most detected species: {s.top_species}</p>}
      </Section>

      <Section title="2. Detections">
        {s.no_device_reported ? <Empty text="No device reported in this period." />
          : s.detections === 0 ? <Empty text="No detections for this period." /> : (
          <>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={d.daily}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" name="Mosquitoes" fill="#2a78d6" isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-gray-500">Days with no bar: no device reported that day (not zero).</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {d.by_genus.length ? <Table head={['Genus', 'Count']} rows={d.by_genus.map((g) => [g.name, g.count])} /> : <Empty />}
              {d.by_sex.length ? <Table head={['Sex', 'Count']} rows={d.by_sex.map((g) => [g.name, g.count])} /> : <Empty />}
            </div>
            {d.by_species.length
              ? <Table head={['Species', 'Count']} rows={d.by_species.map((g) => [g.name, g.count])} />
              : <Empty />}
            {d.unclassified > 0 && (
              <p className="text-xs text-gray-500">{d.unclassified} detection(s) have no AI classification and are not in the genus/sex tables.</p>
            )}
            <Table head={['Region', 'Community', 'Count']}
              rows={d.by_region.flatMap((g) => g.communities.map((c) => [g.region, c.community, c.count]))} />
          </>
        )}
      </Section>

      <Section title="3. Environment">
        {env.readings === 0 ? <Empty text="No sensor readings for this period." /> : (
          <>
            <Table head={['Measure', 'Readings', 'Mean', 'Min', 'Max']} rows={[
              ['Temperature (°C)', env.temperature.readings, fmt(env.temperature.mean), fmt(env.temperature.min), fmt(env.temperature.max)],
              ['Humidity (%)', env.humidity.readings, fmt(env.humidity.mean), fmt(env.humidity.min), fmt(env.humidity.max)],
            ]} />
            <p className="text-xs text-gray-500">External sensor where present, otherwise internal. — = no value measured.</p>
          </>
        )}
      </Section>

      <p className="text-xs text-gray-500">Sections 4 and 5 cover: {r.management_scope}.</p>

      <Section title="4. Delivered alerts">
        {r.alerts.total === 0 ? <Empty text="No delivered alerts for this period." /> : (
          <>
            <p className="text-sm text-gray-700">{r.alerts.total} delivered alert(s), {r.alerts.handled} marked handled.</p>
            <Table head={['Type', 'Count', 'Handled']} rows={r.alerts.by_type.map((a) => [a.type.replaceAll('_', ' ').toLowerCase(), a.count, a.handled])} />
          </>
        )}
        <p className="text-xs text-gray-500">{r.alerts.note}</p>
      </Section>

      <Section title="5. Data quality">
        {dq.devices_checked === 0 ? <Empty text="No devices in scope." /> : (
          <>
            <p className="text-sm text-gray-700">
              {dq.devices_checked} device(s) checked. {dq.no_readings.length} sent no readings;
              {' '}{dq.long_silences.length} had silences longer than {dq.offline_threshold_min} min.
            </p>
            {dq.no_readings.length > 0 && (
              <Table head={['No readings', 'Region']} rows={dq.no_readings.map((x) => [x.name, x.region ?? '—'])} />
            )}
            {dq.long_silences.length > 0 && (
              <Table head={['Device', 'Silences over threshold', 'Longest silence (min)']}
                rows={dq.long_silences.map((x) => [x.name, x.silences_over_threshold ?? '—', x.longest_silence_min ?? '—'])} />
            )}
          </>
        )}
      </Section>

      <Section title="6. Manual vs AI counts">
        {m.collections === 0 ? <Empty text={m.message ?? NO_DATA} /> : (
          <>
            <Table head={['Collections', 'Compared', 'Manual total*', 'AI total*', 'Total |AI − manual|*']}
              rows={[[m.collections, m.collections_compared, m.manual_total, m.ai_total, m.abs_difference]]} />
            {m.collections_not_reporting > 0 && (
              <p className="text-xs text-amber-700">{m.collections_not_reporting} collection(s) left out: the device sent no data during them.</p>
            )}
            <p className="text-xs text-gray-500">* Compared collections only. {m.rule}</p>
          </>
        )}
      </Section>
    </div>
  )
}

export default function ReportsPage() {
  const [period, setPeriod] = useState<ReportPeriod>('weekly')
  const [end, setEnd] = useState(today)
  const [region, setRegion] = useState('')
  const { data: options } = useMosquitoFilterOptions()
  const { data, isLoading, error } = useSurveillanceReport(period, end, region || undefined)

  const control = 'text-sm px-3 py-1.5 rounded-lg border border-gray-300 bg-white'

  return (
    <div className="w-full flex flex-col bg-white font-raleway rounded-lg py-6 px-4 sm:py-8 sm:px-8 gap-6 print:p-0">
      <div className="flex flex-col gap-3 print:hidden">
        <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <FileBarChart size={20} /> Reports
        </h1>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex gap-2">
            {(['weekly', 'monthly'] as const).map((p) => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`text-sm px-3 py-1.5 rounded-lg border ${period === p
                  ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
                {p === 'weekly' ? 'Weekly' : 'Monthly'}
              </button>
            ))}
          </div>
          <label className="text-xs text-gray-500 flex flex-col gap-1">
            {period === 'weekly' ? 'Week ending (UTC)' : 'Any day in month (UTC)'}
            <input type="date" value={end} max={today()} onChange={(e) => setEnd(e.target.value)} className={control} />
          </label>
          <label className="text-xs text-gray-500 flex flex-col gap-1">
            Region
            <select value={region} onChange={(e) => setRegion(e.target.value)} className={control}>
              <option value="">All regions</option>
              {options?.regions.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </label>
          <div className="flex gap-2 ml-auto">
            <button onClick={() => window.print()} disabled={!data} className={`${control} flex items-center gap-2 disabled:opacity-40`}>
              <Printer size={15} /> Print / Save as PDF
            </button>
            <button onClick={() => data && downloadCsv(`surveillance_report_${data.period}_${end}`, COLUMNS, csvRows(data))}
              disabled={!data} className={`${control} flex items-center gap-2 disabled:opacity-40`}>
              <Download size={15} /> Download CSV
            </button>
          </div>
        </div>
      </div>

      {!end ? (
        <Empty text="Choose a date." />
      ) : isLoading ? (
        <Skeleton count={6} height={48} className="mb-2" />
      ) : error || !data ? (
        <p className="text-sm text-red-500">{error?.message || 'Failed to load the report.'}</p>
      ) : (
        <Report r={data} />
      )}
    </div>
  )
}
