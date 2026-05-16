import { useEffect, useState, useMemo, useRef } from "react";
import { useAppProvider } from "@src/packages/app-env";
import { useTrafficListContext } from "../../../main-content/context/TrafficList";
import { RequestPairData } from "../../RequestTab";
import { MonacoEditor } from "@src/packages/ui/MonacoEditor";
import { useMonaco } from "@monaco-editor/react";
import { FiCpu, FiCheckCircle, FiAlertTriangle, FiCode, FiArrowRight, FiActivity, FiDatabase } from "react-icons/fi";
import { decodeBody } from "../../utils/bodyUtils";

interface ValidationError {
    path: string;
    message: string;
    line?: number;
}

import { ViewerPlaceholder } from "../../ViewerPlaceholder";

const SchemaPlaceholder = ({ text, subtext }: { text: string; subtext?: string }) => (
    <ViewerPlaceholder
        title={text}
        subtext={subtext}
        type="JSON"
        hint="Building a custom viewer for JSON data allows you to automate schema validation and structural consistency checks."
    />
);

export const JSONSchemaMode = () => {
    const monaco = useMonaco();
    const { provider } = useAppProvider();
    const { selections } = useTrafficListContext();
    const trafficId = useMemo(() => selections.firstSelected?.id as string, [selections]);

    const [requestData, setRequestData] = useState<RequestPairData | null>(null);
    const [responseData, setResponseData] = useState<RequestPairData | null>(null);
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<"builder" | "validator">("builder");
    const [activeSource, setActiveSource] = useState<"request" | "response">("response");

    const bodyEditorRef = useRef<any>(null);
    const schemaEditorRef = useRef<any>(null);

    // Builder states
    const [generatedSchema, setGeneratedSchema] = useState("");

    // Validator states
    const [validatorSchema, setValidatorSchema] = useState("");
    const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
    const [validationSuccess, setValidationSuccess] = useState<boolean | null>(null);

    useEffect(() => {
        if (!trafficId) return;
        setLoading(true);
        Promise.all([
            provider.getRequestPairData(trafficId),
            provider.getResponsePairData(trafficId)
        ]).then(([req, res]) => {
            setRequestData(req);
            setResponseData(res);
            if (!res?.body && req?.body) {
                setActiveSource("request");
            } else {
                setActiveSource("response");
            }
        }).finally(() => setLoading(false));
    }, [trafficId, provider]);

    const activeBody = useMemo(() => {
        const data = activeSource === "request" ? requestData : responseData;
        return decodeBody(data?.body, "application/json");
    }, [activeSource, requestData, responseData]);

    // Simple JSON Schema Generator
    const generateSchema = (obj: any): any => {
        if (obj === null) return { type: "null" };
        if (Array.isArray(obj)) {
            const items = obj.length > 0 ? generateSchema(obj[0]) : {};
            return { type: "array", items };
        }
        if (typeof obj === "object") {
            const properties: any = {};
            const required: string[] = [];
            Object.entries(obj).forEach(([k, v]) => {
                properties[k] = generateSchema(v);
                required.push(k);
            });
            return { type: "object", properties, required };
        }
        return { type: typeof obj };
    };

    useEffect(() => {
        if (activeBody) {
            try {
                const json = JSON.parse(activeBody);
                const schema = {
                    $schema: "http://json-schema.org/draft-07/schema#",
                    title: `Blueprint: ${activeSource}`,
                    ...generateSchema(json)
                };
                const schemaStr = JSON.stringify(schema, null, 4);
                setGeneratedSchema(schemaStr);
                if (!validatorSchema) setValidatorSchema(schemaStr);
            } catch (e) {
                setGeneratedSchema("// Error: Body is not valid JSON");
            }
        }
    }, [activeBody, activeSource]);

    // Helper to find line number of a path in stringified JSON
    const findLineForPath = (jsonStr: string, path: string) => {
        const lines = jsonStr.split('\n');
        const segments = path.split('.').filter(s => s !== 'root');
        if (segments.length === 0) return 1;

        let currentLine = 0;
        for (const segment of segments) {
            const searchPattern = `"${segment}":`;
            for (let i = currentLine; i < lines.length; i++) {
                if (lines[i].includes(searchPattern)) {
                    currentLine = i;
                    break;
                }
            }
        }
        return currentLine + 1;
    };

    const handleValidate = () => {
        if (!activeBody) return;
        setValidationSuccess(null);
        setValidationErrors([]);

        try {
            const body = JSON.parse(activeBody);
            const schema = JSON.parse(validatorSchema);
            const errors: ValidationError[] = [];

            const validate = (val: any, s: any, path = "root") => {
                if (!s) return;
                const type = s.type;

                if (type === "object") {
                    if (typeof val !== "object" || val === null || Array.isArray(val)) {
                        errors.push({ path, message: `Expected object, found ${Array.isArray(val) ? 'array' : typeof val}` });
                        return;
                    }
                    if (s.properties) {
                        Object.entries(s.properties).forEach(([k, propSchema]) => {
                            if (val[k] === undefined) {
                                if (s.required?.includes(k)) {
                                    errors.push({ path: `${path}.${k}`, message: `Missing required property '${k}'` });
                                }
                            } else {
                                validate(val[k], propSchema, `${path}.${k}`);
                            }
                        });
                    }
                } else if (type === "array") {
                    if (!Array.isArray(val)) {
                        errors.push({ path, message: `Expected array, found ${typeof val}` });
                        return;
                    }
                    if (s.items) {
                        val.forEach((item, i) => validate(item, s.items, `${path}[${i}]`));
                    }
                } else if (type === "string" || type === "number" || type === "boolean" || type === "integer") {
                    if (type === "integer") {
                        if (!Number.isInteger(val)) errors.push({ path, message: `Expected integer, found ${val}` });
                    } else if (typeof val !== type) {
                        errors.push({ path, message: `Expected ${type}, found ${typeof val}` });
                    }
                }
            };

            validate(body, schema);

            const errorsWithLines = errors.map(err => ({
                ...err,
                line: findLineForPath(activeBody, err.path)
            }));

            setValidationErrors(errorsWithLines);
            setValidationSuccess(errors.length === 0);

            // Apply markers to Monaco
            if (monaco && bodyEditorRef.current) {
                const markers = errorsWithLines.map(err => ({
                    startLineNumber: err.line || 1,
                    startColumn: 1,
                    endLineNumber: err.line || 1,
                    endColumn: 1000,
                    message: err.message,
                    severity: monaco.MarkerSeverity.Error
                }));
                monaco.editor.setModelMarkers(bodyEditorRef.current.getModel(), "json-validation", markers);
            }

        } catch (e: any) {
            setValidationErrors([{ path: "schema", message: `Parse Error: ${e.message}` }]);
            setValidationSuccess(false);
        }
    };

    if (!trafficId) return <SchemaPlaceholder text="No Request Selected" subtext="Select a request from the list to start building or validating JSON schemas." />;
    if (loading) return <SchemaPlaceholder text="Constructing Blueprints..." subtext="Analyzing data structure and preparing validator environment..." />;

    return (
        <div className="h-full bg-[var(--bg-app)] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-4 @sm:px-6 py-4 border-b border-[var(--border-primary)] bg-[var(--bg-sidebar)] flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4 @sm:p-6">
                    <div>
                        <h2 className="text-xl font-black text-[var(--text-primary)] italic tracking-tighter font-mono">JSON Blueprint</h2>
                        <div className="text-[9px] text-[var(--text-muted)] font-bold tracking-widest mt-0.5">Schema Design & Validation</div>
                    </div>

                    <div className="flex bg-[var(--bg-surface)]/50 rounded-xl p-1 border border-[var(--border-primary)]">
                        <button
                            onClick={() => setMode("builder")}
                            className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all flex items-center gap-2 ${mode === "builder" ? 'bg-blue-600 text-[var(--text-primary)] shadow-lg' : 'text-[var(--text-muted)] hover:text-[var(--text-tertiary)]'}`}
                        >
                            <FiCpu className={mode === "builder" ? "animate-pulse" : ""} />
                            Builder
                        </button>
                        <button
                            onClick={() => {
                                setMode("validator");
                                setTimeout(handleValidate, 100);
                            }}
                            className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all flex items-center gap-2 ${mode === "validator" ? 'bg-purple-600 text-[var(--text-primary)] shadow-lg' : 'text-[var(--text-muted)] hover:text-[var(--text-tertiary)]'}`}
                        >
                            <FiCheckCircle />
                            Validator
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex bg-[var(--bg-surface)] rounded-lg p-0.5 border border-[var(--border-primary)]">
                        <button
                            onClick={() => setActiveSource("request")}
                            className={`px-3 py-1 rounded-md text-[9px] font-black transition-all ${activeSource === "request" ? 'bg-[var(--bg-surface-elevated)] text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-tertiary)]'}`}
                        >
                            Request
                        </button>
                        <button
                            onClick={() => setActiveSource("response")}
                            className={`px-3 py-1 rounded-md text-[9px] font-black transition-all ${activeSource === "response" ? 'bg-[var(--bg-surface-elevated)] text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-tertiary)]'}`}
                        >
                            Response
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Left: Schema Editor */}
                <div className="flex-1 flex flex-col border-r border-[var(--border-primary)]">
                    <div className="px-4 py-2 border-b border-[var(--border-primary)] bg-[var(--bg-sidebar)] flex justify-between items-center">
                        <span className="text-[10px] font-black text-[var(--text-muted)] tracking-widest flex items-center gap-2">
                            <FiCode /> {mode === "builder" ? "Schema Generator" : "Schema Definition"}
                        </span>
                        {mode === "builder" && (
                            <button
                                onClick={() => {
                                    setValidatorSchema(generatedSchema);
                                    setMode("validator");
                                    setTimeout(handleValidate, 100);
                                }}
                                className="text-[9px] font-black text-blue-400 hover:text-blue-300 underline decoration-dotted underline-offset-4"
                            >
                                Use as Contract
                            </button>
                        )}
                    </div>
                    <div className="flex-1 relative">
                        <MonacoEditor
                            onMount={(editor) => schemaEditorRef.current = editor}
                            height="100%"
                            defaultLanguage="json"
                            theme="vs-dark"
                            value={mode === "builder" ? generatedSchema : validatorSchema}
                            onChange={(val) => mode === "validator" && setValidatorSchema(val || "")}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 11,
                                fontFamily: "JetBrains Mono, monospace",
                                scrollBeyondLastLine: false,
                                padding: { top: 16 },
                                readOnly: mode === "builder",
                                wordWrap: "on"
                            }}
                        />
                    </div>
                </div>

                {/* Right: Body Viewer & Validation */}
                <div className="flex-1 flex flex-col">
                    <div className="px-4 py-2 border-b border-[var(--border-primary)] bg-[var(--bg-sidebar)] flex justify-between items-center">
                        <span className="text-[10px] font-black text-[var(--text-muted)] tracking-widest flex items-center gap-2">
                            <FiDatabase /> Data Payload
                        </span>
                        {mode === "validator" && (
                            <button
                                onClick={handleValidate}
                                className="flex items-center gap-2 px-3 py-1 bg-purple-600 hover:bg-purple-500 text-[var(--text-primary)] rounded-full text-[9px] font-black shadow-lg transition-all"
                            >
                                <FiActivity /> Re-Validate
                            </button>
                        )}
                    </div>
                    <div className="flex-1 relative">
                        <MonacoEditor
                            onMount={(editor) => bodyEditorRef.current = editor}
                            height="100%"
                            defaultLanguage="json"
                            theme="vs-dark"
                            value={activeBody}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 11,
                                fontFamily: "JetBrains Mono, monospace",
                                scrollBeyondLastLine: false,
                                padding: { top: 16 },
                                readOnly: true,
                                wordWrap: "on"
                            }}
                        />
                    </div>
                </div>

                {/* Sidebar: Validation Results */}
                <div className="w-72 bg-[var(--bg-sidebar)] border-l border-[var(--border-primary)] overflow-auto">
                    <div className="p-4 @sm:p-6 space-y-6">
                        <h3 className="text-[10px] font-black text-[var(--text-muted)] tracking-widest">Analysis Results</h3>

                        {validationSuccess === null && validationErrors.length === 0 ? (
                            <div className="py-12 text-center opacity-20">
                                <FiCheckCircle className="text-4xl mx-auto mb-3" />
                                <div className="text-[10px] font-bold">Ready to Validate</div>
                            </div>
                        ) : validationSuccess ? (
                            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl">
                                <div className="flex items-center gap-3 text-green-400 mb-2">
                                    <FiCheckCircle className="text-lg" />
                                    <span className="text-[10px] font-black">Valid Contract</span>
                                </div>
                                <p className="text-[9px] text-[var(--text-muted)] leading-relaxed italic">
                                    Zero structural violations detected in the payload.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                                    <div className="flex items-center gap-3 text-red-400 mb-2">
                                        <FiAlertTriangle className="text-lg" />
                                        <span className="text-[10px] font-black">Contract Breaches</span>
                                    </div>
                                    <p className="text-[9px] text-[var(--text-muted)] leading-relaxed">
                                        Found {validationErrors.length} issues in the data payload.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    {validationErrors.map((err, i) => (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                if (bodyEditorRef.current && err.line) {
                                                    bodyEditorRef.current.revealLineInCenter(err.line);
                                                    bodyEditorRef.current.setPosition({ lineNumber: err.line, column: 1 });
                                                    bodyEditorRef.current.focus();
                                                }
                                            }}
                                            className="w-full text-left p-3 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-primary)] hover:border-[var(--border-primary)] transition-all group"
                                        >
                                            <div className="text-[8px] font-black text-[var(--text-muted)] mb-1 group-hover:text-[var(--text-secondary)]">
                                                Path: {err.path}
                                            </div>
                                            <div className="text-[9px] text-red-400 font-mono leading-tight">
                                                {err.message}
                                            </div>
                                            {err.line && (
                                                <div className="text-[7px] text-[var(--text-muted)] mt-1">Line {err.line}</div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="pt-6 border-t border-[var(--border-primary)]">
                            <div className="p-4 bg-[var(--bg-surface)]/30 border border-dashed border-[var(--border-primary)] rounded-xl">
                                <h4 className="text-[9px] font-black text-[var(--text-muted)] mb-2">Architect Tip</h4>
                                <p className="text-[9px] text-[var(--text-muted)] leading-relaxed">
                                    Click an error to jump directly to the failing node in the data payload.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

