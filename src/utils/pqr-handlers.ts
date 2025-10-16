import { DynamicColumn, DynamicRow } from "@/components/pqr/form";

import { PQR } from "@/services/pqr.service";
import { JointsSection, PqrDataToView, PqrSection } from "@/types/pqr";


/* primitives */
type KV = Record<string, unknown>;
type ExplicitColumn = { key: string; header: string };
type WithRows = { rows: unknown[] };
type WithExplicitColumns = WithRows & { columns: ExplicitColumn[] };

const isObject = (v: unknown): v is KV => typeof v === "object" && v !== null;
const hasRows = (v: unknown): v is WithRows =>
  isObject(v) && "rows" in v && Array.isArray((v as WithRows).rows);
const hasExplicitColumns = (v: unknown): v is WithExplicitColumns =>
  hasRows(v) && "columns" in v && Array.isArray((v as WithExplicitColumns).columns);
const toStr = (v: unknown) => String(v ?? "");

/* generic table handler */
export const handleTableSection = (
  obj: unknown,
  labelKey = "label",
  valueKey = "value"
): { columns: DynamicColumn[]; data: DynamicRow[] } => {
  if (!isObject(obj)) return { columns: [], data: [] };

  if (hasRows(obj)) {
    const rows = obj.rows;

    if (hasExplicitColumns(obj)) {
      const columns: DynamicColumn[] = obj.columns.map((col, i) => ({
        id: `col-${col.key}-${i}`,
        header: col.header,
        accessorKey: col.key,
        type: col.key === "label" || col.key === "description" ? "label" : "input",
      }));
      const data: DynamicRow[] = rows.map((r, i) =>
        isObject(r) && !Array.isArray(r)
          ? ({ id: `row-${i}`, ...r } as DynamicRow)
          : ({ id: `row-${i}` } as DynamicRow)
      );
      return { columns, data };
    }

    const keys = Array.from(
      rows.reduce((s: Set<string>, r) => {
        if (isObject(r) && !Array.isArray(r)) Object.keys(r).forEach((k: string) => s.add(k));
        return s
      }, new Set<string>())
    ).filter((k: string) => k !== "id");

    const hasLabel = keys.includes("label") || keys.includes("description");
    const hasValue = keys.includes("value");
    const simpleLV = hasLabel && hasValue && keys.length === 2;

    if (!simpleLV && keys.length > 0) {
      const columns: DynamicColumn[] = keys.map((k, i) => ({
        id: `col-${k}-${i}`,
        header: k.charAt(0).toUpperCase() + k.slice(1),
        accessorKey: k,
        type: k === "label" || k === "description" ? "label" : "input",
      }));
      const data: DynamicRow[] = rows.map((r, i) =>
        isObject(r) && !Array.isArray(r)
          ? ({ id: `row-${i}`, ...r } as DynamicRow)
          : ({ id: `row-${i}` } as DynamicRow)
      );
      return { columns, data };
    }

    const columns: DynamicColumn[] = [
      { id: `${labelKey}-col`, header: "Parameter", accessorKey: labelKey, type: "label" },
      { id: `${valueKey}-col`, header: "Details", accessorKey: valueKey, type: "input" },
    ];
    const data: DynamicRow[] = rows
      .map((r, i) => {
        if (Array.isArray(r) && r.length >= 2)
          return { id: `row-${i}`, [labelKey]: toStr(r[0]), [valueKey]: r[1] } as DynamicRow;
        if (isObject(r) && !Array.isArray(r)) {
          const lv = r as KV;
          return {
            id: `row-${i}`,
            [labelKey]: toStr(lv[labelKey] ?? lv["label"] ?? lv["description"]),
            [valueKey]: lv[valueKey] ?? lv["value"] ?? "",
          } as DynamicRow;
        }
        return { id: `row-${i}`, [labelKey]: "", [valueKey]: "" } as DynamicRow;
      })
      .filter(rr => toStr((rr as KV)[labelKey]).trim() !== "");
    return { columns, data };
  }

  const entries = Object.entries(obj).filter(
    ([k, v]) => k !== "columns" && k !== "rows" && v !== undefined && v !== null
  );
  if (entries.length === 0) return { columns: [], data: [] };

  const columns: DynamicColumn[] = [
    { id: `${labelKey}-col`, header: "Parameter", accessorKey: labelKey, type: "label" },
    { id: `${valueKey}-col`, header: "Details", accessorKey: valueKey, type: "input" },
  ];
  const data: DynamicRow[] = entries.map(([k, v], i) => ({
    id: `row-${i}`,
    [labelKey]: k,
    [valueKey]: v,
  })) as DynamicRow[];

  return { columns, data };
};

/* media */
export const handleMediaUrl = (relativePath?: string): string | undefined => {
  if (!relativePath) return undefined;
  if (relativePath.startsWith("http") || relativePath.startsWith("blob:")) return relativePath;
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
  const cleanPath = relativePath.replace(/\\/g, "/");
  const sep = cleanPath.startsWith("/") ? "" : "/";
  return `${backendUrl}${sep}${cleanPath}`;
};

/* section handlers */
export const handleHeaderInfo = (pqr: PQR): PqrSection =>
  pqr.basic_info ? handleTableSection(pqr.basic_info, "description", "value") : { columns: [], data: [] };

export const handleJoints = (pqr: PQR): JointsSection => ({
  ...handleTableSection(pqr.joints, "label", "value"),
  designPhotoUrl: handleMediaUrl(pqr.joint_design_sketch?.[0]),
});

export const handleWelderTestingInfo = (pqr: PQR): PqrSection => ({
  columns: [
    { id: "wti-label", header: "Parameter", accessorKey: "label", type: "label" },
    { id: "wti-value", header: "Details", accessorKey: "value", type: "input" },
  ],
  data: [
    { id: "wti1", label: "Welder Name", value: pqr.welder_card_info?.welder_info?.operator_name || "" },
    { id: "wti2", label: "Welder ID", value: pqr.welder_card_info?.welder_info?.operator_id || "" },
    { id: "wti3", label: "Mechanical Testing Conducted by", value: pqr.mechanical_testing_conducted_by || "" },
    { id: "wti4", label: "Lab Test No.", value: pqr.lab_test_no || "" },
  ],
});

export const handleCertification = (pqr: PQR) => ({
  data: [{ id: "cert-ref", reference: pqr.type || "" }],
});

/* facade */
export const buildPqrView = (pqr: PQR): PqrDataToView => ({
  headerInfo: handleHeaderInfo(pqr),
  joints: handleJoints(pqr),
  baseMetals: handleTableSection(pqr.base_metals),
  fillerMetals: handleTableSection(pqr.filler_metals),
  positions: handleTableSection(pqr.positions),
  preheat: handleTableSection(pqr.preheat),
  pwht: handleTableSection(pqr.post_weld_heat_treatment),
  gas: handleTableSection(pqr.gas),
  electrical: handleTableSection(pqr.electrical_characteristics),
  techniques: handleTableSection(pqr.techniques),
  weldingParameters: handleTableSection(pqr.welding_parameters),
  tensileTest: handleTableSection(pqr.tensile_test),
  guidedBendTest: handleTableSection(pqr.guided_bend_test),
  toughnessTest: handleTableSection(pqr.toughness_test),
  filletWeldTest: handleTableSection(pqr.fillet_weld_test),
  otherTests: handleTableSection(pqr.other_tests),
  welderTestingInfo: handleWelderTestingInfo(pqr),
  certification: handleCertification(pqr),
  signatures: handleTableSection(pqr.signatures, "label", "value"),
});
