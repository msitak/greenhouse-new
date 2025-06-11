export interface AsariListingIdEntry {
    id: number;
    lastUpdated: Date;
  }
  
  export interface ExportedListingIdListApiResponse {
    success: boolean;
    totalCount: number;
    data: AsariListingIdEntry[];
  }
  
  export interface AsariAmountCurrency {
    amount: number | null;
    currency: string;
  }
  
  export interface AsariCountry {
    id: number;
    name: string;
    code: string;
    hasLocationDictionary?: boolean;
  }
  
  export interface AsariOfficeAddress {
    fullStreet: string;
    city: string;
    postalCode: string;
  }
  
  export interface AsariOffice {
    id: number;
    name: string;
    code: string;
    shortName: string;
    ownNumerator: boolean;
    type: string;
    cityName: string;
    unlocked: boolean;
    locked: boolean;
    country: AsariCountry;
    phoneNumber: string | null;
    faxNumber: string | null;
    emailOffice: string | null;
    www: string | null;
    address: AsariOfficeAddress;
    ggNumber: string | null;
    skypeUser: string | null;
    addToDescriptionInExport: boolean;
    vatRegisterId: string | null;
    invoiceNip: string | null;
    invoiceBankName: string | null;
    invoiceBankAccountNo: string | null;
    invoiceBankSwiftIbanNo: string | null;
    customInvoiceData: boolean;
  }
  
  export interface AsariUserOrAgentInfo {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string | null;
    secondPhoneNumber?: string | null;
    skypeUser?: string | null;
    ggNumber?: string | null;
    position1: string | null;
    position2?: string | null;
    manager?: string | null;
    office: AsariOffice;
    imageId: number | null;
    licenceNumber: string | null;
  }
  
  export interface AsariLocationInfo {
    id: number;
    name: string;
    province: string;
    locality: string;
    quarter: string;
    cityQuarter: string | null;
    nameEng?: string | null;
    nameRus?: string | null;
    fullNameEng?: string | null;
    fullNameRus?: string | null;
  }

  export interface AsariStreetInfo {
    id: number | null;
    name: string;
    fullName: string;
  }
  
  export interface AsariImageInfo {
    id: number;
    description: string | null;
    isScheme: boolean;
  }
  
  export interface AsariParentListingInfo {
    id: number;
    listingId: string; // W JSONie dla oferty 9760309 parentListingId było number | null
    name: string;
  }
  
  export interface AsariNestedListingInfo {
    id: number;
    listingId: number;
  }
  
  export interface AsariListingDetail {
    id: number;
    export_id?: string | null;
    listingId: string;
    activeBuildingPermit?: boolean | null;
    actualisationDate: string;
    agent: AsariUserOrAgentInfo;
    agentsDescription: string | null;
    availableNeighborhoodList: string[] | null;
    communicationList: string[] | null;
    companyName: string;
    contractType: string | null;
    country: AsariCountry;
    dateCreated: string;
    description: string | null;
    dividingPossibility?: boolean | null;
    drivewayType?: string | null;
    electricityStatus?: string | null;
    encloseType?: string | null;
    englishDescription: string | null;
    gasStatus?: string | null;
    generatedDescription: string | null;
    groundOwnershipType?: string | null;
    headerAdvertisement: string;
    issuedBuildingConditions?: boolean | null;
    localPlan?: string | null;
    location: AsariLocationInfo;
    lotArea?: number | null;
    lotForm?: string | null;
    lotShape?: string | null;
    lotType?: string | null;
    overallHeight?: number | null;
    parentListing: AsariParentListingInfo | null;
    parentListingId: number | null;
    plotDimension?: string | null;
    possibleDevelopmentPercent?: number | null;
    price: AsariAmountCurrency | null;
    priceM2: AsariAmountCurrency | null;
    privateDescription: string | null;
    process: unknown | null;
    provisionAmount?: number | null;
    section: string;
    sewerageTypeList?: string[] | null;
    status: string;
    urbanCo?: boolean | null;
    vacantFromDate: string | null;
    videoUrl: string | null;
    virtualTourUrl: string | null;
    waterTypeList?: string[] | null;
    zoningPlan?: string[] | null;
    companyId: number;
    mlsId: string | null;
    swoId: string | null;
    sectionName: string;
    geoLat?: number | null;
    geoLng?: number | null;
    street: AsariStreetInfo | null;
    foreignStreet: string | null;
    foreignLocation: string | null;
    directContract: boolean | null;
    ownershipType: string | null;
    sharedOwnership: string | null;
    groundSharedOwnership: string | null;
    isSpecial: boolean;
    prevPrice: AsariAmountCurrency | null;
    changePriceDate: string | null;
    priceBeforeReduction: AsariAmountCurrency | null;
    lastUpdated: string;
    exportDateCreated: string | null;
    user: AsariUserOrAgentInfo;
    statusChangeDate: string;
    images: AsariImageInfo[];
    licenceNumber: string | null; // Również na głównym poziomie
    russianDescription: string | null;
    // parentListingId: number | null; // Już jest wyżej
    promoStampId: number | null;
    defaultStampId: number | null;
    pendingStampId: number | null;
    pendingReason: string | null;
    cancelledDate?: string | null;
    acceptance: boolean;
    exchange: boolean;
    totalArea: number | null; // Dla działki lotArea, dla mieszkania/domu totalArea
    totalAreaTo: number | null;
    lotAreaUnit?: string | null;
    ownListing: boolean;
    swoPackage: string | null;
    label: string | null;
    geoportalCode: string | null;
    energyCertificateState: string | null;
    usableEnergy: number | null;
    finalEnergy: number | null;
    primaryEnergy: number | null;
    emissionCO2: number | null;
    renewableEnergyShare: number | null;
    extUser1: string | null;
    extUser2: string | null;
    updatedBy: AsariUserOrAgentInfo;
    createdBy: AsariUserOrAgentInfo;
    nestedListings: AsariNestedListingInfo[] | null; // W JSON było [], co jest zgodne z Array | null
    frDescription: string | null;
    ltDescription: string | null;
    lvDescription: string | null;
    etDescription: string | null;
    esDescription: string | null;
    deDescription: string | null;
    itDescription: string | null;
    ukDescription: string | null;
    zhDescription: string | null;
  
    administrativeRent?: AsariAmountCurrency | null;
    apartmentTypeList?: string[]; // Było w JSONie dla mieszkania
    buildingType?: string; // Było w JSONie dla mieszkania
    condition?: string; // Było dla mieszkania "DevelopmentState"
    elevator?: boolean; // Było
    floorNo?: number; // Było
    noOfFloors?: number; // Było
    noOfRooms?: number; // Było
    heatingTypeList?: string[]; // Było
    hotWaterList?: string[]; // Było
    intercom?: boolean; // Było
    kitchenType?: string; // Było
    material?: string; // Było
    mortgageMarket?: string; // Było
    status_id?: number; // Jest status jako string
    internal_comment?: string; // Nie ma w tym JSONie
    price_currency_id?: number; // Jest w price.currency
    transaction_type_id?: number; // Nie ma w tym JSONie
    market_type_id?: number; // Jest mortgageMarket jako string
  }
  
  export interface ListingDetailsApiResponse {
    success: boolean;
    data: AsariListingDetail;
  }
  
  // Możesz też tu przenieść typy dla i18nMessages, jeśli chcesz
  // export interface I18nMessagesApiResponse {
  //   [key: string]: string;
  // }