// Type-safe interface for propertyDetailsJson field
export interface PropertyDetails {
  // Działki
  lotArea?: number | null;
  lotForm?: string | null;
  lotShape?: string | null;
  lotType?: string | null;
  zoningPlan?: string[] | null;
  possibleDevelopmentPercent?: number | null;
  overallHeight?: number | null;
  groundOwnershipType?: string | null;
  dividingPossibility?: boolean | null;
  plotDimension?: string | null;

  // Media i uzbrojenie
  waterTypeList?: string[] | null;
  electricityStatus?: string | null;
  gasStatus?: string | null;
  sewerageTypeList?: string[] | null;
  urbanCo?: boolean | null;

  // Budynki (mieszkania/domy/lokale)
  elevator?: boolean | null;
  condition?: string | null;
  buildingType?: string | null;
  material?: string | null;
  apartmentTypeList?: string[] | null;
  heatingTypeList?: string[] | null;
  hotWaterList?: string[] | null;
  kitchenType?: string | null;
  intercom?: boolean | null;

  // Pozwolenia i certyfikaty
  activeBuildingPermit?: boolean | null;
  issuedBuildingConditions?: boolean | null;

  // Ogólne
  exchange?: boolean | null;
  communicationList?: string[] | null;
  availableNeighborhoodList?: string[] | null;
  vacantFromDate?: string | null;
  videoUrl?: string | null;
  drivewayType?: string | null;
  encloseType?: string | null;
  sharedOwnership?: string | null;
  groundSharedOwnership?: string | null;
  ownListing?: boolean | null;
}
