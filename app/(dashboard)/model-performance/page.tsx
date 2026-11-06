'use client'
import React, { useState } from 'react'
import { Gauge } from 'lucide-react'
import Skeleton from 'react-loading-skeleton'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useModelPerformance } from '@/hooks/monitoring'
import { formatTimestamp } from '@/lib/date'
import type { KeyConfidence } from '@/queries/monitoring/monitoringQueries'

const DAY_OPTIONS = [30, 90, 365]
const TARGET_LABELS: Record<string, string> = { detection: 'Detection', sex: 'Sex', age: 'Age' }

const pct = (v: number | null) => (v === null ? '—' : `${Math.round(v * 100)}%`)
const num = (v: number | null, digits = 2) => (v === null ? '—' : v.toFixed(digits))

function StatCard({ title, value, note }: { title: string; value: string; note: string }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="text-xs font-semibold text-gray-500">{title}</div>
      <div className="text-2xl font-semibold text-gray-900 mt-1">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{note}</div>
    </div>
  )
}

function ConfidenceCard({ title, s, note }: { title: string; s: KeyConfidence; note: string }) {
  return (
    <StatCard
      title={title}
      value={num(s.mean)}
      note={`${note} Mean of ${s.measured.toLocaleString()} detections (${s.zero_at_reported_key.toLocaleString()} with exactly 0); ${s.missing.toLocaleString()} without a value are left out.`}
    />
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      {children}
    </section>
  )
}

