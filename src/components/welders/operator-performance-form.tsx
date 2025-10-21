"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Upload,
  Plus,
  QrCode,
  Trash2,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import Image from "next/image";
import { ROUTES } from "@/constants/routes";
import QRCode from "qrcode";
import { Checkbox } from "../ui/checkbox";
import { ConfirmPopover } from "../ui/confirm-popover";
import { useWelderCards } from "@/hooks/use-welder-cards";
import { CreateOperatorCertificateData } from "@/services/welder-operator-certificates.service";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface WelderVariable {
  id: string;
  name: string;
  actualValue: string;
  rangeQualified: string;
}

interface TestConducted {
  id: string;
  testType: string;
  reportNo: string;
  results: string;
  testPerformed: boolean;
}

interface OperatorPerformanceData {
  id?: string;
  welderCardId?: string; // Added welder card ID field
  operatorImage: string | null;
  operatorName: string;
  operatorIdNo: string;
  wpsFollowed: string;
  jointWeldType: string;
  baseMetalSpec: string;
  fillerSpec: string;
  testCouponSize: string;
  certificateRefNo: string;
  iqamaId: string;
  dateOfIssued: string;
  dateOfWelding: string;
  baseMetalPNumber: string;
  fillerClass: string;
  positions: string;
  automaticWeldingEquipmentVariables: WelderVariable[];
  machineWeldingEquipmentVariables: WelderVariable[];
  testsConducted: TestConducted[];
  certificationStatement: string;
  testingWitnessed: string;
  testSupervisor: string;
}

interface OperatorPerformanceFormProps {
  initialData?: OperatorPerformanceData;
  onSubmit: (data: CreateOperatorCertificateData) => void;
  onCancel: () => void;
  readOnly?: boolean;
}

const defaultAutomaticWeldingEquipmentVariables: WelderVariable[] = [
  {
    id: "1",
    name: "Type of Welding (Automatic)",
    actualValue: "",
    rangeQualified: "",
  },
  { id: "2", name: "Welding Process", actualValue: "", rangeQualified: "" },
  {
    id: "3",
    name: "Filler Metal Used (Yes or No) (EBW or LBW)",
    actualValue: "",
    rangeQualified: "",
  },
  {
    id: "4",
    name: "Type of Laser for LBW (CO2 to YAG, etc.)",
    actualValue: "",
    rangeQualified: "",
  },
  {
    id: "5",
    name: "Countinous Drive or Inertia Welding (FW)",
    actualValue: "",
    rangeQualified: "",
  },
  {
    id: "6",
    name: "Vacuum or Out of Vacuum (EBW)",
    actualValue: "",
    rangeQualified: "",
  },
];

const defaultMachineWeldingEquipmentVariables: WelderVariable[] = [
  {
    id: "11",
    name: "Type of Welding (Machine)",
    actualValue: "",
    rangeQualified: "",
  },
  { id: "12", name: "Welding Process", actualValue: "", rangeQualified: "" },
  {
    id: "13",
    name: "Direct or Remote Visual Control",
    actualValue: "",
    rangeQualified: "",
  },
  {
    id: "14",
    name: "Automatic Arc Voltage Control (GTAW)",
    actualValue: "",
    rangeQualified: "",
  },
  {
    id: "15",
    name: "Automatic Joint Tracking",
    actualValue: "",
    rangeQualified: "",
  },
  { id: "16", name: "Position(s)", actualValue: "", rangeQualified: "" },
  {
    id: "17",
    name: "Base Material Thickness",
    actualValue: "",
    rangeQualified: "",
  },
  {
    id: "18",
    name: "Consumable Insert (GTAW or PAW)",
    actualValue: "",
    rangeQualified: "",
  },
  {
    id: "19",
    name: "Backing (With or Without)",
    actualValue: "",
    rangeQualified: "",
  },
  {
    id: "20",
    name: "Single or Multiple Passes Per Side",
    actualValue: "",
    rangeQualified: "",
  },
];

const defaultTestsConducted: TestConducted[] = [
  {
    id: "1",
    testType: "Visual Inspection",
    reportNo: "",
    results: "",
    testPerformed: false,
  },
  {
    id: "2",
    testType: "Liquid Penetrant Examination (PT)",
    reportNo: "",
    results: "",
    testPerformed: false,
  },
  {
    id: "3",
    testType: "Ultrasonic Testig (UT)",
    reportNo: "",
    results: "",
    testPerformed: false,
  },
  {
    id: "4",
    testType: "Bend Test",
    reportNo: "",
    results: "",
    testPerformed: false,
  },
];

