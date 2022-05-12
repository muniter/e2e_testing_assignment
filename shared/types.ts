export interface ScenarioInformation {
  name: string,
  path: string,
  step: number,
  report: string,
}

export interface KrakenReportFormat {
  elements: Array<{
    keyword: string,
    name: string,
    steps: Array<{
      name: string,
      keyword: string,
      embeddings: Array<{ mime_type: string, data: string }>
    }>
  }>
}

export interface Report {
  prev: TestSuiteReportFormat,
  post: TestSuiteReportFormat,
  diff?: TestSuiteReportFormat,
}

// Each test suite produces one like this
export interface TestSuiteReportFormat {
  version: string,
  scenarios: Array<ScenarioReportFormat>,
}

export interface ScenarioStep {
  name: string,
  image: string,
  base64?: boolean,
  data?: Record<string, any>,
}

// Each scenario produces one of this
export interface ScenarioReportFormat {
  name: string,
  file: string,
  steps: Array<ScenarioStep>
}


