const { DynamicFlowBuilder } = require('../src/core/DynamicFlowBuilder');

// Example flow matching the exact JSON format you provided
const flow = DynamicFlowBuilder.create('MaharashtraServices')
  .routing({
    "WELCOME": ["SERVICES", "CHECK_APPLICATION_STATUS"],
    "SERVICES": ["CHECK_APPLICATION_STATUS"],
    "CHECK_APPLICATION_STATUS": []
  })
  .screen("WELCOME", "Welcome", {
    screenDescription: { type: "string", __example__: "Welcome To Maharashtra" },
    LSearch: { type: "string", __example__: "Search " },
    HelperSearch: { type: "string", __example__: "Enter service you want to search." },
    LabelKeywords: { type: "string", __example__: "Keywords" },
    LabelKeywordsText: { type: "string", __example__: "Enter relevant keywords to search for a service." },
    LabelDepartmentText: { type: "string", __example__: "Find a service by choosing related department." },
    LabelDepartment: { type: "string", __example__: "Department" },
    LabelSearch: { type: "string", __example__: "Search By" },
    embeddedLabel: { type: "string", __example__: "Search" },
    LDepartment: { type: "string", __example__: "Select Service" },
    departmentList: { 
      type: "array", 
      __example__: [
        { id: "Aaple Sarkar", title: "Aaple Sarkar" },
        { id: "MSEB", title: "MSEB" },
        { id: "Metro Ticket", title: "Metro Ticket" },
        { id: "MNC", title: "MNC" },
        { id: "Temple", title: "Temple" },
        { id: "Notification", title: "Notification" },
        { id: "FAQ", title: "FAQ" }
      ]
    },
    LFooter: { type: "string", __example__: "Submit" },
    isFooterEnabled: { type: "boolean", __example__: false },
    LServiceList: { type: "string", __example__: "Services" },
    fuzzyServiceList: { 
      type: "array", 
      __example__: [
        { id: "marriageCertificate", title: "Marriage Certificate", description: " 1", metadata: " 1" }
      ]
    },
    RServiceList: { type: "boolean", __example__: false },
    VServiceList: { type: "boolean", __example__: false },
    extraDetails: { type: "string", __example__: "" },
    LApplicantChoiceToProceed: { type: "string", __example__: "Proceed With" },
    dataSourceApplicantChoice: { 
      type: "array", 
      __example__: [
        { id: "ApplyNew", title: "Apply New Certificate" },
        { id: "CheckApplicationStatus", title: "Check Application Status" }
      ]
    },
    VApplicantChoice: { type: "boolean", __example__: false }
  }, true, true)
  .image(400, 100)
  .text("${data.screenDescription}", "TextSubheading")
  .input("OSearchBy", "${data.LabelSearch}", "radio", {
    dataSource: [
      { id: "service", title: "${data.LabelKeywords}", description: "${data.LabelKeywordsText}" },
      { id: "department", title: "${data.LabelDepartment}", description: "${data.LabelDepartmentText}" }
    ],
    required: true,
    "init-value": "service"
  })
  .switch("${form.OSearchBy}", {
    service: [
      {
        type: "TextInput",
        label: "${data.LSearch}",
        name: "OSearch",
        "min-chars": 3,
        "helper-text": "${data.HelperSearch}",
        required: true
      },
      {
        type: "EmbeddedLink",
        text: "${data.embeddedLabel}",
        "on-click-action": {
          name: "data_exchange",
          payload: {
            OSearch: "${form.OSearch}",
            OService: "${form.OService}",
            OSelectDepartment: "${form.OSelectDepartment}",
            onSelectAction: "search-clicked",
            extraDetails: "${data.extraDetails}"
          }
        }
      },
      {
        type: "Dropdown",
        label: "${data.LServiceList}",
        name: "OService",
        "data-source": "${data.fuzzyServiceList}",
        required: true,
        visible: "${data.VServiceList}",
        "on-select-action": {
          name: "data_exchange",
          payload: {
            OSearch: "${form.OSearch}",
            OService: "${form.OService}",
            OSelectDepartment: "${form.OSelectDepartment}",
            onSelectAction: "search-service-selected",
            extraDetails: "${data.extraDetails}"
          }
        }
      }
    ],
    department: [
      {
        type: "RadioButtonsGroup",
        label: "${data.LDepartment}",
        name: "OSelectDepartment",
        "data-source": "${data.departmentList}",
        required: true,
        "on-select-action": {
          name: "data_exchange",
          payload: {
            OSearch: "${form.OSearch}",
            OService: "${form.OService}",
            OSelectDepartment: "${form.OSelectDepartment}",
            onSelectAction: "service-selected",
            extraDetails: "${data.extraDetails}"
          }
        }
      }
    ]
  })
  .input("OApplicantChoiceToProceed", "${data.LApplicantChoiceToProceed}", "radio", {
    dataSource: "${data.dataSourceApplicantChoice}",
    required: "${data.VApplicantChoice}",
    visible: "${data.VApplicantChoice}"
  })
  .footer("${data.LFooter}", "data_exchange", {
    OSearch: "${form.OSearch}",
    OService: "${form.OService}",
    OSelectDepartment: "${form.OSelectDepartment}",
    extraDetails: "${data.extraDetails}",
    onSelectAction: "footer-selected",
    OSearchBy: "${form.OSearchBy}",
    OApplicantChoiceToProceed: "${form.OApplicantChoiceToProceed}"
  }, { enabled: "${data.isFooterEnabled}" })

  // SERVICES SCREEN
  .screen("SERVICES", "${data.screenName}", {
    LApplicantChoiceToProceed: { type: "string", __example__: "Proceed With" },
    dataSourceApplicantChoice: { 
      type: "array", 
      __example__: [
        { id: "ApplyNew", title: "Apply New Certificate" },
        { id: "CheckApplicationStatus", title: "Check Application Status" }
      ]
    },
    VApplicantChoice: { type: "boolean", __example__: false },
    LabelFooterServices: { type: "string", __example__: "Proceed" },
    LabelServiceCategory: { type: "string", __example__: "Service Category" },
    ListServiceCategory: { 
      type: "array", 
      __example__: [
        { id: "Citizen Services", title: "Citizen Services", enabled: true },
        { id: "Track your application", title: "Track your application", enabled: true },
        { id: "Verify your authorized certificate", title: "Verify your authorized certificate", enabled: true },
        { id: "Digi Locker", title: "Digi Locker", enabled: true }
      ]
    },
    LabelDepartment: { type: "string", __example__: "Department" },
    ListDepartment: { 
      type: "array", 
      __example__: [
        { id: "Agriculture Department", title: "Agriculture Department", enabled: false },
        { id: "Home Department", title: "Home Department", enabled: false }
      ]
    },
    VisibilityDepartment: { type: "boolean", __example__: true },
    LabelService: { type: "string", __example__: "Service" },
    ListService: { 
      type: "array", 
      __example__: [
        { id: "Agriculture - VidyaPeeth and APEDA Service", title: "Agriculture - VidyaPeeth and APEDA Service", enabled: false },
        { id: "Duplicate Migration Services", title: "Duplicate Migration Services", enabled: false },
        { id: "Testing of Pesticide residue", title: "Testing of Pesticide residue", enabled: false }
      ]
    },
    RequiredDepartment: { type: "boolean", __example__: true },
    RequiredService: { type: "boolean", __example__: true },
    VisibilityService: { type: "boolean", __example__: true },
    LabelSubService: { type: "string", __example__: "Sub Service" },
    ListSubService: { 
      type: "array", 
      __example__: [
        { id: "Agriculture - VidyaPeeth and APEDA Service", title: "Agriculture - VidyaPeeth and APEDA Service", enabled: false },
        { id: "Duplicate Migration", title: "Duplicate Migration", enabled: false },
        { id: "Services Testing of Pesticide residue", title: "Services Testing of Pesticide residue", enabled: false }
      ]
    },
    RequiredSubService: { type: "boolean", __example__: true },
    VisiblitySubService: { type: "boolean", __example__: true },
    LabelUserInput: { type: "string", __example__: "Application ID" },
    RequiredUserInput: { type: "boolean", __example__: true },
    VisibilityUserInput: { type: "boolean", __example__: true },
    minCUserInput: { type: "number", __example__: 22 },
    maxCUserInput: { type: "number", __example__: 40 },
    EnableFooter: { type: "boolean", __example__: true },
    extraDetails: { type: "string", __example__: "" },
    screenName: { type: "string", __example__: "Services" },
    textBody: { type: "string", __example__: "Services" },
    VisibilityCategory: { type: "boolean", __example__: true }
  }, true)
  .image(100, 100)
  .text("${data.textBody}", "TextBody", { markdown: true })
  .input("OServiceCategory", "${data.LabelServiceCategory}", "dropdown", {
    dataSource: "${data.ListServiceCategory}",
    required: "${data.VisibilityCategory}",
    visible: "${data.VisibilityCategory}",
    "on-select-action": {
      name: "data_exchange",
      payload: {
        extraDetails: "${data.extraDetails}",
        SERVICES: "${screen.SERVICES.form}",
        WELCOME: "${screen.WELCOME.form}",
        onSelectAction: "service-category-selected",
        OSelectDepartment: "${screen.WELCOME.form.OSelectDepartment}"
      }
    }
  })
  .input("ODepartment", "${data.LabelDepartment}", "dropdown", {
    dataSource: "${data.ListDepartment}",
    required: "${data.RequiredDepartment}",
    visible: "${data.VisibilityDepartment}",
    "on-select-action": {
      name: "data_exchange",
      payload: {
        extraDetails: "${data.extraDetails}",
        SERVICES: "${screen.SERVICES.form}",
        onSelectAction: "service-department-selected",
        WELCOME: "${screen.WELCOME.form}"
      }
    }
  })
  .input("OService", "${data.LabelService}", "dropdown", {
    dataSource: "${data.ListService}",
    required: "${data.RequiredService}",
    visible: "${data.VisibilityService}",
    "on-select-action": {
      name: "data_exchange",
      payload: {
        extraDetails: "${data.extraDetails}",
        SERVICES: "${screen.SERVICES.form}",
        onSelectAction: "service-selected",
        WELCOME: "${screen.WELCOME.form}"
      }
    }
  })
  .input("OSubService", "${data.LabelSubService}", "dropdown", {
    dataSource: "${data.ListSubService}",
    required: "${data.RequiredSubService}",
    visible: "${data.VisiblitySubService}",
    "on-select-action": {
      name: "data_exchange",
      payload: {
        extraDetails: "${data.extraDetails}",
        SERVICES: "${screen.SERVICES.form}",
        onSelectAction: "sub-service-selected",
        WELCOME: "${screen.WELCOME.form}"
      }
    }
  })
  .input("UserInput", "${data.LabelUserInput}", "text", {
    required: "${data.RequiredUserInput}",
    visible: "${data.VisibilityUserInput}",
    "min-chars": 12,
    "max-chars": 20
  })
  .input("OApplicantChoiceToProceed", "${data.LApplicantChoiceToProceed}", "radio", {
    dataSource: "${data.dataSourceApplicantChoice}",
    required: "${data.VApplicantChoice}",
    visible: "${data.VApplicantChoice}"
  })
  .footer("Submit", "data_exchange", {
    OServiceCategory: "${form.OServiceCategory",
    ODepartment: "${form.ODepartment}",
    OService: "${form.OService}",
    OSubService: "${form.OSubService}",
    OApplicantChoiceToProceed: "${form.OApplicantChoiceToProceed}",
    UserInput: "${form.UserInput}",
    extraDetails: "${data.extraDetails}",
    SERVICES: "${screen.SERVICES.form}",
    WELCOME: "${screen.WELCOME.form}"
  }, { enabled: "${data.EnableFooter}" })

  // CHECK_APPLICATION_STATUS SCREEN
  .screen("CHECK_APPLICATION_STATUS", "${data.checkApplicationStatusScreenName}", {
    EnableFooter: { type: "boolean", __example__: true },
    checkApplicationStatusScreenName: { type: "string", __example__: "Check Application Status" },
    screenDescription: { type: "string", __example__: "Check Application Status For -=- Certificate" },
    LApplicationList: { type: "string", __example__: "Application List" },
    dataSourceApplicationList: { 
      type: "array", 
      __example__: [
        { id: "123456789", title: "Application Id 1" },
        { id: "1234567890", title: "Application Id 2" }
      ]
    },
    VApplicationList: { type: "boolean", __example__: true },
    applicantionStatus: { type: "string", __example__: "**Application Status**" },
    LFooter: { type: "string", __example__: "Complete" },
    extraDetails: { type: "string", __example__: "" }
  }, true)
  .text("${data.screenDescription}", "TextSubheading")
  .input("OApplicationList", "${data.LApplicationList}", "dropdown", {
    dataSource: "${data.dataSourceApplicationList}",
    required: true,
    visible: "${data.VApplicationList}",
    "on-select-action": {
      name: "data_exchange",
      payload: {
        OApplicationList: "${form.OApplicationList}",
        onSelectAction: "application-id-selected",
        extraDetails: "${data.extraDetails}"
      }
    }
  })
  .text("${data.applicantionStatus}", "TextBody", { markdown: true })
  .footer("${data.LFooter}", "data_exchange", {
    OApplicationList: "${form.OApplicationList}",
    extraDetails: "${data.extraDetails}",
    SERVICES: "${screen.SERVICES.form}",
    WELCOME: "${screen.WELCOME.form}"
  }, { enabled: "${data.EnableFooter}" });

// Export the flow
module.exports = flow.build();

// Also export the builder for customization
module.exports.builder = flow;