export function OperatorPerformanceForm({
  initialData,
  onSubmit,
  onCancel,
  readOnly = false,
}: OperatorPerformanceFormProps) {
  // Get welder cards for the selector
  const { data: welderCardsData } = useWelderCards(1, "", 100);

  const createInitialFormData = (): OperatorPerformanceData => ({
    welderCardId: "",
    operatorName: "",
    operatorImage: null,
    operatorIdNo: "",
    wpsFollowed: "",
    jointWeldType: "",
    baseMetalSpec: "",
    fillerSpec: "",
    testCouponSize: "",
    certificateRefNo: "",
    iqamaId: "",
    dateOfIssued: "",
    dateOfWelding: "",
    baseMetalPNumber: "",
    fillerClass: "",
    positions: "",
    automaticWeldingEquipmentVariables: JSON.parse(
      JSON.stringify(defaultAutomaticWeldingEquipmentVariables)
    ),
    machineWeldingEquipmentVariables: JSON.parse(
      JSON.stringify(defaultMachineWeldingEquipmentVariables)
    ),
    testsConducted: JSON.parse(JSON.stringify(defaultTestsConducted)),
    certificationStatement: "",
    testingWitnessed: "",
    testSupervisor: "",
    ...initialData,
  });

  const [formData, setFormData] = useState<OperatorPerformanceData>(
    createInitialFormData()
  );
  const [originalFormData, setOriginalFormData] =
    useState<OperatorPerformanceData>(createInitialFormData());
  const [qrSrc, setQrSrc] = useState<string | null>(null);
  const [selectedWelderCardId, setSelectedWelderCardId] = useState<
    string | undefined
  >(undefined);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Update both form data and original data when initialData changes
    const updatedData = createInitialFormData();
    setFormData(updatedData);
    setOriginalFormData(updatedData);
  }, [initialData]);

  useEffect(() => {
    // Generate QR code for existing forms (when we have an ID)
    if (formData.id) {
      const generateQR = async () => {
        try {
          const frontendBase =
            typeof window !== "undefined" ? window.location.origin : "";
          const publicUrl = `${frontendBase}${ROUTES.PUBLIC?.WELDER_OPERATOR_PERFORMANCE_PREVIEW(
            formData.id!
          )}`;
          const dataUrl = await QRCode.toDataURL(publicUrl, {
            margin: 1,
            width: 120,
          });
          setQrSrc(dataUrl);
        } catch (error) {
          console.error("Failed to generate QR code:", error);
          setQrSrc(null);
        }
      };
      generateQR();
    }
  }, [formData.id]);

  const handleInputChange = (
    field: keyof OperatorPerformanceData,
    value: string | WelderVariable[] | TestConducted[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image file is too large (max 10MB)");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        handleInputChange("operatorImage", e.target?.result as string);
        toast.success("Image uploaded successfully");
      };
      reader.onerror = () => {
        toast.error("Failed to read image file");
      };
      reader.readAsDataURL(file);
    }
  };

  const addAutomaticWeldingEquipmentVariable = () => {
    const newId = (
      formData.automaticWeldingEquipmentVariables.length + 1
    ).toString();
    const newVariable: WelderVariable = {
      id: newId,
      name: "",
      actualValue: "",
      rangeQualified: "",
    };
    handleInputChange("automaticWeldingEquipmentVariables", [
      ...formData.automaticWeldingEquipmentVariables,
      newVariable,
    ]);
    toast.success("Automatic welding variable added");
  };

  const removeAutomaticWeldingEquipmentVariable = (id: string) => {
    handleInputChange(
      "automaticWeldingEquipmentVariables",
      formData.automaticWeldingEquipmentVariables.filter(
        (variable) => variable.id !== id
      )
    );
    toast.success("Automatic welding variable removed");
  };

  const addMachineWeldingEquipmentVariable = () => {
    const newId = (
      formData.machineWeldingEquipmentVariables.length + 21
    ).toString();
    const newVariable: WelderVariable = {
      id: newId,
      name: "",
      actualValue: "",
      rangeQualified: "",
    };
    handleInputChange("machineWeldingEquipmentVariables", [
      ...formData.machineWeldingEquipmentVariables,
      newVariable,
    ]);
    toast.success("Machine welding variable added");
  };

  const removeMachineWeldingEquipmentVariable = (id: string) => {
    handleInputChange(
      "machineWeldingEquipmentVariables",
      formData.machineWeldingEquipmentVariables.filter(
        (variable) => variable.id !== id
      )
    );
    toast.success("Machine welding variable removed");
  };

  const updateAutomaticWeldingEquipmentVariable = (
    id: string,
    field: keyof WelderVariable,
    value: string
  ) => {
    const updatedVariables = formData.automaticWeldingEquipmentVariables.map(
      (variable) =>
        variable.id === id ? { ...variable, [field]: value } : variable
    );
    handleInputChange("automaticWeldingEquipmentVariables", updatedVariables);
  };

  const updateMachineWeldingEquipmentVariable = (
    id: string,
    field: keyof WelderVariable,
    value: string
  ) => {
    const updatedVariables = formData.machineWeldingEquipmentVariables.map(
      (variable) =>
        variable.id === id ? { ...variable, [field]: value } : variable
    );
    handleInputChange("machineWeldingEquipmentVariables", updatedVariables);
  };

  const updateTestConducted = (
    id: string,
    field: keyof TestConducted,
    value: string | boolean
  ) => {
    const updatedTests = formData.testsConducted.map((test) =>
      test.id === id ? { ...test, [field]: value } : test
    );
    handleInputChange("testsConducted", updatedTests);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.operatorName || formData.operatorName.trim() === "") {
      toast.error("Operator name is required");
      return;
    }

    if (!formData.testSupervisor || formData.testSupervisor.trim() === "") {
      toast.error("Test Supervisor is required");
      return;
    }

    if (!formData.testingWitnessed || formData.testingWitnessed.trim() === "") {
      toast.error("Testing Witnessed is required");
      return;
    }

    if (
      !formData.certificationStatement ||
      formData.certificationStatement.trim() === ""
    ) {
      toast.error("Certification Statement is required");
      return;
    }

    try {
      // Map form data to API schema
      const apiData = {
        welder_card_id: formData.welderCardId,
        certificate_no: formData.certificateRefNo,
        wps_followed_date: formData.wpsFollowed,
        date_of_issue: formData.dateOfIssued,
        date_of_welding: formData.dateOfWelding,
        joint_weld_type: formData.jointWeldType,
        base_metal_spec: formData.baseMetalSpec,
        base_metal_p_no: formData.baseMetalPNumber,
        filler_sfa_spec: formData.fillerSpec,
        filler_class_aws: formData.fillerClass,
        test_coupon_size: formData.testCouponSize,
        positions: formData.positions,
        testing_variables_and_qualification_limits_automatic: formData.automaticWeldingEquipmentVariables.map(
          (variable) => ({
            name: variable.name,
            actual_values: variable.actualValue,
            range_values: variable.rangeQualified,
          })
        ),
        testing_variables_and_qualification_limits_machine: formData.machineWeldingEquipmentVariables.map(
          (variable) => ({
            name: variable.name,
            actual_values: variable.actualValue,
            range_values: variable.rangeQualified,
          })
        ),
        tests: formData.testsConducted.map((test) => ({
          type: test.testType,
          test_performed: test.testPerformed,
          results: test.results,
          report_no: test.reportNo,
        })),
        law_name: formData.certificationStatement,
        tested_by: formData.testSupervisor,
        witnessed_by: formData.testingWitnessed,
      };
      
      onSubmit(apiData as CreateOperatorCertificateData);
      toast.success("Operator performance certificate saved successfully");
    } catch (error) {
      console.error("Failed to save operator performance certificate:", error);
      toast.error("Failed to save operator performance certificate");
    }
  };

  const revertToOriginal = () => {
    setFormData(JSON.parse(JSON.stringify(originalFormData)));
  };

  const handleCancel = () => {
    revertToOriginal();
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Certificate Header */}
      <div className="bg-background print:bg-white">
        {/* ATECO Header */}
        <div className="flex justify-between items-start mb-6">
          {/* Left - ATECO Logo and Info */}
          <div className="flex-1">
            <Image
              src="/gripco-logo.webp"
              alt="Gripco"
              width={100}
              height={80}
              className="object-contain h-20 w-auto"
            />
          </div>

          {/* Center - Title */}
          <div className="flex-1 text-center">
            <h2 className="text-xl font-bold text-green-700 mb-2">
              Welder / Welder operator performance Qualification Record
            </h2>
            
              <h3 className="text-lg font-bold">
                {formData.operatorName || "OPERATOR NAME"}
              </h3>
            
          </div>

          {/* Right - Welder Photo */}
          <div className="flex-1 flex justify-end">
            <div className="w-40 h-24 border-2  overflow-hidden bg-gray-100 dark:bg-sidebar">
              {formData.operatorImage ? (
                <Image
                  src={`${
                    process.env.NEXT_PUBLIC_BACKEND_URL
                  }${formData.operatorImage.replace(/\\/g, "/")}`}
                  alt="Welder"
                  width={128}
                  height={160}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  {!readOnly ? (
                    <div className="text-center">
                      <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <Label
                        htmlFor="imageUpload"
                        className="cursor-pointer text-blue-600 hover:text-blue-500 text-xs"
                      >
                        Upload Photo
                      </Label>
                      <Input
                        id="imageUpload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </div>
                  ) : (
                    <span className="text-gray-400 text-xs">No Photo</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Basic Information Table */}
        <div className="border mb-6">
          <div className="p-1 bg-background dark:bg-sidebar font-semibold text-sm border-b text-center">
            Welding Operator Data & Test Description
          </div>
          {/* Row 1 */}
          <div className="grid grid-cols-4 border-b ">
            <div className="p-1 bg-background dark:bg-sidebar font-medium text-sm border-x">
              Operator Name
            </div>
            <div className="p-1 border-x">
              {readOnly ? (
                <span className="text-sm">{formData.operatorName}</span>
              ) : (
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between text-sm"
                    >
                      {selectedWelderCardId
                        ? welderCardsData?.results?.find(
                            (card) => card.id === selectedWelderCardId
                          )?.welder_info?.operator_name || "Select welder..."
                        : "Select welder..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search welders..." />
                      <CommandList>
                        <CommandEmpty>No welder found.</CommandEmpty>
                        <CommandGroup>
                          {welderCardsData?.results?.map((card) => (
                            <CommandItem
                              key={card.id}
                              value={`${card.welder_info?.operator_name} ${card.welder_info?.operator_id} ${card.card_no}`}
                              onSelect={() => {
                                setSelectedWelderCardId(
                                  card.id === selectedWelderCardId
                                    ? undefined
                                    : card.id
                                );
                                if (card.id !== selectedWelderCardId) {
                                  // Auto-fill based on selected welder card
                                  handleInputChange("welderCardId", card.id);
                                  handleInputChange(
                                    "operatorName",
                                    card.welder_info?.operator_name || ""
                                  );
                                  handleInputChange(
                                    "operatorIdNo",
                                    card.welder_info?.operator_id || ""
                                  );
                                  handleInputChange(
                                    "iqamaId",
                                    card.welder_info?.iqama || ""
                                  );
                                  handleInputChange(
                                    "operatorImage",
                                    card.welder_info?.profile_image || ""
                                  );
                                  // Only set certificateRefNo if it's empty, allowing user to edit
                                  if (!formData.certificateRefNo) {
                                    handleInputChange(
                                      "certificateRefNo",
                                      card.card_no || ""
                                    );
                                  }
                                  toast.success(
                                    `Welder ${card.welder_info?.operator_name} selected`
                                  );
                                }
                                setOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedWelderCardId === card.id
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {card.welder_info?.operator_name}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  ID: {card.welder_info?.operator_id} | Card:{" "}
                                  {card.card_no}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              )}
            </div>
            <div className="p-1 bg-background dark:bg-sidebar font-medium text-sm border-x">
              Certificate No
            </div>
            <div className="p-1 border-x">
              {readOnly ? (
                <span className="text-sm">{formData.certificateRefNo}</span>
              ) : (
                <Input
                  type="text"
                  value={formData.certificateRefNo}
                  onChange={(e) => handleInputChange("certificateRefNo", e.target.value)}
                  className="border-0 py-0 h-auto text-sm"
                  placeholder="Enter certificate reference number"
                />
              )}
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-4 border-b">
            <div className="p-1 bg-background dark:bg-sidebar font-medium text-sm border-x">
              Operator ID / Symbol
            </div>
            <div className="p-1 border-x">
              <span className="text-sm">{formData.operatorIdNo}</span>
            </div>
            <div className="p-1 bg-background dark:bg-sidebar font-medium text-sm border-x">
              Iqama / Passport
            </div>
            <div className="p-1 border-x">
              <span className="text-sm">{formData.iqamaId}</span>
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-4 border-b ">
            <div className="p-1 bg-background dark:bg-sidebar font-medium text-sm border-x">
              WPS Followed
            </div>
            <div className="p-1 border-x">
              {readOnly ? (
                <span className="text-sm">{formData.wpsFollowed}</span>
              ) : (
                <Input
                  type="date"
                  value={formData.wpsFollowed}
                  onChange={(e) =>
                    handleInputChange("wpsFollowed", e.target.value)
                  }
                  className="border-0 p-0 h-auto text-sm"
                />
              )}
            </div>
            <div className="p-1 bg-background dark:bg-sidebar font-medium text-sm border-x">
              Date of Issue
            </div>
            <div className="p-1 border-x">
              {readOnly ? (
                <span className="text-sm">{formData.dateOfIssued}</span>
              ) : (
                <Input
                  type="date"
                  value={formData.dateOfIssued}
                  onChange={(e) =>
                    handleInputChange("dateOfIssued", e.target.value)
                  }
                  className="border-0 p-0 h-auto text-sm"
                />
              )}
            </div>
          </div>

          {/* Row 4 */}
          <div className="grid grid-cols-4">
            <div className="p-1 bg-background dark:bg-sidebar font-medium text-sm border-x">
              Joint / Weld Type
            </div>
            <div className="p-1 border-x">
              {readOnly ? (
                <span className="text-sm">{formData.jointWeldType}</span>
              ) : (
                <Input
                  value={formData.jointWeldType}
                  onChange={(e) =>
                    handleInputChange("jointWeldType", e.target.value)
                  }
                  placeholder="Enter qualification standard"
                  className="border-0 p-0 h-auto text-sm"
                />
              )}
            </div>
            <div className="p-1 bg-background dark:bg-sidebar font-medium text-sm border-x">
              Date of Welding
            </div>
            <div className="p-1 border-x">
              {readOnly ? (
                <span className="text-sm">{formData.dateOfWelding}</span>
              ) : (
                <Input
                  type="date"
                  value={formData.dateOfWelding}
                  onChange={(e) =>
                    handleInputChange("dateOfWelding", e.target.value)
                  }
                  className="border-0 p-0 h-auto text-sm"
                />
              )}
            </div>
          </div>

          {/* Row 5 */}
          <div className="grid grid-cols-4 border-t ">
            <div className="p-1 bg-background dark:bg-sidebar font-medium text-sm border-x">
              Base Metal Spec.
            </div>
            <div className="p-1 border-x">
              {readOnly ? (
                <span className="text-sm">{formData.baseMetalSpec}</span>
              ) : (
                <Input
                  value={formData.baseMetalSpec}
                  onChange={(e) =>
                    handleInputChange("baseMetalSpec", e.target.value)
                  }
                  placeholder="Enter joint type"
                  className="border-0 p-0 h-auto text-sm"
                />
              )}
            </div>
            <div className="p-1 bg-background dark:bg-sidebar font-medium text-sm border-x">
              Base Metal P-No.
            </div>
            <div className="p-1 border-x">
              {readOnly ? (
                <span className="text-sm">{formData.baseMetalPNumber}</span>
              ) : (
                <Input
                  value={formData.baseMetalPNumber}
                  onChange={(e) =>
                    handleInputChange("baseMetalPNumber", e.target.value)
                  }
                  placeholder="Enter weld type"
                  className="border-0 p-0 h-auto text-sm"
                />
              )}
            </div>
          </div>

          {/* Row 6 */}
          <div className="grid grid-cols-4 border-t ">
            <div className="p-1 bg-background dark:bg-sidebar font-medium text-sm border-x">
              Filler (SFA) Spec.
            </div>
            <div className="p-1 border-x">
              {readOnly ? (
                <span className="text-sm">{formData.fillerSpec}</span>
              ) : (
                <Input
                  value={formData.fillerSpec}
                  onChange={(e) =>
                    handleInputChange("fillerSpec", e.target.value)
                  }
                  placeholder="Enter joint type"
                  className="border-0 p-0 h-auto text-sm"
                />
              )}
            </div>
            <div className="p-1 bg-background dark:bg-sidebar font-medium text-sm border-x">
              Filler Class. (AWS)
            </div>
            <div className="p-1 border-x">
              {readOnly ? (
                <span className="text-sm">{formData.fillerClass}</span>
              ) : (
                <Input
                  value={formData.fillerClass}
                  onChange={(e) =>
                    handleInputChange("fillerClass", e.target.value)
                  }
                  placeholder="Enter weld type"
                  className="border-0 p-0 h-auto text-sm"
                />
              )}
            </div>
          </div>

          {/* Row 7 */}
          <div className="grid grid-cols-4 border-t ">
            <div className="p-1 bg-background dark:bg-sidebar font-medium text-sm border-x">
              Test Coupon Size
            </div>
            <div className="p-1 border-x">
              {readOnly ? (
                <span className="text-sm">{formData.testCouponSize}</span>
              ) : (
                <Input
                  value={formData.testCouponSize}
                  onChange={(e) =>
                    handleInputChange("testCouponSize", e.target.value)
                  }
                  placeholder="Enter joint type"
                  className="border-0 p-0 h-auto text-sm"
                />
              )}
            </div>
            <div className="p-1 bg-background dark:bg-sidebar font-medium text-sm border-x">
              Position(s)
            </div>
            <div className="p-1 border-x">
              {readOnly ? (
                <span className="text-sm">{formData.positions}</span>
              ) : (
                <Input
                  value={formData.positions}
                  onChange={(e) =>
                    handleInputChange("positions", e.target.value)
                  }
                  placeholder="Enter weld type"
                  className="border-0 p-0 h-auto text-sm"
                />
              )}
            </div>
          </div>
        </div>

        {/* Automatic Welding Equipment Variables Table */}
        <div className="border">
          <div className="p-1 bg-background dark:bg-sidebar font-semibold text-sm border-b text-center">
            Testing Variables and Qualification Limits
          </div>
          <div className="p-1 bg-background dark:bg-sidebar font-semibold text-sm border-b text-center">
            Testing Variables and Qualification Limits When Using Automatic
            Welding Equipment
          </div>

          <div className="grid grid-cols-3 border-b  bg-background dark:bg-sidebar">
            <div className="p-1 font-medium text-sm border-r">
              Welder variables
            </div>
            <div className="p-1 font-medium text-sm text-center border-r">
              Actual Values
            </div>
            <div className="p-1 font-medium text-sm text-center border-r">
              Range Qualified
            </div>
          </div>

          {formData.automaticWeldingEquipmentVariables.map(
            (variable, index) => (
              <div
                key={variable.id}
                className={`grid grid-cols-3 ${
                  index % 2 === 0
                    ? "bg-white dark:bg-background"
                    : "bg-background dark:bg-sidebar"
                }`}
              >
                <div className="p-1 border-r ">
                  {readOnly ? (
                    <span className="text-sm">{variable.name}</span>
                  ) : (
                    <Input
                      value={variable.name}
                      onChange={(e) =>
                        updateAutomaticWeldingEquipmentVariable(
                          variable.id,
                          "name",
                          e.target.value
                        )
                      }
                      placeholder="Enter variable name"
                      className="border-0 p-0 h-auto text-sm"
                    />
                  )}
                </div>
                <div className="p-1 border-r ">
                  {readOnly ? (
                    <span className="text-sm">{variable.actualValue}</span>
                  ) : (
                    <Input
                      value={variable.actualValue}
                      onChange={(e) =>
                        updateAutomaticWeldingEquipmentVariable(
                          variable.id,
                          "actualValue",
                          e.target.value
                        )
                      }
                      placeholder="Actual value"
                      className="border-0 p-0 h-auto text-sm"
                    />
                  )}
                </div>
                <div className="p-1 flex items-center gap-2">
                  {readOnly ? (
                    <span className="text-sm flex-1">
                      {variable.rangeQualified}
                    </span>
                  ) : (
                    <>
                      <Input
                        value={variable.rangeQualified}
                        onChange={(e) =>
                          updateAutomaticWeldingEquipmentVariable(
                            variable.id,
                            "rangeQualified",
                            e.target.value
                          )
                        }
                        placeholder="Range qualified"
                        className="border-0 p-0 h-auto text-sm flex-1"
                      />
                      <ConfirmPopover
                        trigger={
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="h-7 w-7 p-0 shrink-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        }
                        title="Confirm Deletion"
                        description="Are you sure you want to delete this automatic welding equipment variable?"
                        onConfirm={() =>
                          removeAutomaticWeldingEquipmentVariable(variable.id)
                        }
                      />
                    </>
                  )}
                </div>
              </div>
            )
          )}

          {!readOnly && (
            <div className="p-1 border-t ">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAutomaticWeldingEquipmentVariable}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Welder Variable
              </Button>
            </div>
          )}
        </div>

        {/* Machine Welding Equipment Variables Table */}
        <div className="border mb-6">
          <div className="p-1 bg-background dark:bg-sidebar font-semibold text-sm border-b text-center">
            Testing Variables and Qualification Limits When Using Machine
            Welding Equipment
          </div>

          <div className="grid grid-cols-3 border-b  bg-background dark:bg-sidebar">
            <div className="p-1 font-medium text-sm border-r">
              Welder variables
            </div>
            <div className="p-1 font-medium text-sm text-center border-r">
              Actual Values
            </div>
            <div className="p-1 font-medium text-sm text-center border-r">
              Range Qualified
            </div>
          </div>

          {formData.machineWeldingEquipmentVariables.map((variable, index) => (
            <div
              key={variable.id}
              className={`grid grid-cols-3 ${
                index % 2 === 0
                  ? "bg-white dark:bg-background"
                  : "bg-background dark:bg-sidebar"
              }`}
            >
              <div className="p-1 border-r ">
                {readOnly ? (
                  <span className="text-sm">{variable.name}</span>
                ) : (
                  <Input
                    value={variable.name}
                    onChange={(e) =>
                      updateMachineWeldingEquipmentVariable(
                        variable.id,
                        "name",
                        e.target.value
                      )
                    }
                    placeholder="Enter variable name"
                    className="border-0 p-0 h-auto text-sm"
                  />
                )}
              </div>
              <div className="p-1 border-r ">
                {readOnly ? (
                  <span className="text-sm">{variable.actualValue}</span>
                ) : (
                  <Input
                    value={variable.actualValue}
                    onChange={(e) =>
                      updateMachineWeldingEquipmentVariable(
                        variable.id,
                        "actualValue",
                        e.target.value
                      )
                    }
                    placeholder="Actual value"
                    className="border-0 p-0 h-auto text-sm"
                  />
                )}
              </div>
              <div className="p-1 flex items-center gap-2">
                {readOnly ? (
                  <span className="text-sm flex-1">
                    {variable.rangeQualified}
                  </span>
                ) : (
                  <>
                    <Input
                      value={variable.rangeQualified}
                      onChange={(e) =>
                        updateMachineWeldingEquipmentVariable(
                          variable.id,
                          "rangeQualified",
                          e.target.value
                        )
                      }
                      placeholder="Range qualified"
                      className="border-0 p-0 h-auto text-sm flex-1"
                    />
                    <ConfirmPopover
                      trigger={
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="h-7 w-7 p-0 shrink-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      }
                      title="Confirm Deletion"
                      description="Are you sure you want to delete this machine welding equipment variable?"
                      onConfirm={() =>
                        removeMachineWeldingEquipmentVariable(variable.id)
                      }
                    />
                  </>
                )}
              </div>
            </div>
          ))}

          {!readOnly && (
            <div className="p-1 border-t ">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addMachineWeldingEquipmentVariable}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Welder Variable
              </Button>
            </div>
          )}
        </div>

        {/* Test Conducted Table */}
        <div className="border mb-6 text-center">
          <div className="grid grid-cols-4 border-b  bg-background dark:bg-sidebar">
            <div className="p-1 font-medium text-sm border-r">
              Test Conducted/ Type of Test
            </div>
            <div className="p-1 font-medium text-sm text-center border-r">
              Test Performed
            </div>
            <div className="p-1 font-medium text-sm text-center border-r">
              Results
            </div>
            <div className="p-1 font-medium text-sm text-center border-r">
              Report No
            </div>
          </div>

          {formData.testsConducted.map((test, index) => (
            <div
              key={test.id}
              className={`grid grid-cols-4 ${
                index % 2 === 0
                  ? "bg-white dark:bg-background"
                  : "bg-background dark:bg-sidebar"
              }`}
            >
              <div className="p-1 border-r ">
                <span className="text-sm">{test.testType}</span>
              </div>
              <div className="p-1 border-r">
                {readOnly ? (
                  <div className="flex items-center justify-center gap-2">
                    {/* On-screen */}
                    <Checkbox
                      checked={test.testPerformed}
                      disabled
                      className="w-4 h-4 print:hidden"
                    />
                    {/* Print fallback */}
                    <span className="hidden print:inline-block text-lg leading-none select-none">
                      {test.testPerformed ? "☑" : "☐"}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Checkbox
                      checked={test.testPerformed}
                      onCheckedChange={(checked) =>
                        updateTestConducted(test.id, "testPerformed", checked)
                      }
                      className="w-4 h-4 print:hidden"
                    />
                    {/* Print fallback for editable state */}
                    <span className="hidden print:inline-block text-lg leading-none select-none">
                      {test.testPerformed ? "☑" : "☐"}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-1 border-r ">
                {readOnly ? (
                  <span className="text-sm text-center">
                    {test.reportNo}
                  </span>
                ) : (
                  <Input
                    value={test.reportNo}
                    onChange={(e) =>
                      updateTestConducted(test.id, "reportNo", e.target.value)
                    }
                    placeholder="Enter report number"
                    className="border-0 p-0 h-auto text-sm flex-1 text-center"
                  />
                )}
              </div>
              <div className="p-1">
                {readOnly ? (
                  <span className="text-sm text-center">{test.results}</span>
                ) : (
                  <Input
                    value={test.results}
                    onChange={(e) =>
                      updateTestConducted(test.id, "results", e.target.value)
                    }
                    placeholder="Enter results"
                    className="border-0 p-0 h-auto text-sm text-center"
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Certification Statement */}
        <div className="mb-6">
          <div className="border  bg-background dark:bg-sidebar p-4">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              We, the undersigned, certify that the statements in the record are
              correct and that the test coupons were welded and tested in
              accordance with the requirements of{" "}
              {readOnly ? (
                <span className="font-bold text-blue-600">
                  {formData.certificationStatement}
                </span>
              ) : (
                <Input
                  value={formData.certificationStatement}
                  onChange={(e) =>
                    handleInputChange("certificationStatement", e.target.value)
                  }
                  placeholder="ASME SEC IX Ed(2023)"
                  className="border-0 p-0 h-auto text-sm inline-block w-48 text-center font-bold text-blue-600 bg-transparent"
                />
              )}
            </p>
          </div>
        </div>

        {/* Signatures Section */}
        <div className="grid grid-cols-2 gap-8 mb-6">
          {/* Left Side - ATECO Details */}
          <div>
            <h3 className="text-lg font-bold mb-4">GRIPCO LIMS</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold mb-2 text-sm">
                  Testing Witnessed / Welder Inspector
                </p>
                <div className="underline text-right">
                  {readOnly ? (
                    <p className="text-sm font-medium">
                      {formData.testingWitnessed}
                    </p>
                  ) : (
                    <Input
                      value={formData.testingWitnessed}
                      onChange={(e) =>
                        handleInputChange("testingWitnessed", e.target.value)
                      }
                      placeholder="Enter inspector name"
                      className="border-0 p-0 h-auto text-sm font-medium text-right"
                    />
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="font-semibold mb-2 text-sm">
                  Test Supervisor / Technical Manager
                </p>
                <div className="underline text-right">
                  {readOnly ? (
                    <p className="text-sm font-medium">
                      {formData.testSupervisor}
                    </p>
                  ) : (
                    <Input
                      value={formData.testSupervisor}
                      onChange={(e) =>
                        handleInputChange("testSupervisor", e.target.value)
                      }
                      placeholder="Enter supervisor name"
                      className="border-0 p-0 h-auto text-sm font-medium text-right"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Client Details and QR Code */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <p className="mb-2 text-sm">Client Name:</p>
              <p className="text-sm font-medium underline">
                {formData.operatorName}
              </p>
            </div>
            <div className="mb-4 flex items-center justify-between">
              <p className="mb-2 text-sm">Client Signature:</p>
              <div className="border-b-2 border-gray-400 pb-1 min-w-32"></div>
            </div>

            {/* QR Code Verification Area */}
            <div className="bg-gray-200 dark:bg-sidebar p-4 relative">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs">
                    To verify the information about the certificate. Please scan
                    the QR code using any QR scan app
                  </p>
                </div>
                <div className="w-16 h-16 bg-white dark:bg-sidebar flex items-center justify-center">
                  {formData.id && qrSrc ? (
                    <Image
                      src={qrSrc}
                      alt="QR Code"
                      width={64}
                      height={64}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <QrCode className="w-16 h-16" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-black text-white p-4 text-center text-xs">
          <p>
            Address: 3658 Ar Rabiyah District Unit No:02, P.0 Box 32437 Dammam
            6621 KSA
          </p>
          <p>Tel: +966138383130 | Website: www.atecosaudia.com</p>
          <p>Email: info@atecosaudia.com | Cr# 2051226809</p>
        </div>
      </div>

      {/* Actions */}
      {!readOnly && (
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {initialData ? "Update Certificate" : "Create Certificate"}
          </Button>
        </div>
      )}
    </form>
  );
}

export type { OperatorPerformanceData, WelderVariable, TestConducted };