export default function ModelPerformancePage() {
  const [days, setDays] = useState(30)
  const { data, isLoading, error } = useModelPerformance(days)

  const th = 'px-4 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap'
  const td = 'px-4 py-3 align-top text-sm text-gray-700'

  return (
    <div className="w-full flex flex-col bg-white font-raleway rounded-lg py-6 px-4 sm:py-8 sm:px-8 gap-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Gauge size={20} /> Model Performance
          </h1>
          <p className="text-sm text-gray-500 mt-1 max-w-3xl">
            Only what is actually measured. Confidence is the model&apos;s own certainty about each
            detection, not its accuracy. Live detections only; test-mode data is left out. Nothing here
            is estimated or filled in.
          </p>
        </div>
        <div className="flex gap-2">
          {DAY_OPTIONS.map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`text-sm px-3 py-1.5 rounded-lg border ${
                days === d ? 'bg-gray-900 text-white border-gray-900'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {d} days
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <Skeleton count={5} height={48} className="mb-2" />
      ) : error || !data ? (
        <p className="text-sm text-red-500">Failed to load the model-performance report.</p>
      ) : (
        <>
          <Section title="Accuracy targets">
            <ul className="space-y-2">
              {data.targets.map((t) => (
                <li key={t.name} className="border border-gray-200 rounded-lg p-4 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-gray-900">{TARGET_LABELS[t.name] ?? t.name}</span>
                    <span className="text-gray-500">target &gt;{t.target_pct}%</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                      Not measurable yet
                    </span>
                  </div>
                  <p className="text-gray-500 mt-1">{t.reason}</p>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Confidence (measured)">
            {data.confidence.detections === 0 ? (
              <p className="text-sm text-gray-400 py-6 text-center">No live detections in this period.</p>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <StatCard
                    title="Detections"
                    value={data.confidence.detections.toLocaleString()}
                    note="Live detections from devices you can see in this period."
                  />
                  <StatCard
                    title="Mean mosquito confidence"
                    value={num(data.confidence.p_mosq.mean)}
                    note={`p_mosq: how sure the model is it saw a mosquito (0–1). Mean of ${data.confidence.p_mosq.measured.toLocaleString()} detections; ${data.confidence.p_mosq.missing.toLocaleString()} without a value are left out.`}
                  />
                  <StatCard
                    title={`Below ${data.low_confidence_threshold} confidence`}
                    value={pct(data.confidence.p_mosq.below_low_share)}
                    note={`${data.confidence.p_mosq.below_low.toLocaleString()} detections the model was unsure about.`}
                  />
                  <ConfidenceCard title="Mean genus confidence" s={data.confidence.genus_confidence}
                    note="The model's probability for the genus it reported." />
                  <ConfidenceCard title="Mean sex confidence" s={data.confidence.sex_confidence}
                    note="The model's probability for the sex it reported." />
                  <StatCard
                    title="Rejected by the model"
                    value={data.confidence.binary_decision_false.toLocaleString()}
                    note={`Detections where the model's own yes/no said "not a mosquito"; ${data.confidence.binary_decision_missing.toLocaleString()} had no decision.`}
                  />
                  <StatCard
                    title="Inference time"
                    value={data.confidence.inference_ms.mean_ms === null ? '—' : `${Math.round(data.confidence.inference_ms.mean_ms)} ms`}
                    note={`Mean time the device took per detection; max ${data.confidence.inference_ms.max_ms ?? '—'} ms.`}
                  />
                  <StatCard
                    title="Age reported"
                    value={data.confidence.age_group_reported.toLocaleString()}
                    note={data.confidence.age_group_reported === 0
                      ? 'No detection in this period has an age value, so age can\'t be assessed.'
                      : 'Detections with an age value. None is checked by a person, so age accuracy can\'t be assessed.'}
                  />
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-2">
                    How many detections fall in each mosquito-confidence (p_mosq) range.
                  </p>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.confidence.p_mosq.buckets}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="count" name="Detections" fill="#2a78d6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Excludes {data.confidence.p_mosq.missing.toLocaleString()} detections without a confidence value.
                  </p>
                </div>

                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className={th}>Genus (as reported)</th>
                        <th className={th}>Detections</th>
                        <th className={th}>Mean genus confidence</th>
                        <th className={th}>No confidence value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {data.confidence.by_genus.map((g) => (
                        <tr key={g.genus}>
                          <td className={`${td} capitalize`}>{g.genus}</td>
                          <td className={td}>{g.detections.toLocaleString()}</td>
                          <td className={td}>{num(g.genus_confidence.mean)}</td>
                          <td className={td}>{g.genus_confidence.missing.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </Section>

          <Section title="Agreement with manual trap counts">
            <p className="text-xs text-gray-500 max-w-3xl">
              Compares how many mosquitoes staff counted by hand with how many the device counted over the
              same collection period, for each genus/sex group that was counted. This is count agreement,
              not per-detection accuracy: a hand count can&apos;t tell which individual detection was right.
              Differences are added up per group as absolute values, so an over-count in one place never
              cancels an under-count in another. {data.agreement.collection_rule}
            </p>
            {data.agreement.collections.length === 0 ? (
              <p className="text-sm text-gray-400 py-6 text-center">
                Count agreement can&apos;t be computed yet — no manual trap counts in this period.
              </p>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <StatCard title="Manual count" value={data.agreement.manual_total.toLocaleString()}
                    note={`Total counted by hand across ${data.agreement.collections_compared} collections.`} />
                  <StatCard title="AI count" value={data.agreement.ai_total.toLocaleString()}
                    note="Device detections in the same periods and groups." />
                  <StatCard title="Total difference" value={data.agreement.abs_difference.toLocaleString()}
                    note="Sum of |AI − manual| over every counted group. 0 = every group matches." />
                  <StatCard title="Groups matching exactly" value={pct(data.agreement.exact_match_share)}
                    note={`${data.agreement.groups_exact_match} of ${data.agreement.groups_compared} counted genus/sex groups where AI = manual.`} />
                </div>
                {data.agreement.collections_not_reporting > 0 && (
                  <p className="text-xs text-amber-700">
                    {data.agreement.collections_not_reporting} collection(s) left out of the totals: the device
                    sent no data during the period, so its count of 0 is not a measurement.
                  </p>
                )}
                {data.agreement.by_genus.length > 0 && (
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-100">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className={th}>Genus</th>
                          <th className={th}>Groups</th>
                          <th className={th}>Manual</th>
                          <th className={th}>AI</th>
                          <th className={th}>Total difference</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {data.agreement.by_genus.map((g) => (
                          <tr key={g.genus}>
                            <td className={`${td} capitalize`}>{g.genus}</td>
                            <td className={td}>{g.groups}</td>
                            <td className={td}>{g.manual.toLocaleString()}</td>
                            <td className={td}>{g.ai.toLocaleString()}</td>
                            <td className={td}>{g.abs_difference.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className={th}>Device</th>
                        <th className={th}>Period</th>
                        <th className={th}>Manual</th>
                        <th className={th}>AI</th>
                        <th className={th}>Total difference</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {data.agreement.collections.map((c) => (
                        <tr key={`${c.device_id}-${c.period_start}-${c.period_end}`}>
                          <td className={td}>{c.device_name}</td>
                          <td className={`${td} whitespace-nowrap`}>
                            {formatTimestamp(c.period_start)} – {formatTimestamp(c.period_end)}
                          </td>
                          <td className={td}>{c.manual_total.toLocaleString()}</td>
                          <td className={td}>
                            {c.device_reporting ? c.ai_total.toLocaleString()
                              : <span className="text-amber-700">Device not reporting</span>}
                          </td>
                          <td className={td}>{c.device_reporting ? c.abs_difference.toLocaleString() : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </Section>
        </>
      )}
    </div>
  )
}
