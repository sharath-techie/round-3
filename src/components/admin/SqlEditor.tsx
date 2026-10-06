'use client';

import dynamic from 'next/dynamic';
import { sql } from '@codemirror/lang-sql';
import { keymap } from '@codemirror/view';
import { format as formatSql } from 'sql-formatter';
import {
  Activity,
  Braces,
  Check,
  ChevronDown,
  CircleAlert,
  Code2,
  Columns3,
  Database,
  FilePlus2,
  Files,
  FolderTree,
  History,
  LoaderCircle,
  Play,
  Save,
  Search,
  ShieldCheck,
  Table2,
  Trash2,
  X,
  Zap,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ViewUpdate } from '@codemirror/view';

const CodeMirrorEditor = dynamic(
  () => import('@uiw/react-codemirror').then((module) => module.default),
  { ssr: false, loading: () => <div className="h-72 animate-pulse bg-slate-950" /> },
);

type ExplorerKind = 'tables' | 'functions' | 'triggers' | 'enums' | 'extensions' | 'policies' | 'migrations';
type ExplorerItem = Record<string, unknown> & { name?: string; schema_name?: string; kind?: string };
type Column = {
  name: string;
  data_type: string;
  nullable: boolean;
  default_value: string | null;
  is_primary_key: boolean;
};
type TableDetail = {
  schema: string;
  table: string;
  kind: string;
  rlsEnabled: boolean;
  rowCount: string;
  columns: Column[];
  indexes: { indexname: string; indexdef: string }[];
  policies: { policyname: string; permissive: string; roles: string[]; cmd: string; qual: string | null; with_check: string | null }[];
  foreignKeys: { name: string; column_name: string; referenced_schema: string; referenced_table: string; referenced_column: string }[];
};
type QueryResult = {
  status: 'SUCCESS' | 'ERROR';
  command: string | null;
  rowCount: number;
  statements: { command: string | null; rowCount: number | null; rows: Record<string, unknown>[]; truncated: boolean }[];
  durationMs: number;
  error: { message: string; code: string | null } | null;
  warning: string | null;
};
type SavedQuery = { id: string; name: string; query_text: string; updated_at: string };
type HistoryEntry = {
  id: string;
  query_text: string;
  status: 'SUCCESS' | 'ERROR';
  command: string | null;
  result_count: number;
  duration_ms: number;
  error_message: string | null;
  created_at: string;
};

const sections: { kind: ExplorerKind; label: string; icon: typeof Table2 }[] = [
  { kind: 'tables', label: 'Tables & Views', icon: Table2 },
  { kind: 'functions', label: 'Functions', icon: Braces },
  { kind: 'triggers', label: 'Triggers', icon: Zap },
  { kind: 'enums', label: 'Enums', icon: Columns3 },
  { kind: 'extensions', label: 'Extensions', icon: Files },
  { kind: 'policies', label: 'RLS Policies', icon: ShieldCheck },
  { kind: 'migrations', label: 'Migrations', icon: History },
];

const DEFAULT_QUERY = 'SELECT *\nFROM public.projects\nLIMIT 50;';

async function readResponse<T>(response: Response): Promise<T> {
  const body = await response.json();
  if (!response.ok) throw new Error(body.error ?? 'The request failed.');
  return body as T;
}

function quoteIdentifier(identifier: string) {
  return `"${identifier.replaceAll('"', '""')}"`;
}

