import { DynamicColumn, DynamicRow } from "@/components/pqr/form"

export type PqrSectionDataItem = {
    description: string
    label: string
    parameter: string
    value: string
}

export type PqrSectionData = {
    name: string
    data: PqrSectionDataItem[]
}


export type SectionData = {
  columns: DynamicColumn[];
  data: DynamicRow[];
};

export type PqrSection = SectionData;

export interface JointsSection extends PqrSection {
  designPhotoUrl?: string;
}

export interface PqrDataToView {
  headerInfo: PqrSection;
  joints: JointsSection;
  baseMetals: PqrSection;
  fillerMetals: PqrSection;
  positions: PqrSection;
  preheat: PqrSection;
  pwht: PqrSection;
  gas: PqrSection;
  electrical: PqrSection;
  techniques: PqrSection;
  weldingParameters: PqrSection;
  tensileTest: PqrSection;
  guidedBendTest: PqrSection;
  toughnessTest: PqrSection;
  filletWeldTest: PqrSection;
  otherTests: PqrSection;
  welderTestingInfo: PqrSection;
  certification: { data: { id: string; reference: string }[] };
  signatures: PqrSection;
}