export function SqlEditor() {
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [items, setItems] = useState<ExplorerItem[]>([]);
  const [kind, setKind] = useState<ExplorerKind>('tables');
  const [selectedTable, setSelectedTable] = useState<TableDetail | null>(null);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [saved, setSaved] = useState<SavedQuery[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [activeSavedId, setActiveSavedId] = useState<string | null>(null);
  const [panel, setPanel] = useState<'data' | 'structure' | 'indexes' | 'policies'>('data');
  const [cursor, setCursor] = useState({ line: 1, column: 1 });
  const [loadingExplorer, setLoadingExplorer] = useState(true);
  const [running, setRunning] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [saveName, setSaveName] = useState('');
  const [saveDialog, setSaveDialog] = useState(false);
  const [saveAs, setSaveAs] = useState(false);
  const [pendingMutation, setPendingMutation] = useState<string | null>(null);
  const [explorerSearch, setExplorerSearch] = useState('');
  const [activeStatement, setActiveStatement] = useState(0);

  const extension = useMemo(() => {
    const schema: Record<string, string[]> = {};
    for (const item of items) {
      if (item.name && item.kind?.includes('TABLE')) schema[item.name] = [];
    }
    if (selectedTable) schema[selectedTable.table] = selectedTable.columns.map((column) => column.name);
    return sql({ schema, upperCaseKeywords: true });
  }, [items, selectedTable]);

  const loadExplorer = useCallback(async (nextKind: ExplorerKind) => {
    setLoadingExplorer(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/sql/schema?kind=${nextKind}`);
      const data = await readResponse<{ items: ExplorerItem[] }>(response);
      setItems(data.items);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Database metadata could not be loaded.');
    } finally {
      setLoadingExplorer(false);
    }
  }, []);

  const loadSaved = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/sql/saved-queries');
      const data = await readResponse<{ queries: SavedQuery[] }>(response);
      setSaved(data.queries);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Saved queries could not be loaded.');
    }
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/sql/history?limit=50');
      const data = await readResponse<{ history: HistoryEntry[] }>(response);
      setHistory(data.history);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Query history could not be loaded.');
    }
  }, []);

  useEffect(() => {
    void loadExplorer('tables');
    void loadSaved();
    void loadHistory();
  }, [loadExplorer, loadHistory, loadSaved]);

  const selectKind = async (nextKind: ExplorerKind) => {
    setKind(nextKind);
    setSelectedTable(null);
    setItems([]);
    await loadExplorer(nextKind);
  };

  const inspectTable = async (item: ExplorerItem) => {
    if (!item.name || !item.schema_name) return;
    setKind('tables');
    setPanel('structure');
    setLoadingDetails(true);
    setError(null);
    try {
      const params = new URLSearchParams({ kind: 'tables', schema: item.schema_name, table: item.name });
      const response = await fetch(`/api/admin/sql/schema?${params.toString()}`);
      const data = await readResponse<{ detail: TableDetail }>(response);
      setSelectedTable(data.detail);
    } catch (detailError) {
      setError(detailError instanceof Error ? detailError.message : 'Table details could not be loaded.');
    } finally {
      setLoadingDetails(false);
    }
  };

  const execute = async (sqlText: string, explain = false, confirmed = false) => {
    const normalized = sqlText.trim();
    if (!normalized) {
      setError('Enter a SQL query to execute.');
      return;
    }
    if (explain && !/^(select|with)\b/i.test(normalized)) {
      setError('Explain is available for SELECT and WITH queries only.');
      return;
    }
    const destructive = /\b(insert|update|delete|truncate|create|alter|drop|grant|revoke)\b/i.test(normalized);
    if (destructive && !confirmed && !explain) {
      setPendingMutation(normalized);
      return;
    }

    setRunning(true);
    setResult(null);
    setError(null);
    setWarning(null);
    setSelectedTable(null);
    try {
      const sqlToRun = explain ? `EXPLAIN (FORMAT JSON) ${normalized}` : normalized;
      const response = await fetch('/api/admin/sql/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: sqlToRun }),
      });
      const data = await readResponse<QueryResult>(response);
      setResult(data);
      setActiveStatement(Math.max(0, data.statements.length - 1));
      setWarning(data.warning);
      if (data.status === 'ERROR') setError(data.error?.message ?? 'Query failed.');
      void loadHistory();
    } catch (runError) {
      setError(runError instanceof Error ? runError.message : 'SQL query could not be executed.');
    } finally {
      setRunning(false);
    }
  };

  const onRun = () => void execute(query);
  const openSaveDialog = (asNew = false) => {
    const activeSaved = saved.find((entry) => entry.id === activeSavedId);
    setSaveAs(asNew);
    setSaveName(asNew ? '' : activeSaved?.name ?? '');
    setSaveDialog(true);
    setError(null);
  };

  const saveQuery = async () => {
    const existing = saveAs ? null : saved.find((entry) => entry.id === activeSavedId);
    try {
      const response = await fetch(existing ? `/api/admin/sql/saved-queries/${existing.id}` : '/api/admin/sql/saved-queries', {
        method: existing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: saveName, query }),
      });
      const data = await readResponse<{ query: SavedQuery }>(response);
      setActiveSavedId(data.query.id);
      setSaveDialog(false);
      await loadSaved();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Query could not be saved.');
    }
  };

  const deleteSavedQuery = async (savedQuery: SavedQuery) => {
    if (!window.confirm(`Delete saved query "${savedQuery.name}"?`)) return;
    try {
      const response = await fetch(`/api/admin/sql/saved-queries/${savedQuery.id}`, { method: 'DELETE' });
      await readResponse(response);
      if (activeSavedId === savedQuery.id) setActiveSavedId(null);
      await loadSaved();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Saved query could not be deleted.');
    }
  };

  const cursorUpdate = (update: ViewUpdate) => {
    const position = update.state.selection.main.head;
    const line = update.state.doc.lineAt(position);
    setCursor({ line: line.number, column: position - line.from + 1 });
  };

  const visibleItems = items.filter((item) => (
    `${item.schema_name ?? ''}.${item.name ?? ''}`.toLowerCase().includes(explorerSearch.toLowerCase())
  ));
  const activeRows = result?.statements[activeStatement]?.rows ?? [];
  const resultColumns = activeRows[0] ? Object.keys(activeRows[0]) : [];

  return (
    <main className="flex h-[calc(100dvh-4rem)] min-h-[620px] overflow-hidden bg-slate-100 text-slate-900">
      <aside className="flex w-72 shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-4">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-lg bg-slate-900 text-teal-300"><Database className="size-4" /></span>
            <div><h1 className="text-sm font-semibold">Database</h1><p className="text-[10px] text-slate-500">Gardenia · Supabase PostgreSQL</p></div>
          </div>
        </div>
        <div className="border-b border-slate-200 p-3">
          <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Database Explorer</p>
          <nav className="space-y-0.5">
            {sections.map(({ kind: sectionKind, label, icon: Icon }) => (
              <button key={sectionKind} onClick={() => void selectKind(sectionKind)} type="button"
                className={`flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs ${kind === sectionKind && !selectedTable ? 'bg-teal-50 font-semibold text-teal-900' : 'text-slate-600 hover:bg-slate-50'}`}>
                <Icon className="size-3.5" />{label}
              </button>
            ))}
          </nav>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          <div className="flex items-center justify-between px-2 pb-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{kind === 'tables' ? 'Tables & Views' : sections.find((section) => section.kind === kind)?.label}</p>
            {loadingExplorer && <LoaderCircle className="size-3 animate-spin text-slate-400" />}
          </div>
          {kind === 'tables' && (
            <label className="mb-2 flex items-center gap-2 rounded-md border border-slate-200 px-2 py-1.5 text-slate-400">
              <Search className="size-3" /><input className="min-w-0 flex-1 text-xs text-slate-800 outline-none" placeholder="Filter objects" value={explorerSearch} onChange={(event) => setExplorerSearch(event.target.value)} />
            </label>
          )}
          <ul className="space-y-0.5">
            {visibleItems.map((item, index) => (
              <li key={`${item.schema_name ?? ''}.${item.name ?? index}`}>
                <button className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-slate-600 hover:bg-slate-50"
                  onClick={() => {
                    if (kind === 'tables') {
                      void inspectTable(item);
                    } else if (item.name) {
                      const schemaName = item.schema_name ? `${quoteIdentifier(item.schema_name)}.` : '';
                      setActiveSavedId(null);
                      if (kind === 'functions' && typeof item.arguments === 'string') {
                        const signature = `${item.schema_name}.${item.name}(${item.arguments})`.replaceAll("'", "''");
                        setQuery(`SELECT pg_get_functiondef('${signature}'::regprocedure);`);
                      } else if (kind === 'triggers') {
                        const triggerName = String(item.name).replaceAll("'", "''");
                        setQuery(`SELECT * FROM information_schema.triggers WHERE trigger_name = '${triggerName}';`);
                      } else if (kind === 'policies') {
                        const policyName = String(item.name).replaceAll("'", "''");
                        setQuery(`SELECT * FROM pg_policies WHERE policyname = '${policyName}';`);
                      } else if (kind === 'migrations') {
                        const version = String(item.version ?? '').replaceAll("'", "''");
                        setQuery(`SELECT * FROM supabase_migrations.schema_migrations WHERE version = '${version}';`);
                      } else if (kind === 'enums') {
                        const enumName = String(item.name).replaceAll("'", "''");
                        setQuery(`SELECT enumlabel FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid WHERE t.typname = '${enumName}' ORDER BY e.enumsortorder;`);
                      } else if (kind === 'extensions') {
                        const extensionName = String(item.name).replaceAll("'", "''");
                        setQuery(`SELECT * FROM pg_extension WHERE extname = '${extensionName}';`);
                      } else {
                        setQuery(`SELECT * FROM ${schemaName}${quoteIdentifier(item.name)};`);
                      }
                    }
                  }} type="button">
                  {kind === 'tables' ? <Table2 className="size-3.5 shrink-0 text-indigo-500" /> : <Code2 className="size-3.5 shrink-0 text-slate-400" />}
                  <span className="min-w-0 flex-1 truncate">{item.schema_name ? `${item.schema_name}.` : ''}{item.name ?? JSON.stringify(item)}</span>
                  {typeof item.estimated_rows === 'number' && <span className="text-[9px] text-slate-400">~{item.estimated_rows}</span>}
                  {typeof item.rls_enabled === 'boolean' && <span title={item.rls_enabled ? 'RLS enabled' : 'RLS disabled'} className={`size-1.5 rounded-full ${item.rls_enabled ? 'bg-emerald-500' : 'bg-rose-500'}`} />}
                </button>
              </li>
            ))}
          </ul>
          {kind === 'tables' && !loadingExplorer && visibleItems.length === 0 && <p className="px-2 py-4 text-xs text-slate-400">No database objects found.</p>}
          <div className="my-4 border-t border-slate-100 pt-3">
            <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Saved Queries</p>
            {saved.map((entry) => (
              <div className="group flex items-center gap-1" key={entry.id}>
                <button className={`min-w-0 flex-1 truncate rounded px-2 py-1.5 text-left text-xs ${activeSavedId === entry.id ? 'bg-indigo-50 text-indigo-800' : 'text-slate-600 hover:bg-slate-50'}`}
                  onClick={() => { setQuery(entry.query_text); setActiveSavedId(entry.id); setSelectedTable(null); }} type="button">
                  <FilePlus2 className="mr-2 inline size-3.5" />{entry.name}
                </button>
                <button className="hidden p-1 text-slate-400 hover:text-rose-600 group-hover:block" aria-label={`Delete ${entry.name}`} onClick={() => void deleteSavedQuery(entry)} type="button"><Trash2 className="size-3" /></button>
              </div>
            ))}
            {saved.length === 0 && <p className="px-2 py-1 text-[10px] text-slate-400">No saved queries.</p>}
          </div>
          <div className="border-t border-slate-100 pt-3">
            <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Recent Queries</p>
            {history.map((entry) => (
              <button key={entry.id} className="block w-full truncate rounded px-2 py-1.5 text-left text-[10px] text-slate-500 hover:bg-slate-50"
                onClick={() => { setQuery(entry.query_text); setActiveSavedId(null); }} type="button" title={entry.query_text}>
                <span className={`mr-1.5 inline-block size-1.5 rounded-full ${entry.status === 'SUCCESS' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                {entry.query_text.replace(/\s+/g, ' ')}
              </button>
            ))}
          </div>
        </div>
        <div className="border-t border-slate-200 px-3 py-2 text-[10px] text-slate-500">
          <ShieldCheck className="mr-1 inline size-3 text-emerald-600" />Admin session · server-side connection
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex min-h-14 flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-2 rounded-md bg-slate-100 px-2.5 py-1.5 text-xs font-semibold"><Code2 className="size-3.5 text-indigo-600" />SQL Editor <ChevronDown className="size-3 text-slate-400" /></span>
            <span className="hidden text-[10px] text-slate-400 md:inline">PostgreSQL · gardenia</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <button className="toolbar-button" onClick={() => { setQuery(''); setResult(null); setSelectedTable(null); setActiveSavedId(null); }} type="button"><FilePlus2 className="size-3.5" />New</button>
            <button className="toolbar-button" onClick={() => { setQuery(''); setResult(null); setError(null); setActiveSavedId(null); }} type="button"><X className="size-3.5" />Clear</button>
            <button className="toolbar-button bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-50" disabled={running} onClick={onRun} type="button">
              {running ? <LoaderCircle className="size-3.5 animate-spin" /> : <Play className="size-3.5 fill-current" />}{running ? 'Running…' : 'Run'} <kbd className="ml-1 hidden rounded bg-emerald-800 px-1 text-[9px] sm:inline">Ctrl↵</kbd>
            </button>
            <button className="toolbar-button" disabled={running} onClick={() => { void execute(query, true); }} type="button"><Activity className="size-3.5" />Explain</button>
            <button className="toolbar-button" onClick={() => setQuery((current) => formatSql(current, { language: 'postgresql' }))} type="button"><Braces className="size-3.5" />Format</button>
            <button className="toolbar-button" onClick={() => openSaveDialog()} type="button"><Save className="size-3.5" />Save</button>
            <button className="toolbar-button" onClick={() => openSaveDialog(true)} type="button"><FilePlus2 className="size-3.5" />Save as</button>
            <button className="toolbar-button" onClick={() => { void loadHistory(); }} type="button"><History className="size-3.5" />History</button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col">
          {error && <div className="flex items-start gap-2 border-b border-rose-200 bg-rose-50 px-4 py-2.5 text-xs text-rose-800"><CircleAlert className="mt-0.5 size-3.5 shrink-0" />{error}<button className="ml-auto" onClick={() => setError(null)} type="button" aria-label="Dismiss error"><X className="size-3.5" /></button></div>}
          {warning && <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-900">{warning}</div>}

          <div className="min-h-[240px] flex-[0.9] overflow-hidden border-b border-slate-800 bg-slate-950">
            <CodeMirrorEditor value={query} height="100%" minHeight="240px" theme="dark" extensions={[extension, keymap.of([{ key: 'Mod-Enter', run: () => { onRun(); return true; } }])]}
              basicSetup={{ lineNumbers: true, foldGutter: true, highlightActiveLine: true, bracketMatching: true, autocompletion: true, indentOnInput: true, closeBrackets: true }}
              onChange={setQuery}
              onUpdate={cursorUpdate}
              className="h-full font-mono text-[13px]" />
          </div>

          <section className="flex min-h-[220px] flex-[1.1] flex-col overflow-hidden bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2">
              <div className="flex items-center gap-3">
                {selectedTable ? (
                  <>
                    <span className="flex items-center gap-2 text-xs font-semibold"><Table2 className="size-3.5 text-indigo-600" />{selectedTable.schema}.{selectedTable.table}</span>
                    {(['data', 'structure', 'indexes', 'policies'] as const).map((tab) => <button key={tab} className={`border-b-2 px-1 py-2 text-[10px] capitalize ${panel === tab ? 'border-teal-600 font-semibold text-teal-800' : 'border-transparent text-slate-500'}`} onClick={() => setPanel(tab)} type="button">{tab}</button>)}
                  </>
                ) : (
                  <>
                    <span className="text-xs font-semibold">Results</span>
                    {result?.statements.map((statement, index) => <button key={index} className={`rounded px-2 py-1 text-[10px] ${activeStatement === index ? 'bg-indigo-50 text-indigo-800' : 'text-slate-500'}`} onClick={() => setActiveStatement(index)} type="button">{statement.command ?? `Statement ${index + 1}`}</button>)}
                  </>
                )}
              </div>
              <div className="flex items-center gap-3 text-[10px] text-slate-500">
                {selectedTable && <span>{selectedTable.rowCount} rows · RLS {selectedTable.rlsEnabled ? 'enabled' : 'disabled'}</span>}
                {result && <><span className={result.status === 'SUCCESS' ? 'text-emerald-700' : 'text-rose-700'}>{result.status}</span><span>{result.rowCount} rows · {result.durationMs} ms</span></>}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-auto">
              {loadingDetails && <div className="flex h-full items-center justify-center text-xs text-slate-500"><LoaderCircle className="mr-2 size-4 animate-spin" />Loading table metadata…</div>}
              {!loadingDetails && selectedTable && panel === 'data' && (
                <div className="p-3">
                  <button className="mb-3 rounded-md bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-800 hover:bg-indigo-100" onClick={() => {
                    const dataQuery = `SELECT * FROM ${quoteIdentifier(selectedTable.schema)}.${quoteIdentifier(selectedTable.table)} LIMIT 50;`;
                    setQuery(dataQuery);
                    setActiveSavedId(null);
                    setSelectedTable(null);
                    void execute(dataQuery);
                  }} type="button"><Search className="mr-1 inline size-3" />Load first 50 rows</button>
                  <p className="text-xs text-slate-500">Use the editor to run a SELECT query. Exact row counts and table metadata are shown from the live database catalog.</p>
                </div>
              )}
              {!loadingDetails && selectedTable && panel === 'structure' && <div><MetadataTable rows={selectedTable.columns} columns={['name', 'data_type', 'nullable', 'default_value', 'is_primary_key']} /><h3 className="border-y border-slate-200 bg-slate-50 px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Foreign keys</h3><MetadataTable rows={selectedTable.foreignKeys} columns={['name', 'column_name', 'referenced_schema', 'referenced_table', 'referenced_column']} /></div>}
              {!loadingDetails && selectedTable && panel === 'indexes' && <MetadataTable rows={selectedTable.indexes} columns={['indexname', 'indexdef']} />}
              {!loadingDetails && selectedTable && panel === 'policies' && <MetadataTable rows={selectedTable.policies} columns={['policyname', 'roles', 'cmd', 'permissive', 'qual', 'with_check']} />}
              {!selectedTable && activeRows.length > 0 && <ResultsTable rows={activeRows} truncated={result?.statements[activeStatement]?.truncated ?? false} />}
              {!selectedTable && result && activeRows.length === 0 && result.status === 'SUCCESS' && <div className="p-5 text-xs text-slate-500"><Check className="mr-1 inline size-3 text-emerald-600" />Query completed. {result.rowCount} rows affected or returned.</div>}
              {!selectedTable && result?.error && <div className="m-4 rounded-lg border border-rose-200 bg-rose-50 p-3 font-mono text-xs text-rose-800">{result.error.code && <strong className="mr-2">{result.error.code}</strong>}{result.error.message}</div>}
              {!selectedTable && !result && !error && !loadingDetails && <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400"><FolderTree className="size-7" /><p className="text-xs">Run a query to view results.</p></div>}
            </div>
            <footer className="flex items-center justify-between border-t border-slate-200 px-3 py-1.5 text-[10px] text-slate-400">
              <span>PostgreSQL · UTF-8</span><span>Ln {cursor.line}, Col {cursor.column}</span>
            </footer>
          </section>
        </div>
      </section>

      {saveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <section className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between"><h2 className="font-semibold">Save SQL query</h2><button onClick={() => setSaveDialog(false)} type="button" aria-label="Close"><X className="size-4" /></button></div>
            <label className="mt-4 block text-xs font-medium text-slate-700">Query name
              <input className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" autoFocus maxLength={120} value={saveName} onChange={(event) => setSaveName(event.target.value)} />
            </label>
            <div className="mt-4 flex justify-end gap-2"><button className="toolbar-button" onClick={() => setSaveDialog(false)} type="button">Cancel</button><button className="toolbar-button bg-teal-700 text-white" disabled={!saveName.trim()} onClick={() => void saveQuery()} type="button"><Save className="size-3.5" />Save query</button></div>
          </section>
        </div>
      )}
      {pendingMutation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <section className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl">
            <div className="flex items-center gap-2 text-amber-800"><CircleAlert className="size-5" /><h2 className="font-semibold">Confirm database change</h2></div>
            <p className="mt-2 text-sm text-slate-600">This query may modify or remove database objects or records. SQL Editor actions run with the configured server database role.</p>
            <pre className="mt-3 max-h-36 overflow-auto rounded bg-slate-950 p-3 text-xs text-slate-100">{pendingMutation}</pre>
            <div className="mt-4 flex justify-end gap-2"><button className="toolbar-button" onClick={() => setPendingMutation(null)} type="button">Cancel</button><button className="toolbar-button bg-rose-700 text-white hover:bg-rose-800" onClick={() => { const pending = pendingMutation; setPendingMutation(null); void execute(pending, false, true); }} type="button"><Play className="size-3.5" />Run anyway</button></div>
          </section>
        </div>
      )}
    </main>
  );
}

function MetadataTable({ rows, columns }: { rows: Record<string, unknown>[]; columns: string[] }) {
  if (!rows.length) return <p className="p-5 text-xs text-slate-500">No metadata found.</p>;
  return <div className="overflow-auto"><table className="min-w-full text-left text-xs"><thead className="sticky top-0 bg-slate-50 text-slate-500"><tr>{columns.map((column) => <th className="px-3 py-2 font-semibold" key={column}>{column.replaceAll('_', ' ')}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{rows.map((row, index) => <tr key={index}>{columns.map((column) => <td className="max-w-md break-all px-3 py-2 text-slate-700" key={column}>{formatCell(row[column])}</td>)}</tr>)}</tbody></table></div>;
}

function ResultsTable({ rows, truncated }: { rows: Record<string, unknown>[]; truncated: boolean }) {
  const columns = Object.keys(rows[0] ?? {});
  return <div className="overflow-auto"><table className="min-w-full border-collapse text-left text-xs"><thead className="sticky top-0 bg-slate-50"><tr>{columns.map((column) => <th className="whitespace-nowrap border-b border-r border-slate-200 px-3 py-2 font-semibold text-slate-600" key={column}>{column}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr className="hover:bg-indigo-50/40" key={index}>{columns.map((column) => <td className="max-w-sm border-b border-r border-slate-100 px-3 py-2 align-top text-slate-700" key={column}>{formatCell(row[column])}</td>)}</tr>)}</tbody></table>{truncated && <p className="p-2 text-[10px] text-amber-700">Results are limited to the first 500 rows.</p>}</div>;
}

function formatCell(value: unknown) {
  if (value === null || value === undefined) return <span className="italic text-slate-300">NULL</span>;
  if (typeof value === 'object') return <code className="whitespace-pre-wrap">{JSON.stringify(value)}</code>;
  return String(value);
}
